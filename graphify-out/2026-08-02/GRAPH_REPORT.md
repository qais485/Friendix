# Graph Report - Friendix Social Platform  (2026-08-02)

## Corpus Check
- 375 files · ~160,555 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3348 nodes · 9387 edges · 171 communities (149 shown, 22 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 432 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- schemas/__init__.py
- MessagingService
- FeedService
- messaging/hooks.ts
- useToast
- v1/auth.py
- MediaRepository
- v1/friends.py
- ProfileService
- composer/index.ts
- MediaService
- CommentService
- models/__init__.py
- profile/hooks.ts
- FriendsPage.tsx
- FeedRepository
- PrivacyService
- PrivacySettingsPage.tsx
- MessagingRepository
- LiveRepository
- AdminService
- repositories/__init__.py
- UUID
- CommentItem.tsx
- hashtags/hooks.ts
- media/hooks.ts
- types/index.ts
- media_service.py
- HashtagService
- media/components/index.ts
- FriendsRepository
- compilerOptions
- devDependencies
- StoryViewer.tsx
- dependencies
- GroupService
- mediaApi.ts
- NotificationService
- EventService
- package.json
- ReelResponse
- update_album
- ProfilePage.tsx
- MediaResponse
- PhotoAlbumResponse
- MediaCard.tsx
- compilerOptions
- opencode.json
- vite-env.d.ts
- graphify.js
- framer-motion
- @radix-ui/react-label
- videos/hooks.ts
- react-dom
- react-router-dom
- VideoRepository
- v1/videos.py
- SearchRepository
- Content Visibility Audit — Friendix Social Platform
- AdminRepository
- Detailed Findings
- PROJECT_RULES.md
- Friendix — UI/UX Structure Analysis
- clsx
- lucide-react
- react
- tailwind-merge
- tailwindcss-animate
- @tanstack/react-query
- AGENTS.md
- @tiptap/extension-color
- @tiptap/extension-horizontal-rule
- @tiptap/extension-image
- @tiptap/extension-placeholder
- events/hooks.ts
- @tiptap/extension-text-style
- @tiptap/react
- @tiptap/starter-kit
- NotificationItem.tsx
- permissions.py
- button.tsx
- SearchService
- GroupRepository
- CreatePostForm.tsx
- StoryReactions.tsx
- EventRepository
- Session
- SearchPage.tsx
- App.tsx
- VideoService
- @tiptap/extension-strike
- live/hooks.ts
- FriendsService
- messaging/components/index.ts
- messaging.ts
- ChatList.tsx
- CreateReel.tsx
- NotificationRepository
- StoriesRow.tsx
- User
- friends_service.py
- PhotoAlbumView.tsx
- StoryHighlights.tsx
- notificationApi.ts
- update_playlist
- FeedType
- MessageInput.tsx

## God Nodes (most connected - your core abstractions)
1. `MediaService` - 131 edges
2. `LiveService` - 91 edges
3. `Session` - 89 edges
4. `cn()` - 87 edges
5. `FeedService` - 84 edges
6. `GroupService` - 84 edges
7. `VideoService` - 83 edges
8. `Base` - 81 edges
9. `MessagingService` - 81 edges
10. `FeedRepository` - 79 edges

## Surprising Connections (you probably didn't know these)
- `ConnectionManager` --uses--> `User`  [INFERRED]
  backend/app/api/v1/messaging_ws.py → backend/app/models/models.py
- `ConnectionManager` --uses--> `MessagingRepository`  [INFERRED]
  backend/app/api/v1/messaging_ws.py → backend/app/repositories/messaging_repository.py
- `AuditLog` --uses--> `Base`  [INFERRED]
  backend/app/models/models.py → backend/app/database/base.py
- `BannedUser` --uses--> `Base`  [INFERRED]
  backend/app/models/models.py → backend/app/database/base.py
- `Comment` --uses--> `Base`  [INFERRED]
  backend/app/models/models.py → backend/app/database/base.py

## Import Cycles
- None detected.

## Communities (171 total, 22 thin omitted)

### Community 0 - "schemas/__init__.py"
Cohesion: 0.06
Nodes (75): accept_guest_invite(), add_moderator(), create_stream(), delete_stream(), end_stream(), get_active_streams(), get_chat_messages(), get_donations() (+67 more)

### Community 1 - "MessagingService"
Cohesion: 0.06
Nodes (67): add_members(), add_reaction(), create_conversation(), delete_conversation(), delete_message(), forward_message(), get_archived_conversations(), get_conversation() (+59 more)

### Community 2 - "FeedService"
Cohesion: 0.07
Nodes (61): archive_post(), create_post(), delete_post(), get_archived_posts(), get_draft_posts(), get_feed_position(), get_feed_service(), get_following_feed() (+53 more)

### Community 3 - "messaging/hooks.ts"
Cohesion: 0.23
Nodes (18): ChatWindow(), ChatWindowProps, ConversationSearch(), useAddReaction(), useArchivedConversations(), useConversation(), useConversations(), useDeleteMessage() (+10 more)

### Community 4 - "useToast"
Cohesion: 0.10
Nodes (33): GoLiveButton(), LiveChat(), LiveChatProps, LiveDonations(), LiveDonationsProps, EMOJI_OPTIONS, LiveReactions(), LiveReactionsProps (+25 more)

### Community 5 - "v1/auth.py"
Cohesion: 0.06
Nodes (46): delete_account(), get_auth_service(), get_current_user(), get_devices(), get_login_history(), google_login(), logout(), logout_all() (+38 more)

### Community 6 - "MediaRepository"
Cohesion: 0.07
Nodes (13): AlbumPhoto, MediaRepository, datetime, Reel, UUID, Media, PhotoAlbum, Story (+5 more)

### Community 7 - "v1/friends.py"
Cohesion: 0.17
Nodes (26): accept_friend_request(), cancel_friend_request(), follow_user(), get_close_friends(), get_favorite_friends(), get_followers(), get_following(), get_friend_counts() (+18 more)

### Community 8 - "ProfileService"
Cohesion: 0.08
Nodes (38): check_username(), get_explore_profiles(), get_my_profile(), get_profile_service(), get_public_profile(), AvatarUpdate, CoverPhotoUpdate, get (+30 more)

### Community 9 - "composer/index.ts"
Cohesion: 0.06
Nodes (33): Label, labelVariants, Switch, SwitchProps, BackgroundPicker(), BackgroundPickerProps, POST_BACKGROUNDS, POST_BG_TEMPLATES (+25 more)

### Community 10 - "MediaService"
Cohesion: 0.10
Nodes (59): add_photo_to_album(), add_reaction(), add_reply(), add_story_to_highlight(), archive_story(), create_album(), create_highlight(), create_reel() (+51 more)

### Community 11 - "CommentService"
Cohesion: 0.07
Nodes (44): create_comment(), delete_comment(), get_comment_replies(), get_comment_service(), get_post_comments(), hide_comment(), pin_comment(), CommentCreate (+36 more)

### Community 12 - "models/__init__.py"
Cohesion: 0.12
Nodes (56): Base, AlbumPhoto, BlockedUser, CommentReaction, CommentReport, Conversation, ConversationMember, Event (+48 more)

### Community 13 - "profile/hooks.ts"
Cohesion: 0.06
Nodes (44): ParsedContent(), ParsedContentProps, Textarea, TextareaProps, PostCardProps, EditProfileModal(), EditProfileModalProps, GENDER_OPTIONS (+36 more)

### Community 14 - "FriendsPage.tsx"
Cohesion: 0.11
Nodes (40): InviteModal(), InviteModalProps, useInviteToEvent(), FollowList(), FollowListProps, FriendList(), FriendListProps, FriendRequestCard() (+32 more)

### Community 15 - "FeedRepository"
Cohesion: 0.11
Nodes (5): FeedRepository, Post, UUID, FeedPosition, Poll

### Community 16 - "PrivacyService"
Cohesion: 0.13
Nodes (28): block_user(), get_blocked_users(), get_muted_users(), get_privacy_service(), get_privacy_settings(), get_restricted_users(), mute_user(), delete (+20 more)

### Community 17 - "PrivacySettingsPage.tsx"
Cohesion: 0.14
Nodes (29): BlockMuteList(), BlockMuteListProps, TYPE_CONFIG, PrivacySection(), PrivacySectionProps, PrivacyToggle(), UserSearch(), useBlockedUsers() (+21 more)

### Community 18 - "MessagingRepository"
Cohesion: 0.11
Nodes (8): MessagingRepository, UUID, Conversation, ConversationMember, Message, MessageReaction, MessageRead, OnlineStatus

### Community 19 - "LiveRepository"
Cohesion: 0.11
Nodes (9): LiveRepository, LiveStream, UUID, LiveChatMessage, LiveDonation, LiveGuest, LiveModerator, LiveReaction (+1 more)

### Community 20 - "AdminService"
Cohesion: 0.08
Nodes (55): AdminUserListResponse, AuditLogListResponse, ban_user(), create_feature_flag(), create_system_setting(), delete_feature_flag(), delete_system_setting(), get_admin_service() (+47 more)

### Community 21 - "repositories/__init__.py"
Cohesion: 0.11
Nodes (11): Device, LoginHistory, DeviceRepository, LoginHistoryRepository, User, UUID, SessionRepository, UserRepository (+3 more)

### Community 22 - "UUID"
Cohesion: 0.08
Nodes (8): StoryReplyResponse, StoryResponse, StoryCreate, StoryHighlightCreate, StoryHighlightUpdate, StoryReactionCreate, StoryReplyCreate, UUID

### Community 23 - "CommentItem.tsx"
Cohesion: 0.13
Nodes (29): CommentForm(), CommentFormProps, CommentItem(), CommentItemProps, CommentReplies(), CommentReactions(), CommentReactionsProps, EMOJI_OPTIONS (+21 more)

### Community 24 - "hashtags/hooks.ts"
Cohesion: 0.14
Nodes (20): FollowButton(), FollowButtonProps, HashtagCard(), HashtagCardProps, TrendingTags(), HashtagDetailPage(), HashtagExplorePage(), useFollowHashtag() (+12 more)

### Community 25 - "media/hooks.ts"
Cohesion: 0.12
Nodes (19): CreateReel(), useAddPhotoToAlbum(), useAlbum(), useCloudinarySignature(), useCreateAlbum(), useCreateReel(), useDeleteMedia(), useDeleteReel() (+11 more)

### Community 26 - "types/index.ts"
Cohesion: 0.08
Nodes (44): Card, CardContent, CardFooter, Input, InputProps, ADMIN_TABS, AdminTab, AnalyticsDashboard() (+36 more)

### Community 27 - "media_service.py"
Cohesion: 0.15
Nodes (26): AlbumPhotoAdd, AlbumPhotoResponse, CloudinarySignRequest, CloudinarySignResponse, MediaUpdate, MediaUpload, MediaUserResponse, PhotoAlbumCreate (+18 more)

### Community 28 - "HashtagService"
Cohesion: 0.09
Nodes (28): create_hashtag(), follow_hashtag(), get_followed_hashtags(), get_hashtag_detail(), get_hashtag_posts(), get_hashtag_service(), get_trending_hashtags(), delete (+20 more)

### Community 29 - "media/components/index.ts"
Cohesion: 0.17
Nodes (12): DEFAULT_STATE, EditState, ImageEditor(), ImageEditorProps, ReelPlayer(), StoryReplyInput(), StoryReplyInputProps, formatTime() (+4 more)

### Community 30 - "FriendsRepository"
Cohesion: 0.18
Nodes (4): FriendsRepository, User, UUID, Friendship

### Community 31 - "compilerOptions"
Cohesion: 0.08
Nodes (23): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleDetection (+15 more)

### Community 32 - "devDependencies"
Cohesion: 0.08
Nodes (25): autoprefixer, eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, autoprefixer, eslint, eslint-plugin-react-hooks (+17 more)

### Community 33 - "StoryViewer.tsx"
Cohesion: 0.28
Nodes (11): StoryArchiveView(), StoryArchiveViewProps, StoryViewer(), StoryViewerProps, useAddStoryToHighlight(), useArchivedStories(), useArchiveStory(), useDeleteStory() (+3 more)

### Community 34 - "dependencies"
Cohesion: 0.09
Nodes (23): axios, class-variance-authority, dependencies, axios, class-variance-authority, @radix-ui/react-avatar, @radix-ui/react-slot, @tiptap/extension-font-family (+15 more)

### Community 35 - "GroupService"
Cohesion: 0.07
Nodes (55): attend_event(), create_announcement(), create_event(), create_group(), create_poll(), delete_announcement(), delete_group(), delete_message() (+47 more)

### Community 36 - "mediaApi.ts"
Cohesion: 0.17
Nodes (19): AlbumPhoto, CloudinarySignature, MediaStats, MediaTab, MediaUpdate, MediaUpload, PhotoAlbumCreate, PhotoAlbumUpdate (+11 more)

### Community 37 - "NotificationService"
Cohesion: 0.14
Nodes (21): delete_notification(), get_notification_service(), get_notifications(), get_unread_count(), mark_as_read(), delete, get, post (+13 more)

### Community 38 - "EventService"
Cohesion: 0.09
Nodes (39): cancel_event(), create_event(), delete_chat_message(), delete_event(), get_attendees(), get_chat_messages(), get_event(), get_event_invites() (+31 more)

### Community 39 - "package.json"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, dev, lint, preview, typecheck (+2 more)

### Community 40 - "ReelResponse"
Cohesion: 0.33
Nodes (3): ReelResponse, ReelCreate, ReelUpdate

### Community 41 - "update_album"
Cohesion: 0.22
Nodes (9): MediaUpdate, PhotoAlbumUpdate, put, ReelUpdate, StoryHighlightUpdate, update_album(), update_highlight(), update_media() (+1 more)

### Community 42 - "ProfilePage.tsx"
Cohesion: 0.17
Nodes (39): EmptyFeed(), FeedFilters(), FeedTabs(), PostCard(), HomePage(), useArchivedPosts(), useArchivePost(), useCreatePost() (+31 more)

### Community 43 - "MediaResponse"
Cohesion: 0.39
Nodes (3): MediaResponse, MediaUpdate, MediaUpload

### Community 44 - "PhotoAlbumResponse"
Cohesion: 0.39
Nodes (3): PhotoAlbumResponse, PhotoAlbumCreate, PhotoAlbumUpdate

### Community 45 - "MediaCard.tsx"
Cohesion: 0.19
Nodes (16): useUploadToMedia(), MediaCard(), MediaCardProps, TYPE_COLORS, TYPE_ICONS, MediaGrid(), MediaGridProps, MediaViewer() (+8 more)

### Community 46 - "compilerOptions"
Cohesion: 0.33
Nodes (5): compilerOptions, composite, tsBuildInfoFile, include, src

### Community 47 - "opencode.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

### Community 88 - "videos/hooks.ts"
Cohesion: 0.05
Nodes (63): CategoryFilter(), CategoryFilterProps, formatDuration(), formatViews(), timeAgo(), VideoCard(), VideoCardProps, CommentItem() (+55 more)

### Community 91 - "VideoRepository"
Cohesion: 0.09
Nodes (14): Playlist, PlaylistVideo, Video, VideoCategory, VideoComment, VideoLike, WatchHistory, WatchLater (+6 more)

### Community 93 - "v1/videos.py"
Cohesion: 0.26
Nodes (20): PlaylistCreate, PlaylistDetailResponse, PlaylistListResponse, PlaylistResponse, PlaylistUpdate, BaseModel, RecommendationListResponse, VideoCategoryBrief (+12 more)

### Community 99 - "SearchRepository"
Cohesion: 0.13
Nodes (12): Comment, Post, Reel, SavedSearch, SearchHistory, Comment, LiveStream, Post (+4 more)

### Community 100 - "Content Visibility Audit — Friendix Social Platform"
Cohesion: 0.04
Nodes (45): BUG F-1 (Critical): Repost sends `null` body — will fail with 422, BUG F-2 (Critical): Quote post sends `null` body — will fail with 422, BUG F-3 (Medium): Profile page PostCard missing all action handlers, BUG F-4 (Low): `useUserMedia` has dead `userId` parameter, BUG F-5 (Low): Infinite spinner if auth never resolves, BUG F-6 (Low): `MediaPage` passes duplicate `userId` arg, BUG L-1 (Critical): `get_active_streams` ignores privacy, BUG L-2 (Critical): `join_stream` ignores privacy — anyone can join any stream (+37 more)

### Community 101 - "AdminRepository"
Cohesion: 0.09
Nodes (17): AuditLog, AuditLog, BannedUser, FeatureFlag, Message, Report, SystemSetting, VerificationRequest (+9 more)

### Community 102 - "Detailed Findings"
Cohesion: 0.07
Nodes (29): 10. CONFIGURATION ISSUES (2 total), 1.1 Feed Hooks (9 unused), 1.2 Media Hooks (18 unused), 1.3 Live Hooks (14 unused), 1.4 Friends Hooks (4 unused), 1.5 Comments Hooks (1 unused), 1. UNUSED REACT HOOKS (37 total), 2. UNUSED UTILITIES (10 total) (+21 more)

### Community 103 - "PROJECT_RULES.md"
Cohesion: 0.08
Nodes (24): 10. Security Rules, 11. Code Quality Rules, 12. AI Coding Assistant Rules, 13. Git Rules, 1. Project Identity, 2. Documentation Rules, 3. Technology Stack, 4. Frontend Architecture Rules (+16 more)

### Community 104 - "Friendix — UI/UX Structure Analysis"
Cohesion: 0.08
Nodes (23): 10. Design Patterns, 11. Colors / Typography / Styling, 12. Missing / Incomplete UI, 1. Pages / Screens, 2. Hierarchy & Routing, 3. Layout Structure, 4. Components & Relationships, 5. Navigation Flow (+15 more)

### Community 119 - "events/hooks.ts"
Cohesion: 0.06
Nodes (48): EventAttendees(), EventAttendeesProps, EventCard(), EventCardProps, EventChat(), EventChatProps, CreateEventPage(), EventDetailPage() (+40 more)

### Community 123 - "NotificationItem.tsx"
Cohesion: 0.26
Nodes (14): NotificationBell(), NotificationDropdown(), NotificationDropdownProps, getNotificationRoute(), getNotificationText(), NOTIFICATION_COLORS, NOTIFICATION_ICONS, NotificationItem() (+6 more)

### Community 124 - "permissions.py"
Cohesion: 0.47
Nodes (5): is_admin(), is_moderator(), UUID, Check if a user has moderator or admin role., Check if a user has admin role.

### Community 126 - "button.tsx"
Cohesion: 0.06
Nodes (56): Button, ButtonProps, buttonVariants, CreateGroupModal(), CreateGroupModalProps, PRIVACY_OPTIONS, GroupAnnouncements(), GroupAnnouncementsProps (+48 more)

### Community 127 - "SearchService"
Cohesion: 0.11
Nodes (33): clear_search_history(), delete_saved_search(), get_saved_searches(), get_search_history(), get_search_service(), delete, get, post (+25 more)

### Community 134 - "GroupRepository"
Cohesion: 0.10
Nodes (10): GroupRepository, UUID, slugify(), Group, GroupAnnouncement, GroupEvent, GroupJoinRequest, GroupMember (+2 more)

### Community 135 - "CreatePostForm.tsx"
Cohesion: 0.12
Nodes (21): getPostBackgroundStyle(), ComposerType, CreatePostForm(), CreatePostFormProps, DURATION_MS, feedApi, FEED_SORT_OPTIONS, FEED_TABS (+13 more)

### Community 142 - "StoryReactions.tsx"
Cohesion: 0.47
Nodes (5): QUICK_REACTIONS, StoryReactions(), StoryReactionsProps, useAddStoryReaction(), useRemoveStoryReaction()

### Community 143 - "EventRepository"
Cohesion: 0.17
Nodes (6): EventRepository, UUID, Event, EventChatMessage, EventInvite, EventRSVP

### Community 144 - "Session"
Cohesion: 0.12
Nodes (35): add_video_to_playlist(), clear_watch_history(), create_comment(), create_playlist(), create_video(), delete_comment(), delete_playlist(), delete_video() (+27 more)

### Community 145 - "SearchPage.tsx"
Cohesion: 0.08
Nodes (41): useSearchHashtags(), AdvancedFilters(), AdvancedFiltersProps, POST_TYPES, CommentSearchResults(), CommentSearchResultsProps, HashtagSearchResults(), HashtagSearchResultsProps (+33 more)

### Community 146 - "App.tsx"
Cohesion: 0.07
Nodes (36): App(), ProtectedRoute(), PublicRoute(), SetupUsernameRoute(), AppLayout(), AppLayoutProps, LayoutContext, LayoutContextType (+28 more)

### Community 149 - "VideoService"
Cohesion: 0.10
Nodes (14): VideoResponse, PlaylistCreate, PlaylistUpdate, UUID, VideoCommentCreate, VideoCreate, VideoUpdate, VideoService (+6 more)

### Community 151 - "live/hooks.ts"
Cohesion: 0.10
Nodes (18): LiveStreamPlayerProps, liveApi, LiveChatMessageCreate, LiveChatMessageListResponse, LiveDonationCreate, LiveDonationListResponse, LiveGuest, LiveGuestCreate (+10 more)

### Community 152 - "FriendsService"
Cohesion: 0.15
Nodes (5): FriendsService, FavoriteCloseUpdate, UUID, FollowResponse, FriendDetail

### Community 153 - "messaging/components/index.ts"
Cohesion: 0.17
Nodes (15): CallModal(), CallModalProps, CallState, ChatHeader(), ChatHeaderProps, formatLastSeen(), ChatThemeSelector(), ChatThemeSelectorProps (+7 more)

### Community 154 - "messaging.ts"
Cohesion: 0.14
Nodes (17): ConversationSearchProps, MessageBubble(), MessageBubbleProps, QUICK_REACTIONS, messagingApi, ConversationCreate, ConversationMember, ConversationUpdate (+9 more)

### Community 155 - "ChatList.tsx"
Cohesion: 0.18
Nodes (15): ChatList(), ChatListProps, ConversationItem(), formatTime(), NewChatModal(), NewChatModal(), NewChatModalProps, useCreateConversation() (+7 more)

### Community 156 - "CreateReel.tsx"
Cohesion: 0.16
Nodes (13): CreateReelProps, Privacy, PRIVACY_OPTIONS, ReelPlayerProps, ACCEPT_MAP, TYPE_ICONS, TYPE_LABELS, UploadZone() (+5 more)

### Community 157 - "NotificationRepository"
Cohesion: 0.28
Nodes (3): NotificationRepository, UUID, Notification

### Community 159 - "StoriesRow.tsx"
Cohesion: 0.29
Nodes (8): StoriesRow(), MusicStoryCreator(), MusicStoryCreatorProps, SAMPLE_TRACKS, StoryCreator(), StoryCreatorProps, useActiveStories(), useCreateStory()

### Community 162 - "friends_service.py"
Cohesion: 0.47
Nodes (8): FavoriteCloseUpdate, FollowResponse, FollowUserDetail, FriendDetail, FriendRequestCreate, FriendshipResponse, FriendshipStatusResponse, BaseModel

### Community 163 - "PhotoAlbumView.tsx"
Cohesion: 0.33
Nodes (8): PhotoAlbumView(), PhotoAlbumViewProps, PRIVACY_ICONS, PRIVACY_LABELS, useAlbumPhotos(), useDeleteAlbum(), useUpdateAlbum(), PhotoAlbum

### Community 164 - "StoryHighlights.tsx"
Cohesion: 0.48
Nodes (6): StoryHighlights(), StoryHighlightsProps, useCreateHighlight(), useDeleteHighlight(), useUserHighlights(), StoryHighlight

### Community 165 - "notificationApi.ts"
Cohesion: 0.47
Nodes (4): NotificationActor, NotificationCountResponse, NotificationListResponse, NotificationMarkReadRequest

### Community 166 - "update_playlist"
Cohesion: 0.40
Nodes (5): PlaylistUpdate, put, VideoUpdate, update_playlist(), update_video()

### Community 167 - "FeedType"
Cohesion: 0.50
Nodes (4): EmptyFeedProps, FEED_CONFIG, FeedTabsProps, FeedType

### Community 168 - "MessageInput.tsx"
Cohesion: 0.50
Nodes (4): EMOJI_GRID, MessageInput(), MessageInputProps, useUploadMedia()

## Knowledge Gaps
- **321 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `Config`, `name`, `private` (+316 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `models/__init__.py` to `MessagingService`, `v1/auth.py`, `GroupRepository`, `ProfileService`, `CommentService`, `EventRepository`, `FeedRepository`, `Session`, `MessagingRepository`, `LiveRepository`, `AdminService`, `repositories/__init__.py`, `HashtagService`, `NotificationRepository`, `FriendsRepository`, `NotificationService`, `VideoRepository`, `v1/videos.py`, `SearchRepository`, `AdminRepository`, `permissions.py`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `ProfileRepository` connect `Session` to `User`, `schemas/__init__.py`, `FeedService`, `friends_service.py`, `GroupService`, `SearchRepository`, `EventService`, `ProfileService`, `models/__init__.py`, `PrivacyService`, `repositories/__init__.py`, `VideoService`, `FriendsService`, `HashtagService`, `v1/videos.py`, `SearchService`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `FeedRepository` connect `FeedRepository` to `FeedService`, `SearchRepository`, `friends_service.py`, `MediaRepository`, `ProfileService`, `MediaService`, `CommentService`, `models/__init__.py`, `PhotoAlbumResponse`, `repositories/__init__.py`, `UUID`, `FriendsService`, `media_service.py`, `HashtagService`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Are the 26 inferred relationships involving `MediaService` (e.g. with `FeedRepository` and `MediaRepository`) actually correct?**
  _`MediaService` has 26 INFERRED edges - model-reasoned connections that need verification._
- **Are the 22 inferred relationships involving `LiveService` (e.g. with `Friendship` and `LiveRepository`) actually correct?**
  _`LiveService` has 22 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `Session` (e.g. with `Base` and `DeviceRepository`) actually correct?**
  _`Session` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 15 inferred relationships involving `FeedService` (e.g. with `Poll` and `PrivacySetting`) actually correct?**
  _`FeedService` has 15 INFERRED edges - model-reasoned connections that need verification._