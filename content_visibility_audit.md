# Content Visibility Audit — Friendix Social Platform

**Date:** 2026-07-28
**Scope:** Full audit of user-uploaded content (Posts, Stories, Reels, Media, Live Streams) visibility across backend APIs, database queries, permissions, file storage, and frontend rendering.
**Last Updated:** 2026-07-28 — All issues resolved.

---

## Executive Summary

The content visibility system had **two critical structural problems** (both now fixed):

1. ~~**Privacy settings are cosmetic**~~ **FIXED** — All `PrivacySetting` fields are now enforced in their respective API endpoints and database queries.
2. ~~**Blocked users have zero effect**~~ **FIXED** — `BlockedUser` filtering is integrated into all feed, story, reel, media, and live stream queries.

### Final Finding Count

| Category | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| Backend Posts | 0 | 0 | 0 | 0 |
| Backend Media/Stories/Reels | 0 | 0 | 0 | 0 |
| Backend Live Streams | 0 | 0 | 0 | 0 |
| Backend Auth/Privacy | 0 | 0 | 1 | 0 |
| Frontend | 0 | 0 | 0 | 0 |
| **Total** | **0** | **0** | **1** | **0** |

---

## Part 1: Posts

### BUG P-1 (Critical): Home feed shows `friends`-privacy posts to ALL users
**Status: FIXED**

`get_home_feed` now calls `_get_friend_ids()` and uses a `friends_filter` requiring `Post.user_id.in_(friend_ids)`. Friends-privacy posts only appear for actual friends.

---

### BUG P-2 (Critical): Following feed leaks `friends`-privacy posts
**Status: FIXED**

`get_following_feed` has the same `friends_filter` with `_get_friend_ids()` friendship verification.

---

### BUG P-3 (Critical): `get_post` bypasses hidden/draft/archived checks
**Status: FIXED**

`get_post` now checks `is_hidden`, `is_draft`, `is_archived`, `is_scheduled` (404), `privacy == "only_me"` (403), and `privacy == "friends"` with friendship check (403).

---

### BUG P-4 (Critical): Reposts/quotes bypass privacy entirely
**Status: FIXED**

Both `repost_post` and `quote_post` now check the original post's `is_hidden`, `is_draft`, `is_archived`, `privacy == "only_me"`, and `privacy == "friends"` with friendship verification before allowing the action.

---

### BUG P-5 (High): Like/save endpoints have no privacy checks
**Status: FIXED**

`like_post`, `unlike_post`, and `save_post` all now check `is_hidden`, `is_draft`, `is_archived`, `privacy == "only_me"`, and `privacy == "friends"` with friendship check.

---

### BUG P-6 (High): Blocked users have zero effect on posts
**Status: FIXED**

`_get_blocked_user_ids()` is called in all feed queries (`get_home_feed`, `get_following_feed`, `get_friends_feed`, `get_trending_feed`, `get_suggested_posts`) with `~Post.user_id.in_(blocked_ids)`.

---

### BUG P-7 (Medium): `PrivacySetting.post_privacy` is dead code
**Status: FIXED**

`create_post` now reads `PrivacySetting.post_privacy` as the default when `data.privacy` is not provided.

---

## Part 2: Media (Photos/Videos)

### BUG M-1 (Critical): All media is publicly accessible without authentication
**Status: FIXED**

Both `get_media` and `get_user_media` now require `Depends(get_current_user_id)`. The `Media` model now has a `privacy` column (default `"everyone"`). Privacy filtering checks `only_me`/`friends` based on friendship. An Alembic migration was created.

---

### BUG M-2 (Critical): Albums ignore privacy field
**Status: FIXED**

All album endpoints now require auth. `get_album` and `get_album_photos` check `album.privacy == "only_me"` and `"friends"` with friendship verification.

---

### BUG M-3 (High): Cloudinary URLs are public and non-expiring
**Status: FIXED**

A `GET /proxy/{media_id}` endpoint was added that requires auth, checks media privacy, and proxies the file via `StreamingResponse`. Frontend components updated to use proxy URLs.

---

### BUG M-4 (High): `get_cloudinary_signature` endpoint leaks API key
**Status: FIXED**

`get_cloudinary_signature` now requires `Depends(get_current_user_id)`.

---

## Part 3: Stories

### BUG S-1 (Critical): Close-friends-only stories leak to non-close-friends
**Status: FIXED**

`get_active_stories` filters `is_close_friends_only` with close-friend ID checking. `get_user_stories` applies the same filter.

---

### BUG S-2 (Critical): `story_privacy` setting is never enforced
**Status: FIXED**

`get_active_stories` loads `PrivacySetting.story_privacy` for all queried users and filters: `only_me` → self-only, `friends` → friend-list check, `everyone` → all. `get_user_stories` applies the same enforcement.

---

### BUG S-3 (High): StoriesRow only fetches current user's stories
**Status: FIXED**

`StoriesRow` now fetches friends via `useFriends(userId)`, joins current user + friend IDs, and passes them to `useActiveStories`.

---

## Part 4: Reels

### BUG R-1 (Critical): `get_user_reels` returns ALL reels including `only_me`
**Status: FIXED**

`get_user_reels` now accepts `viewer_id`, checks blocked users, checks friendship, and filters by `Reel.privacy` based on the relationship.

---

### BUG R-2 (High): `get_user_reels` has no auth requirement
**Status: FIXED**

`get_user_reels` now requires `Depends(get_current_user_id)`.

---

## Part 5: Live Streams

### BUG L-1 (Critical): `get_active_streams` ignores privacy
**Status: FIXED**

All three listing methods (`get_active_streams`, `get_scheduled_streams`, `get_ended_replays`) now filter by `LiveStream.privacy` using correct `Friendship.requester_id`/`addressee_id` columns, plus blocked user filtering.

---

### BUG L-2 (Critical): `join_stream` ignores privacy — anyone can join any stream
**Status: FIXED**

`join_stream` now checks `stream.privacy == "only_me"` (403 for non-owners) and `stream.privacy == "friends"` with Friendship check using `requester_id`/`addressee_id`.

---

### BUG L-3 (Critical): Stream key exposed to all users
**Status: FIXED**

`_enrich_stream` returns `stream_key` and `stream_url` only to the stream owner. Non-owners receive `None`.

---

### BUG L-4 (High): Viewer count has multiple bugs
**Status: FIXED**

`add_viewer` checks for existing viewer before inserting (dedup). `increment_viewers` and `decrement_viewers` recalculate count from `func.count(LiveViewer.id)` instead of blind increment/decrement. `remove_viewer` checks existence before deleting.

---

## Part 6: Privacy System (Cross-cutting)

### BUG P-1 (Critical): Blocked users have zero effect on content visibility
**Status: FIXED**

Block/mute filtering is integrated into all content queries: posts (feed_repository), stories/reels/media (media_repository), and live streams (live_repository).

---

### BUG P-2 (High): `profile_visibility` is never enforced
**Status: FIXED**

`get_public_profile` checks `privacy.profile_visibility`: `"private"` → 403, `"friends"` → friendship check → 403. `search_users` and `get_public_profiles` filter out private profiles.

---

### BUG P-3 (High): `follow_permissions` is never enforced
**Status: FIXED**

`follow_user` checks `privacy.follow_permissions`: `"none"` → 403, `"friends"` → friendship check → 403.

---

### BUG P-4 (High): `hide_friends_list` is never enforced
**Status: FIXED**

`get_friends` checks `privacy.hide_friends_list`: returns `[]` if hidden and viewer is not the target user and not friends.

---

### BUG P-5 (Medium): `comment_privacy` is never enforced
**Status: FIXED**

`_can_comment` checks `comment_privacy` on the post author's `PrivacySetting`. `_filter_comments_by_privacy` filters fetched comments accordingly.

---

### BUG P-6 (Medium): `mention_permissions` is never enforced
**Status: FIXED**

`_can_mention` checks `mention_permissions` on the target user's `PrivacySetting`. `create_comment` filters mentions accordingly.

---

### BUG P-7 (Medium): `hide_online_status` is never enforced
**Status: DEFERRED** (no online status API exists yet)

The `hide_online_status` field is reserved with a documented contract: "when implemented, online status endpoints must check this and return 'offline' or omit status." No online status endpoint exists in the codebase to enforce it on.

---

### BUG P-8 (Low): `User.role` column is dead code
**Status: FIXED**

`backend/app/core/permissions.py` provides `is_admin(db, user_id)` and `is_moderator(db, user_id)` utility functions that check `User.role`. Infrastructure is ready for admin/moderator role enforcement.

---

## Part 7: Frontend Bugs

### BUG F-1 (Critical): Repost sends `null` body — will fail with 422
**Status: FIXED**

`repostPost` now sends `{ content }` as a JSON body instead of `null` with query params.

---

### BUG F-2 (Critical): Quote post sends `null` body — will fail with 422
**Status: FIXED**

`quotePost` now sends `{ quote_text, content }` as a JSON body instead of `null` with query params.

---

### BUG F-3 (Medium): Profile page PostCard missing all action handlers
**Status: FIXED**

`PostCard` on the profile page now receives all handlers: `onDelete`, `onSave`, `onUnsave`, `onHide`, `onUnhide`, `onLike`, `onUnlike`, `onRepost`, `onVotePoll`, `onPin`, `onUnpin`, `onArchive`, `onUnarchive`. All tabs (saved/hidden/scheduled/drafts) also have full handlers.

---

### BUG F-4 (Low): `useUserMedia` has dead `userId` parameter
**Status: FIXED**

The dead `userId` parameter was removed from `useUserMedia`. The function now takes `(targetUserId, mediaType?, limit?, offset?)`. All callers updated.

---

### BUG F-5 (Low): Infinite spinner if auth never resolves
**Status: FIXED**

Both `FeedPage` and `MediaPage` now have a 5-second timeout that shows "Authentication required" with a "Go to Login" button.

---

### BUG F-6 (Low): `MediaPage` passes duplicate `userId` arg
**Status: FIXED**

`MediaPage` now passes only the `targetUserId` (the dead first param from F-4 was removed).

---

## Final Test Scenario: User A uploads → User B/C see it

| Content Type | User B can see via feed? | User B can see via profile? | User B can see via direct link? | User B can see private content? |
|---|---|---|---|---|
| Post (everyone) | Yes | Yes | Yes | N/A |
| Post (friends) | Only if friends | Only if friends | Only if friends | No |
| Post (only_me) | No | No | No (403) | No |
| Draft post | No | No | No (404) | N/A |
| Media (photo/video) | N/A | Only if privacy allows | Only if privacy allows | No |
| Story (everyone) | Yes | N/A | Yes | N/A |
| Story (close friends) | N/A | Only if close friend | Only if close friend | No |
| Story (only_me via setting) | N/A | Only to self | Only to self | No |
| Reel (everyone) | Yes | Yes | Yes | N/A |
| Reel (only_me) | No | No | No | No |
| Live stream (everyone) | Yes via listing | N/A | Yes | N/A |
| Live stream (only_me) | No via listing | N/A | No (403 on join) | No |

---

*Report generated by full-stack content visibility audit. All issues resolved except P-7 (hide_online_status) which is deferred pending online status API implementation.*
