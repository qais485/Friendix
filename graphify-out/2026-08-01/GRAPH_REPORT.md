# Graph Report - Friendix Social Platform  (2026-08-01)

## Corpus Check
- 279 files · ~123,088 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2470 nodes · 6822 edges · 133 communities (111 shown, 22 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 284 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- LiveService
- MessagingService
- FeedService
- messaging/hooks.ts
- live/hooks.ts
- v1/auth.py
- MediaRepository
- FriendsService
- ProfileService
- CreatePostForm.tsx
- MediaService
- CommentService
- models/__init__.py
- SetupUsernamePage.tsx
- FriendsPage.tsx
- FeedRepository
- PrivacyService
- ProfilePage.tsx
- MessagingRepository
- LiveRepository
- schemas/__init__.py
- Session
- UUID
- CommentItem.tsx
- PrivacySettingsPage.tsx
- media/hooks.ts
- types/index.ts
- media_service.py
- PhotoAlbumView.tsx
- media/components/index.ts
- FriendsRepository
- compilerOptions
- devDependencies
- StoryViewer.tsx
- dependencies
- feed.ts
- mediaApi.ts
- NotificationService
- authStore.ts
- package.json
- ReelResponse
- update_album
- CreateReel.tsx
- MediaResponse
- PhotoAlbumResponse
- StoryHighlights.tsx
- compilerOptions
- opencode.json
- vite-env.d.ts
- graphify.js
- framer-motion
- @radix-ui/react-label
- messagingStore.ts
- react-dom
- react-router-dom
- useAuthStore
- friendsApi.ts
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
- @tiptap/extension-strike
- @tiptap/extension-text-style
- @tiptap/react
- @tiptap/starter-kit
- NotificationItem.tsx
- permissions.py
- StoryArchiveView.tsx
- ChatList.tsx
- ToastContainer.tsx

## God Nodes (most connected - your core abstractions)
1. `MediaService` - 131 edges
2. `LiveService` - 91 edges
3. `FeedService` - 83 edges
4. `MessagingService` - 81 edges
5. `FeedRepository` - 79 edges
6. `MediaRepository` - 73 edges
7. `cn()` - 71 edges
8. `AdminService` - 63 edges
9. `FriendsService` - 58 edges
10. `Base` - 55 edges

## Surprising Connections (you probably didn't know these)
- `ConnectionManager` --uses--> `User`  [INFERRED]
  backend/app/api/v1/messaging_ws.py → backend/app/models/models.py
- `ConnectionManager` --uses--> `MessagingRepository`  [INFERRED]
  backend/app/api/v1/messaging_ws.py → backend/app/repositories/messaging_repository.py
- `Device` --uses--> `Base`  [INFERRED]
  backend/app/models/models.py → backend/app/database/base.py
- `LoginHistory` --uses--> `Base`  [INFERRED]
  backend/app/models/models.py → backend/app/database/base.py
- `Session` --uses--> `Base`  [INFERRED]
  backend/app/models/models.py → backend/app/database/base.py

## Import Cycles
- None detected.

## Communities (133 total, 22 thin omitted)

### Community 0 - "LiveService"
Cohesion: 0.06
Nodes (75): accept_guest_invite(), add_moderator(), create_stream(), delete_stream(), end_stream(), get_active_streams(), get_chat_messages(), get_donations() (+67 more)

### Community 1 - "MessagingService"
Cohesion: 0.06
Nodes (67): add_members(), add_reaction(), create_conversation(), delete_conversation(), delete_message(), forward_message(), get_archived_conversations(), get_conversation() (+59 more)

### Community 2 - "FeedService"
Cohesion: 0.07
Nodes (60): archive_post(), create_post(), delete_post(), get_archived_posts(), get_draft_posts(), get_feed_position(), get_following_feed(), get_friends_feed() (+52 more)

### Community 3 - "messaging/hooks.ts"
Cohesion: 0.12
Nodes (36): CallModal(), CallModalProps, CallState, ChatHeader(), formatLastSeen(), ChatThemeSelector(), ChatThemeSelectorProps, THEMES (+28 more)

### Community 4 - "live/hooks.ts"
Cohesion: 0.06
Nodes (50): GoLiveButton(), LiveChat(), LiveChatProps, LiveDonations(), LiveDonationsProps, EMOJI_OPTIONS, LiveReactions(), LiveReactionsProps (+42 more)

### Community 5 - "v1/auth.py"
Cohesion: 0.06
Nodes (45): delete_account(), get_auth_service(), get_current_user(), get_devices(), get_login_history(), google_login(), logout(), logout_all() (+37 more)

### Community 6 - "MediaRepository"
Cohesion: 0.07
Nodes (13): AlbumPhoto, MediaRepository, datetime, UUID, Media, PhotoAlbum, Reel, Story (+5 more)

### Community 7 - "FriendsService"
Cohesion: 0.09
Nodes (37): accept_friend_request(), cancel_friend_request(), follow_user(), get_close_friends(), get_favorite_friends(), get_followers(), get_following(), get_friend_counts() (+29 more)

### Community 8 - "ProfileService"
Cohesion: 0.06
Nodes (41): check_username(), get_explore_profiles(), get_my_profile(), get_public_profile(), AvatarUpdate, CoverPhotoUpdate, get, post (+33 more)

### Community 9 - "CreatePostForm.tsx"
Cohesion: 0.06
Nodes (38): Label, labelVariants, Switch, SwitchProps, BackgroundPicker(), BackgroundPickerProps, getPostBackgroundStyle(), POST_BACKGROUNDS (+30 more)

### Community 10 - "MediaService"
Cohesion: 0.10
Nodes (59): add_photo_to_album(), add_reaction(), add_reply(), add_story_to_highlight(), archive_story(), create_album(), create_highlight(), create_reel() (+51 more)

### Community 11 - "CommentService"
Cohesion: 0.07
Nodes (43): create_comment(), delete_comment(), get_comment_replies(), get_post_comments(), hide_comment(), pin_comment(), CommentCreate, CommentReactionCreate (+35 more)

### Community 12 - "models/__init__.py"
Cohesion: 0.13
Nodes (50): Base, AlbumPhoto, AuditLog, BannedUser, BlockedUser, Comment, CommentReaction, CommentReport (+42 more)

### Community 13 - "SetupUsernamePage.tsx"
Cohesion: 0.06
Nodes (53): CardDescription, CardHeader, CardTitle, Input, InputProps, Textarea, TextareaProps, Window (+45 more)

### Community 14 - "FriendsPage.tsx"
Cohesion: 0.24
Nodes (23): FollowList(), FriendList(), FriendRequestCard(), FriendSuggestions(), FriendsPage(), useAcceptFriendRequest(), useCancelFriendRequest(), useCloseFriends() (+15 more)

### Community 15 - "FeedRepository"
Cohesion: 0.12
Nodes (5): FeedRepository, Post, UUID, FeedPosition, Poll

### Community 16 - "PrivacyService"
Cohesion: 0.13
Nodes (27): block_user(), get_blocked_users(), get_muted_users(), get_privacy_settings(), get_restricted_users(), mute_user(), delete, get (+19 more)

### Community 17 - "ProfilePage.tsx"
Cohesion: 0.19
Nodes (37): CreatePostForm(), EmptyFeed(), HomePage(), useArchivedPosts(), useArchivePost(), useCreatePost(), useDeletePost(), useDraftPosts() (+29 more)

### Community 18 - "MessagingRepository"
Cohesion: 0.11
Nodes (8): MessagingRepository, UUID, Conversation, ConversationMember, Message, MessageReaction, MessageRead, OnlineStatus

### Community 19 - "LiveRepository"
Cohesion: 0.11
Nodes (9): LiveRepository, UUID, LiveChatMessage, LiveDonation, LiveGuest, LiveModerator, LiveReaction, LiveStream (+1 more)

### Community 20 - "schemas/__init__.py"
Cohesion: 0.09
Nodes (54): AdminUserListResponse, AuditLogListResponse, ban_user(), create_feature_flag(), create_system_setting(), delete_feature_flag(), delete_system_setting(), get_analytics() (+46 more)

### Community 21 - "Session"
Cohesion: 0.07
Nodes (18): get_admin_service(), get_comment_service(), get_feed_service(), get_friends_service(), get_privacy_service(), get_profile_service(), Device, LoginHistory (+10 more)

### Community 22 - "UUID"
Cohesion: 0.08
Nodes (8): StoryReplyResponse, StoryResponse, StoryCreate, StoryHighlightCreate, StoryHighlightUpdate, StoryReactionCreate, StoryReplyCreate, UUID

### Community 23 - "CommentItem.tsx"
Cohesion: 0.13
Nodes (29): CommentForm(), CommentFormProps, CommentItem(), CommentItemProps, CommentReplies(), CommentReactions(), CommentReactionsProps, EMOJI_OPTIONS (+21 more)

### Community 24 - "PrivacySettingsPage.tsx"
Cohesion: 0.14
Nodes (29): BlockMuteList(), BlockMuteListProps, TYPE_CONFIG, PrivacySection(), PrivacySectionProps, PrivacyToggle(), UserSearch(), useBlockedUsers() (+21 more)

### Community 25 - "media/hooks.ts"
Cohesion: 0.12
Nodes (18): useActiveStories(), useAddPhotoToAlbum(), useAlbum(), useCloudinarySignature(), useCreateAlbum(), useDeleteMedia(), useDeleteReel(), useFeedReels() (+10 more)

### Community 26 - "types/index.ts"
Cohesion: 0.08
Nodes (47): BOTTOM_NAV_ITEMS, MobileBottomNav(), Button, ButtonProps, buttonVariants, Card, CardContent, CardFooter (+39 more)

### Community 27 - "media_service.py"
Cohesion: 0.15
Nodes (26): AlbumPhotoAdd, AlbumPhotoResponse, CloudinarySignRequest, CloudinarySignResponse, MediaUpdate, MediaUpload, MediaUserResponse, PhotoAlbumCreate (+18 more)

### Community 28 - "PhotoAlbumView.tsx"
Cohesion: 0.33
Nodes (8): PhotoAlbumView(), PhotoAlbumViewProps, PRIVACY_ICONS, PRIVACY_LABELS, useAlbumPhotos(), useDeleteAlbum(), useUpdateAlbum(), PhotoAlbum

### Community 29 - "media/components/index.ts"
Cohesion: 0.08
Nodes (37): StoriesRow(), useUploadToMedia(), DEFAULT_STATE, EditState, ImageEditor(), ImageEditorProps, MediaCard(), MediaCardProps (+29 more)

### Community 30 - "FriendsRepository"
Cohesion: 0.19
Nodes (4): FriendsRepository, User, UUID, Friendship

### Community 31 - "compilerOptions"
Cohesion: 0.08
Nodes (23): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleDetection (+15 more)

### Community 32 - "devDependencies"
Cohesion: 0.08
Nodes (25): autoprefixer, eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, autoprefixer, eslint, eslint-plugin-react-hooks (+17 more)

### Community 33 - "StoryViewer.tsx"
Cohesion: 0.21
Nodes (12): QUICK_REACTIONS, StoryReactions(), StoryReactionsProps, StoryReplyInput(), StoryReplyInputProps, StoryViewer(), useAddStoryReaction(), useAddStoryReply() (+4 more)

### Community 34 - "dependencies"
Cohesion: 0.09
Nodes (23): axios, class-variance-authority, dependencies, axios, class-variance-authority, @radix-ui/react-avatar, @radix-ui/react-slot, @tiptap/extension-font-family (+15 more)

### Community 35 - "feed.ts"
Cohesion: 0.10
Nodes (21): EmptyFeedProps, FEED_CONFIG, FeedFiltersProps, FeedTabsProps, feedApi, FEED_SORT_OPTIONS, FEED_TABS, FeedFilters (+13 more)

### Community 36 - "mediaApi.ts"
Cohesion: 0.17
Nodes (19): AlbumPhoto, CloudinarySignature, MediaStats, MediaTab, MediaUpdate, MediaUpload, PhotoAlbumCreate, PhotoAlbumUpdate (+11 more)

### Community 37 - "NotificationService"
Cohesion: 0.10
Nodes (24): delete_notification(), get_notification_service(), get_notifications(), get_unread_count(), mark_as_read(), delete, get, post (+16 more)

### Community 38 - "authStore.ts"
Cohesion: 0.33
Nodes (6): authApi, AuthState, Device, LoginHistory, TokenResponse, User

### Community 39 - "package.json"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, dev, lint, preview, typecheck (+2 more)

### Community 40 - "ReelResponse"
Cohesion: 0.33
Nodes (3): ReelResponse, ReelCreate, ReelUpdate

### Community 41 - "update_album"
Cohesion: 0.22
Nodes (9): MediaUpdate, PhotoAlbumUpdate, put, ReelUpdate, StoryHighlightUpdate, update_album(), update_highlight(), update_media() (+1 more)

### Community 42 - "CreateReel.tsx"
Cohesion: 0.24
Nodes (10): CreateReel(), CreateReelProps, Privacy, PRIVACY_OPTIONS, ReelPlayerProps, useCreateReel(), useUploadMedia(), uploadToCloudinary() (+2 more)

### Community 43 - "MediaResponse"
Cohesion: 0.39
Nodes (3): MediaResponse, MediaUpdate, MediaUpload

### Community 44 - "PhotoAlbumResponse"
Cohesion: 0.39
Nodes (3): PhotoAlbumResponse, PhotoAlbumCreate, PhotoAlbumUpdate

### Community 45 - "StoryHighlights.tsx"
Cohesion: 0.48
Nodes (6): StoryHighlights(), StoryHighlightsProps, useCreateHighlight(), useDeleteHighlight(), useUserHighlights(), StoryHighlight

### Community 46 - "compilerOptions"
Cohesion: 0.33
Nodes (5): compilerOptions, composite, tsBuildInfoFile, include, src

### Community 47 - "opencode.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

### Community 88 - "messagingStore.ts"
Cohesion: 0.13
Nodes (21): ChatHeaderProps, ConversationSearchProps, MessageBubble(), MessageBubbleProps, QUICK_REACTIONS, messagingApi, MessagingState, TypingUser (+13 more)

### Community 91 - "useAuthStore"
Cohesion: 0.13
Nodes (19): App(), ProtectedRoute(), PublicRoute(), SetupUsernameRoute(), AppLayout(), AppLayoutProps, LayoutContext, LayoutContextType (+11 more)

### Community 99 - "friendsApi.ts"
Cohesion: 0.27
Nodes (9): FollowListProps, friendsApi, FavoriteCloseUpdate, FollowUser, FriendCounts, FriendRequest, Friendship, FriendshipStatus (+1 more)

### Community 100 - "Content Visibility Audit — Friendix Social Platform"
Cohesion: 0.04
Nodes (45): BUG F-1 (Critical): Repost sends `null` body — will fail with 422, BUG F-2 (Critical): Quote post sends `null` body — will fail with 422, BUG F-3 (Medium): Profile page PostCard missing all action handlers, BUG F-4 (Low): `useUserMedia` has dead `userId` parameter, BUG F-5 (Low): Infinite spinner if auth never resolves, BUG F-6 (Low): `MediaPage` passes duplicate `userId` arg, BUG L-1 (Critical): `get_active_streams` ignores privacy, BUG L-2 (Critical): `join_stream` ignores privacy — anyone can join any stream (+37 more)

### Community 101 - "AdminRepository"
Cohesion: 0.10
Nodes (10): AuditLog, AdminRepository, datetime, User, UUID, BannedUser, FeatureFlag, Report (+2 more)

### Community 102 - "Detailed Findings"
Cohesion: 0.07
Nodes (29): 10. CONFIGURATION ISSUES (2 total), 1.1 Feed Hooks (9 unused), 1.2 Media Hooks (18 unused), 1.3 Live Hooks (14 unused), 1.4 Friends Hooks (4 unused), 1.5 Comments Hooks (1 unused), 1. UNUSED REACT HOOKS (37 total), 2. UNUSED UTILITIES (10 total) (+21 more)

### Community 103 - "PROJECT_RULES.md"
Cohesion: 0.08
Nodes (24): 10. Security Rules, 11. Code Quality Rules, 12. AI Coding Assistant Rules, 13. Git Rules, 1. Project Identity, 2. Documentation Rules, 3. Technology Stack, 4. Frontend Architecture Rules (+16 more)

### Community 104 - "Friendix — UI/UX Structure Analysis"
Cohesion: 0.08
Nodes (23): 10. Design Patterns, 11. Colors / Typography / Styling, 12. Missing / Incomplete UI, 1. Pages / Screens, 2. Hierarchy & Routing, 3. Layout Structure, 4. Components & Relationships, 5. Navigation Flow (+15 more)

### Community 123 - "NotificationItem.tsx"
Cohesion: 0.16
Nodes (21): NotificationBell(), NotificationDropdown(), NotificationDropdownProps, getNotificationRoute(), getNotificationText(), NOTIFICATION_COLORS, NOTIFICATION_ICONS, NotificationItem() (+13 more)

### Community 124 - "permissions.py"
Cohesion: 0.47
Nodes (5): is_admin(), is_moderator(), UUID, Check if a user has moderator or admin role., Check if a user has admin role.

### Community 125 - "StoryArchiveView.tsx"
Cohesion: 0.39
Nodes (7): StoryArchiveView(), StoryArchiveViewProps, StoryViewerProps, useArchivedStories(), useDeleteStory(), useUnarchiveStory(), Story

### Community 126 - "ChatList.tsx"
Cohesion: 0.25
Nodes (11): useFriends(), ChatList(), ChatListProps, ConversationItem(), formatTime(), NewChatModal(), NewChatModal(), NewChatModalProps (+3 more)

## Knowledge Gaps
- **293 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `Config`, `name`, `private` (+288 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `models/__init__.py` to `MessagingService`, `AdminRepository`, `v1/auth.py`, `NotificationService`, `ProfileService`, `CommentService`, `FeedRepository`, `MessagingRepository`, `LiveRepository`, `schemas/__init__.py`, `Session`, `permissions.py`, `FriendsRepository`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `FeedRepository` connect `FeedRepository` to `FeedService`, `MediaRepository`, `FriendsService`, `ProfileService`, `MediaService`, `CommentService`, `models/__init__.py`, `PhotoAlbumResponse`, `Session`, `UUID`, `media_service.py`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `Friendship` connect `models/__init__.py` to `LiveService`, `MessagingService`, `AdminRepository`, `MediaRepository`, `FriendsService`, `MediaService`, `CommentService`, `FeedRepository`, `MessagingRepository`, `LiveRepository`, `FriendsRepository`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Are the 26 inferred relationships involving `MediaService` (e.g. with `FeedRepository` and `MediaRepository`) actually correct?**
  _`MediaService` has 26 INFERRED edges - model-reasoned connections that need verification._
- **Are the 22 inferred relationships involving `LiveService` (e.g. with `Friendship` and `LiveRepository`) actually correct?**
  _`LiveService` has 22 INFERRED edges - model-reasoned connections that need verification._
- **Are the 14 inferred relationships involving `FeedService` (e.g. with `Poll` and `PrivacySetting`) actually correct?**
  _`FeedService` has 14 INFERRED edges - model-reasoned connections that need verification._
- **Are the 17 inferred relationships involving `MessagingService` (e.g. with `BlockedUser` and `Friendship`) actually correct?**
  _`MessagingService` has 17 INFERRED edges - model-reasoned connections that need verification._