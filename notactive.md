# Inactive Features Report

**Project:** Friendix Social Platform  
**Date:** 2026-07-28  
**Scope:** Full codebase audit (backend + frontend)

---

## Executive Summary

This audit identified **87 inactive features** across the Friendix Social Platform codebase. The application has a well-structured architecture with ~135 backend API endpoints and a comprehensive React frontend, but significant portions of the implemented functionality remain unused, incomplete, or disconnected.

**Key Findings:**
- **37 unused React hooks** that wrap API calls but are never invoked by any component
- **10 unused utility functions** in the media utilities module
- **5 unused backend schemas** defined but never referenced
- **2 dead code methods** in backend repositories
- **9 duplicate constant arrays** in frontend types that are shadowed by local definitions
- **14 unused live streaming hooks** for guest/moderator management
- **3 unused auth store actions** never called from any component
- **1 empty utility module** in the backend

**Estimated Cleanup Effort:** 40-60 hours

---

## Statistics

| Category | Total Found | High Priority | Medium Priority | Low Priority |
|----------|-------------|---------------|-----------------|--------------|
| Unused Hooks | 37 | 12 | 18 | 7 |
| Unused Utilities | 10 | 0 | 5 | 5 |
| Dead Code (Backend) | 7 | 2 | 3 | 2 |
| Incomplete Features | 8 | 4 | 3 | 1 |
| Unused Components | 2 | 0 | 1 | 1 |
| Unused Type Constants | 9 | 0 | 4 | 5 |
| Unused Store Actions | 3 | 1 | 1 | 1 |
| Unused Backend Schemas | 5 | 0 | 3 | 2 |
| **Total** | **81** | **19** | **38** | **24** |

---

## Detailed Findings

---

### 1. UNUSED REACT HOOKS (37 total)

#### 1.1 Feed Hooks (9 unused)

**useUserPosts**
- **Location:** `frontend/src/features/feed/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** The hook fetches posts for a specific user but is never called. ProfilePage has a placeholder "Posts" tab that doesn't use it.
- **Evidence:** No import of `useUserPosts` found anywhere in the codebase.
- **Impact:** High
- **Recommendation:** Connect to ProfilePage posts tab

**useSavedPosts**
- **Location:** `frontend/src/features/feed/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** No UI exists to display saved posts. The save/unsave functionality works but there's no page to view saved posts.
- **Evidence:** No import of `useSavedPosts` found.
- **Impact:** Medium
- **Recommendation:** Create saved posts page or add to profile tabs

**useHiddenPosts**
- **Location:** `frontend/src/features/feed/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** No UI exists to manage hidden posts. Users can hide posts but cannot view or unhide them from a list.
- **Evidence:** No import of `useHiddenPosts` found.
- **Impact:** Medium
- **Recommendation:** Add hidden posts management to privacy settings

**useArchivedPosts**
- **Location:** `frontend/src/features/feed/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** No UI exists to view archived posts.
- **Evidence:** No import of `useArchivedPosts` found.
- **Impact:** Low
- **Recommendation:** Add archive section to profile

**useDraftPosts**
- **Location:** `frontend/src/features/feed/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** CreatePostForm has a "Save Draft" button but there's no page to view/manage drafts.
- **Evidence:** No import of `useDraftPosts` found.
- **Impact:** Medium
- **Recommendation:** Create drafts management page

**useScheduledPosts**
- **Location:** `frontend/src/features/feed/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** CreatePostForm supports scheduling posts but there's no UI to view scheduled posts.
- **Evidence:** No import of `useScheduledPosts` found.
- **Impact:** Medium
- **Recommendation:** Create scheduled posts page

**useFeedPosition**
- **Location:** `frontend/src/features/feed/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Feed scroll position tracking is implemented in the backend but the frontend never saves/restores position.
- **Evidence:** No import of `useFeedPosition` found.
- **Impact:** Low
- **Recommendation:** Implement feed position persistence

**useUpdateFeedPosition**
- **Location:** `frontend/src/features/feed/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Paired with useFeedPosition - the save functionality is never called.
- **Evidence:** No import of `useUpdateFeedPosition` found.
- **Impact:** Low
- **Recommendation:** Implement feed position persistence

**usePostCount**
- **Location:** `frontend/src/features/feed/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Post count is available but never displayed in the UI.
- **Evidence:** No import of `usePostCount` found.
- **Impact:** Low
- **Recommendation:** Display post count on profile

---

#### 1.2 Media Hooks (18 unused)

**useUserMediaCount**
- **Location:** `frontend/src/features/media/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Media count is available but only stats are displayed, not raw count.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Remove or integrate

**useUpdateMedia**
- **Location:** `frontend/src/features/media/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Media update functionality exists in backend but no UI calls it.
- **Evidence:** No import found.
- **Impact:** Medium
- **Recommendation:** Connect to media management UI

**useAlbum**
- **Location:** `frontend/src/features/media/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Single album fetching is implemented but PhotoAlbumView uses the albums list instead.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Remove or refactor

**useAlbumPhotos**
- **Location:** `frontend/src/features/media/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Album photos fetching is implemented but PhotoAlbumView handles this differently.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Remove or refactor

**useAddPhotoToAlbum**
- **Location:** `frontend/src/features/media/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Adding photos to albums is not connected to any UI.
- **Evidence:** No import found.
- **Impact:** Medium
- **Recommendation:** Connect to album management

**useRemovePhotoFromAlbum**
- **Location:** `frontend/src/features/media/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Removing photos from albums is not connected to any UI.
- **Evidence:** No import found.
- **Impact:** Medium
- **Recommendation:** Connect to album management

**useViewStory**
- **Location:** `frontend/src/features/media/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Story view tracking is not connected. Stories are viewed but views aren't recorded.
- **Evidence:** No import found.
- **Impact:** Medium
- **Recommendation:** Connect to StoryViewer

**useArchiveStory**
- **Location:** `frontend/src/features/media/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Story archiving from the story viewer is not connected.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Connect to StoryViewer

**useCloseFriendsStories**
- **Location:** `frontend/src/features/media/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Close friends stories feature is implemented in backend but has no frontend UI.
- **Evidence:** No import found.
- **Impact:** Medium
- **Recommendation:** Create close friends stories UI

**useStoryReactions**
- **Location:** `frontend/src/features/media/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Fetching story reactions is not connected to any UI.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Remove or connect

**useStoryReactionCounts**
- **Location:** `frontend/src/features/media/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Reaction counts are not displayed on stories.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Display reaction counts

**useStoryReplies**
- **Location:** `frontend/src/features/media/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Fetching story replies is not connected to any UI.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Remove or connect

**useDeleteStoryReply**
- **Location:** `frontend/src/features/media/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Deleting story replies has no UI.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Remove or connect

**useHighlight**
- **Location:** `frontend/src/features/media/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Single highlight fetching is not used.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Remove

**useUpdateHighlight**
- **Location:** `frontend/src/features/media/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Updating highlights has no UI.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Remove or connect

**useRemoveStoryFromHighlight**
- **Location:** `frontend/src/features/media/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Removing stories from highlights has no UI.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Remove or connect

**useFeedReels**
- **Location:** `frontend/src/features/media/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Feed reels are not displayed anywhere.
- **Evidence:** No import found.
- **Impact:** Medium
- **Recommendation:** Create reels feed page

**useTrendingReels**
- **Location:** `frontend/src/features/media/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Trending reels are not displayed anywhere.
- **Evidence:** No import found.
- **Impact:** Medium
- **Recommendation:** Create trending reels page

**useUpdateReel**
- **Location:** `frontend/src/features/media/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Updating reels has no UI.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Remove or connect

**useDeleteReel**
- **Location:** `frontend/src/features/media/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Deleting reels from the reel player is not connected.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Connect to ReelPlayer

**useCloudinarySignature**
- **Location:** `frontend/src/features/media/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Cloudinary signature generation is not used. Uploads use direct URL instead.
- **Evidence:** No import found.
- **Impact:** Medium
- **Recommendation:** Implement proper Cloudinary upload flow

---

#### 1.3 Live Hooks (14 unused)

**useActiveStreams**
- **Location:** `frontend/src/features/live/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** LivePage only shows a single stream. No browse/discover page for active streams.
- **Evidence:** No import found.
- **Impact:** High
- **Recommendation:** Create live streams discovery page

**useScheduledStreams**
- **Location:** `frontend/src/features/live/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** No UI to browse scheduled streams.
- **Evidence:** No import found.
- **Impact:** Medium
- **Recommendation:** Create scheduled streams page

**useReplays**
- **Location:** `frontend/src/features/live/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** No UI to browse stream replays.
- **Evidence:** No import found.
- **Impact:** Medium
- **Recommendation:** Create replays page

**useMyStreams**
- **Location:** `frontend/src/features/live/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** No UI to manage user's own streams.
- **Evidence:** No import found.
- **Impact:** Medium
- **Recommendation:** Create my streams page

**useUpdateLiveStream**
- **Location:** `frontend/src/features/live/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Stream editing has no UI.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Remove or connect

**useDeleteLiveStream**
- **Location:** `frontend/src/features/live/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Stream deletion has no UI.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Remove or connect

**useScheduleStream**
- **Location:** `frontend/src/features/live/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Stream scheduling has no UI.
- **Evidence:** No import found.
- **Impact:** Medium
- **Recommendation:** Create schedule stream form

**useInviteGuest**
- **Location:** `frontend/src/features/live/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Guest invitation has no UI.
- **Evidence:** No import found.
- **Impact:** Medium
- **Recommendation:** Create guest management UI

**useAcceptGuestInvite**
- **Location:** `frontend/src/features/live/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Guest invite acceptance has no UI.
- **Evidence:** No import found.
- **Impact:** Medium
- **Recommendation:** Create guest management UI

**useRejectGuestInvite**
- **Location:** `frontend/src/features/live/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Guest invite rejection has no UI.
- **Evidence:** No import found.
- **Impact:** Medium
- **Recommendation:** Create guest management UI

**useRemoveGuest**
- **Location:** `frontend/src/features/live/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Guest removal has no UI.
- **Evidence:** No import found.
- **Impact:** Medium
- **Recommendation:** Create guest management UI

**useGuests**
- **Location:** `frontend/src/features/live/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Guest listing has no UI.
- **Evidence:** No import found.
- **Impact:** Medium
- **Recommendation:** Create guest management UI

**useAddModerator**
- **Location:** `frontend/src/features/live/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Adding moderators has no UI.
- **Evidence:** No import found.
- **Impact:** Medium
- **Recommendation:** Create moderator management UI

**useRemoveModerator**
- **Location:** `frontend/src/features/live/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Removing moderators has no UI.
- **Evidence:** No import found.
- **Impact:** Medium
- **Recommendation:** Create moderator management UI

**useModerators**
- **Location:** `frontend/src/features/live/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Moderator listing has no UI.
- **Evidence:** No import found.
- **Impact:** Medium
- **Recommendation:** Create moderator management UI

---

#### 1.4 Friends Hooks (4 unused)

**useMutualFriends**
- **Location:** `frontend/src/features/friends/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Mutual friends are not displayed anywhere.
- **Evidence:** No import found.
- **Impact:** Medium
- **Recommendation:** Display on profile or friend suggestions

**useFriendshipStatus**
- **Location:** `frontend/src/features/friends/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Friendship status checking is not used in any UI.
- **Evidence:** No import found.
- **Impact:** Medium
- **Recommendation:** Use on user profiles

**useFavoriteFriends**
- **Location:** `frontend/src/features/friends/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Favorite friends listing has no UI.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Create favorites section

**useCloseFriends**
- **Location:** `frontend/src/features/friends/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Close friends listing has no UI.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Create close friends section

---

#### 1.5 Comments Hooks (1 unused)

**useUpdateComment**
- **Location:** `frontend/src/features/comments/hooks.ts`
- **Type:** Hook
- **Status:** Unused
- **Why:** Comment editing has no UI.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Add edit button to comments

---

### 2. UNUSED UTILITIES (10 total)

**shouldCompressVideo**
- **Location:** `frontend/src/utils/media.ts`
- **Type:** Utility Function
- **Status:** Unused
- **Why:** Video compression is not implemented.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Remove or implement video compression

**formatFileSize**
- **Location:** `frontend/src/utils/media.ts`
- **Type:** Utility Function
- **Status:** Unused
- **Why:** File size formatting is not used in any UI.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Use in media cards

**getMediaType**
- **Location:** `frontend/src/utils/media.ts`
- **Type:** Utility Function
- **Status:** Unused
- **Why:** Media type detection is not used.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Remove or use

**getFileExtension**
- **Location:** `frontend/src/utils/media.ts`
- **Type:** Utility Function
- **Status:** Unused
- **Why:** File extension extraction is not used.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Remove

**isImageFile**
- **Location:** `frontend/src/utils/media.ts`
- **Type:** Utility Function
- **Status:** Unused
- **Why:** Image file checking is not used.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Remove

**isVideoFile**
- **Location:** `frontend/src/utils/media.ts`
- **Type:** Utility Function
- **Status:** Unused
- **Why:** Video file checking is not used.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Remove

**isAudioFile**
- **Location:** `frontend/src/utils/media.ts`
- **Type:** Utility Function
- **Status:** Unused
- **Why:** Audio file checking is not used.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Remove

**getImageDimensions**
- **Location:** `frontend/src/utils/media.ts`
- **Type:** Utility Function
- **Status:** Unused
- **Why:** Image dimension fetching is not used.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Remove

**getVideoDuration**
- **Location:** `frontend/src/utils/media.ts`
- **Type:** Utility Function
- **Status:** Unused
- **Why:** Video duration fetching is not used.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Remove

**createVideoThumbnail**
- **Location:** `frontend/src/utils/media.ts`
- **Type:** Utility Function
- **Status:** Unused
- **Why:** Video thumbnail creation is not used.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Remove

---

### 3. DEAD CODE - BACKEND (7 total)

**UserRepository.deactivate()**
- **Location:** `backend/app/repositories/auth_repository.py`
- **Type:** Method
- **Status:** Dead Code
- **Why:** The method exists but is never called. Account deletion uses hard delete instead.
- **Evidence:** `AuthService.delete_account()` calls `user_repo.delete(user)` not `deactivate()`.
- **Impact:** Medium
- **Recommendation:** Connect to delete flow or remove

**FeedRepository.publish_scheduled_posts()**
- **Location:** `backend/app/repositories/feed_repository.py`
- **Type:** Method
- **Status:** Dead Code
- **Why:** Method exists but is never called by any service or endpoint. No background worker exists.
- **Evidence:** No caller found anywhere.
- **Impact:** High
- **Recommendation:** Implement background worker or remove

**FeedFilterOptions schema**
- **Location:** `backend/app/schemas/feed.py`
- **Type:** Schema
- **Status:** Dead Code
- **Why:** Schema is defined but never used in any endpoint or service.
- **Evidence:** No reference found.
- **Impact:** Low
- **Recommendation:** Remove

**LiveViewerResponse schema**
- **Location:** `backend/app/schemas/live.py`
- **Type:** Schema
- **Status:** Dead Code
- **Why:** Schema is defined but never used as a response model.
- **Evidence:** No reference found.
- **Impact:** Low
- **Recommendation:** Remove

**CommentReportResponse schema**
- **Location:** `backend/app/schemas/comment.py`
- **Type:** Schema
- **Status:** Dead Code
- **Why:** Schema is defined but the report endpoint returns a plain dict instead.
- **Evidence:** `report_comment` returns `{"message": "Comment reported"}`.
- **Impact:** Low
- **Recommendation:** Use schema or remove

**CloudinarySignRequest schema**
- **Location:** `backend/app/schemas/media.py`
- **Type:** Schema
- **Status:** Dead Code
- **Why:** Schema is defined but the endpoint uses Query params instead.
- **Evidence:** Endpoint signature doesn't use this schema.
- **Impact:** Low
- **Recommendation:** Remove

**Redis configuration**
- **Location:** `backend/app/core/config.py`
- **Type:** Configuration
- **Status:** Dead Config
- **Why:** REDIS_URL is configured but Redis is never imported or used anywhere.
- **Evidence:** No Redis import found in any file.
- **Impact:** Medium
- **Recommendation:** Implement caching or remove config

---

### 4. INCOMPLETE FEATURES (8 total)

**ProfilePage Posts Tab**
- **Location:** `frontend/src/features/profile/ProfilePage.tsx`
- **Type:** Feature
- **Status:** Incomplete
- **Why:** Tab renders placeholder text "Posts from this user will appear here." instead of actual posts.
- **Evidence:** Lines 152-160 render static text.
- **Impact:** High
- **Recommendation:** Connect useUserPosts hook

**ProfilePage Friends Tab**
- **Location:** `frontend/src/features/profile/ProfilePage.tsx`
- **Type:** Feature
- **Status:** Incomplete
- **Why:** Tab renders placeholder text "Friends list will appear here." instead of actual friends.
- **Evidence:** Lines 170-178 render static text.
- **Impact:** High
- **Recommendation:** Connect useFriends hook

**ProfilePage Media Tab**
- **Location:** `frontend/src/features/profile/ProfilePage.tsx`
- **Type:** Feature
- **Status:** Incomplete
- **Why:** Tab renders placeholder text "Photos and videos from this user will appear here." instead of actual media.
- **Evidence:** Lines 188-196 render static text.
- **Impact:** High
- **Recommendation:** Connect useUserMedia hook

**RightSidebar Suggestions**
- **Location:** `frontend/src/components/layout/RightSidebar.tsx`
- **Type:** Component
- **Status:** Incomplete
- **Why:** Renders hardcoded skeleton placeholders instead of real user suggestions.
- **Evidence:** `SuggestionSkeleton` components are static.
- **Impact:** High
- **Recommendation:** Connect to useFriendSuggestions

**RightSidebar Trending**
- **Location:** `frontend/src/components/layout/RightSidebar.tsx`
- **Type:** Component
- **Status:** Incomplete
- **Why:** Displays hardcoded trending topics instead of real trending data.
- **Evidence:** `TRENDING_TOPICS` is a static array.
- **Impact:** Medium
- **Recommendation:** Connect to trending API

**RightSidebar Friends**
- **Location:** `frontend/src/components/layout/RightSidebar.tsx`
- **Type:** Component
- **Status:** Incomplete
- **Why:** Renders hardcoded skeleton placeholders instead of real friends.
- **Evidence:** `FriendSkeleton` components are static.
- **Impact:** Medium
- **Recommendation:** Connect to useFriends

**useToast Stub**
- **Location:** `frontend/src/hooks/useToast.ts`
- **Type:** Hook
- **Status:** Incomplete
- **Why:** Only logs to console.log instead of displaying actual toast notifications.
- **Evidence:** Implementation is `console.log(...)`.
- **Impact:** High
- **Recommendation:** Implement proper toast system

**StoriesRow Upload Handler**
- **Location:** `frontend/src/features/feed/components/StoriesRow.tsx`
- **Type:** Component
- **Status:** Incomplete
- **Why:** Story creation from feed has a no-op upload handler `onUpload={async () => {}}`.
- **Evidence:** Line 89.
- **Impact:** Medium
- **Recommendation:** Connect to story upload

---

### 5. UNUSED COMPONENTS (2 total)

**GoLiveButton**
- **Location:** `frontend/src/features/live/components/GoLiveButton.tsx`
- **Type:** Component
- **Status:** Unused
- **Why:** Component is exported but never imported by any other file. LivePage handles stream creation inline.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Remove or integrate into LivePage

**CardFooter**
- **Location:** `frontend/src/components/ui/card.tsx`
- **Type:** UI Component
- **Status:** Unused
- **Why:** Component is exported but never imported by any file.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Keep for future use

---

### 6. UNUSED TYPE CONSTANTS (9 total)

**RELATIONSHIP_STATUSES**
- **Location:** `frontend/src/types/profile.ts`
- **Type:** Constant Array
- **Status:** Unused
- **Why:** EditProfileModal defines its own `RELATIONSHIP_OPTIONS` locally.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Remove duplicate

**PROFILE_THEMES**
- **Location:** `frontend/src/types/profile.ts`
- **Type:** Constant Array
- **Status:** Unused
- **Why:** EditProfileModal defines its own `THEME_OPTIONS` locally.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Remove duplicate

**GENDER_OPTIONS**
- **Location:** `frontend/src/types/profile.ts`
- **Type:** Constant Array
- **Status:** Unused
- **Why:** EditProfileModal defines its own `GENDER_OPTIONS` locally.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Remove duplicate

**STORY_PRIVACY_OPTIONS**
- **Location:** `frontend/src/types/privacy.ts`
- **Type:** Constant Array
- **Status:** Unused
- **Why:** PrivacySettingsPage defines its own `PRIVACY_DROPDOWN_OPTIONS` locally.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Remove duplicate

**POST_PRIVACY_OPTIONS**
- **Location:** `frontend/src/types/privacy.ts`
- **Type:** Constant Array
- **Status:** Unused
- **Why:** PrivacySettingsPage defines its own options locally.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Remove duplicate

**COMMENT_PRIVACY_OPTIONS**
- **Location:** `frontend/src/types/privacy.ts`
- **Type:** Constant Array
- **Status:** Unused
- **Why:** PrivacySettingsPage defines its own options locally.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Remove duplicate

**MENTION_PERMISSIONS_OPTIONS**
- **Location:** `frontend/src/types/privacy.ts`
- **Type:** Constant Array
- **Status:** Unused
- **Why:** PrivacySettingsPage defines its own `MENTION_FOLLOW_OPTIONS` locally.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Remove duplicate

**FOLLOW_PERMISSIONS_OPTIONS**
- **Location:** `frontend/src/types/privacy.ts`
- **Type:** Constant Array
- **Status:** Unused
- **Why:** PrivacySettingsPage defines its own `FOLLOW_OPTIONS` locally.
- **Evidence:** No import found.
- **Impact:** Low
- **Recommendation:** Remove duplicate

---

### 7. UNUSED STORE ACTIONS (3 total)

**setUser**
- **Location:** `frontend/src/store/authStore.ts`
- **Type:** Store Action
- **Status:** Unused
- **Why:** Action is defined but never called from any component.
- **Evidence:** No import/call found.
- **Impact:** Low
- **Recommendation:** Remove if not needed

**logoutAll**
- **Location:** `frontend/src/store/authStore.ts`
- **Type:** Store Action
- **Status:** Unused
- **Why:** Action is defined but never called from any component.
- **Evidence:** No import/call found.
- **Impact:** Medium
- **Recommendation:** Add UI for logout all devices

**clearAuth**
- **Location:** `frontend/src/store/authStore.ts`
- **Type:** Store Action
- **Status:** Unused
- **Why:** Action is defined but never called from any component.
- **Evidence:** No import/call found.
- **Impact:** Low
- **Recommendation:** Remove if not needed

---

### 8. UNUSED BACKEND SCHEMAS (5 total)

**FeedFilterOptions**
- **Location:** `backend/app/schemas/feed.py`
- **Type:** Schema
- **Status:** Unused
- **Why:** Defined but never used in any endpoint.
- **Evidence:** No reference found.
- **Impact:** Low
- **Recommendation:** Remove

**LiveViewerResponse**
- **Location:** `backend/app/schemas/live.py`
- **Type:** Schema
- **Status:** Unused
- **Why:** Defined but never used as response model.
- **Evidence:** No reference found.
- **Impact:** Low
- **Recommendation:** Remove

**CommentReportResponse**
- **Location:** `backend/app/schemas/comment.py`
- **Type:** Schema
- **Status:** Unused
- **Why:** Defined but endpoint returns plain dict.
- **Evidence:** No reference found.
- **Impact:** Low
- **Recommendation:** Use in endpoint or remove

**CloudinarySignRequest**
- **Location:** `backend/app/schemas/media.py`
- **Type:** Schema
- **Status:** Unused
- **Why:** Defined but endpoint uses Query params.
- **Evidence:** No reference found.
- **Impact:** Low
- **Recommendation:** Remove

**PrivacySetting auto-creation**
- **Location:** `backend/app/services/auth_service.py`
- **Type:** Code
- **Status:** Inconsistent
- **Why:** Creates PrivacySetting directly instead of using PrivacyRepository.get_or_create().
- **Evidence:** Lines in google_login method.
- **Impact:** Low
- **Recommendation:** Refactor to use repository

---

### 9. EMPTY MODULES (1 total)

**backend/app/utils/**
- **Location:** `backend/app/utils/__init__.py`
- **Type:** Module
- **Status:** Empty
- **Why:** Directory exists but contains no utility functions.
- **Evidence:** Empty __init__.py.
- **Impact:** Low
- **Recommendation:** Add utilities or remove directory

---

### 10. CONFIGURATION ISSUES (2 total)

**Redis URL Config**
- **Location:** `backend/app/core/config.py`
- **Type:** Configuration
- **Status:** Dead Config
- **Why:** REDIS_URL is defined but never used.
- **Evidence:** No Redis import found.
- **Impact:** Medium
- **Recommendation:** Implement caching or remove

**Hardcoded DB URL in alembic.ini**
- **Location:** `backend/alembic.ini`
- **Type:** Configuration
- **Status:** Security Issue
- **Why:** Contains hardcoded database credentials.
- **Evidence:** Line with postgres password.
- **Impact:** High
- **Recommendation:** Move to environment variable

---

## Priority Summary

### High Priority (19 items)
- 9 unused feed hooks (user posts, saved, hidden, drafts, scheduled)
- 3 profile page placeholder tabs
- RightSidebar incomplete implementation
- useToast stub
- Scheduled posts background worker
- Hardcoded DB credentials

### Medium Priority (38 items)
- 18 unused media hooks
- 14 unused live hooks
- 4 unused friends hooks
- Redis configuration unused
- StoriesRow upload handler
- Duplicate type constants

### Low Priority (24 items)
- 10 unused utility functions
- 7 dead code backend items
- 2 unused components
- 3 unused store actions
- 5 unused backend schemas

---

## Recommended Actions

### Immediate (Week 1)
1. Complete ProfilePage tabs (posts, friends, media)
2. Implement useToast properly
3. Fix hardcoded DB credentials in alembic.ini
4. Remove unused utility functions

### Short-term (Weeks 2-3)
1. Create saved/hidden/drafts/scheduled posts pages
2. Complete RightSidebar with real data
3. Connect live streaming guest/moderator hooks
4. Implement Cloudinary upload flow

### Medium-term (Month 2)
1. Create live streams discovery page
2. Create trending reels page
3. Implement feed position persistence
4. Add background worker for scheduled posts

### Long-term (Future)
1. Implement Redis caching
2. Create close friends stories feature
3. Add WebSocket support for live chat
4. Complete all unused hooks

---

## Estimated Cleanup Effort

| Category | Items | Estimated Hours |
|----------|-------|-----------------|
| Remove dead code | 24 | 4-6 hours |
| Complete incomplete features | 8 | 20-30 hours |
| Connect unused hooks | 37 | 30-40 hours |
| Fix configuration issues | 2 | 2-4 hours |
| **Total** | **71** | **56-80 hours** |

---

*Report generated by automated codebase audit.*
