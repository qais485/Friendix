# Graph Report - Friendix Social Platform  (2026-08-05)

## Corpus Check
- 413 files · ~175,648 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 5830 nodes · 13334 edges · 326 communities (276 shown, 50 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 544 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- LiveService
- MessagingService
- FeedService
- messaging/hooks.ts
- RelationshipRepository
- v1/auth.py
- MediaRepository
- RelationshipService
- PostCard.tsx
- CreatePostForm.tsx
- v1/media.py
- CommentService
- models/__init__.py
- NotificationDropdown.tsx
- friends/hooks.ts
- FeedRepository
- services/__init__.py
- PrivacySettingsPage.tsx
- MessagingRepository
- LiveRepository
- friendsApi.ts
- User
- MediaService
- CommentItem.tsx
- SearchService
- liquid-glass/index.ts
- button.tsx
- media_service.py
- HashtagService
- v1/__init__.py
- FriendsRepository
- compilerOptions
- devDependencies
- types/index.ts
- dependencies
- GroupService
- hashtags/hooks.ts
- NotificationService
- EventService
- package.json
- PrivacyService
- update_album
- ProfilePage.tsx
- useAuthStore
- PhotoAlbumResponse
- UUID
- compilerOptions
- opencode.json
- vite-env.d.ts
- graphify.js
- PrivacyRepository
- @radix-ui/react-label
- videos/hooks.ts
- gray
- react-router-dom
- VideoRepository
- video_service.py
- SearchRepository
- Content Visibility Audit — Friendix Social Platform
- AdminRepository
- Detailed Findings
- PROJECT_RULES.md
- UUID
- clsx
- Tailwind CSS Utility Reference
- cloudinaryTransform.ts
- slide_search_core.py
- Brand Guidelines v1.0
- search
- AGENTS.md
- security.py
- color
- messaging_websocket
- schemas/__init__.py
- events/hooks.ts
- Design
- auth_service.py
- Canvas Design System
- PermissionsService
- AdminService
- feed_repository.py
- groups/hooks.ts
- AnalyticsPage.tsx
- GroupRepository
- Prerequisites
- Form & Input Components
- Tailwind CSS Responsive Design
- ProfileRepository
- SearchPage.tsx
- BM25
- VideoService
- AnalyticsRepository
- live/hooks.ts
- Session
- AnalyticsService
- FriendsService
- design_system.py
- ProfileResponse
- ProfileService
- LiveModeratorResponse
- Typography Specifications
- framer-motion
- LiveGuestResponse
- MediaResponse
- $type
- BM25
- Logo Usage Rules
- Component Specifications
- shadcn/ui Accessibility Patterns
- TestTailwindConfigGenerator
- html-token-validator.py
- DesignSystemGenerator
- Asset Approval Checklist
- Logo AI Prompt Engineering
- Color Palette Management
- CIP Deliverable Guide
- BM25
- States and Variants
- UI Styling Skill
- Workflow
- relationship_service.py
- Design System
- Tailwind CSS Customization
- spacing
- Routing by Task Type
- generate-slide.py
- shadcn/ui Theming & Customization
- TailwindConfigGenerator
- Asset Organization Guide
- Primary Color Meanings
- Core Logo Types
- color
- test_design_system_mode.py
- $type
- Brand Consistency Checklist
- CIP Mockup Prompt Engineering
- Color Semantics
- fetch-background.py
- search
- TestShadcnInstaller
- card
- Design Principles
- Design Principles
- icon/generate.py
- fontSize
- CIP Design Reference
- Icon Design Reference
- Copywriting Formulas
- Copywriting Formulas
- main
- UI/UX Implementation Report
- Banner Design - Multi-Format Creative Banner System
- Messaging Framework
- Brand Voice Framework
- extract-colors.cjs
- validate-asset.cjs
- Layout Patterns
- cip/generate.py
- Tailwind Integration
- radius
- Layout Patterns
- update.md
- Logo Design Reference
- Token Architecture
- design-tokens-starter.json
- Primitive Tokens
- validate-tokens.cjs
- ShadcnInstaller
- .add_components
- test_tailwind_config_gen.py
- .generate_config_string
- Core Visual Elements
- inject-brand-context.cjs
- CIP Design Style Guide
- embed-tokens.cjs
- .test_add_components_with_overwrite
- ._base_config
- Brand
- Slide Strategies
- logo/generate.py
- Component Tokens
- generate-tokens.cjs
- button
- primitive
- Slide Strategies
- test_validate_tokens.py
- radius
- sync-brand-to-tokens.cjs
- NotificationRepository
- permissions.py
- Slides Reference
- HTML Slide Template
- HTML Slide Template
- 800
- _select_palette_for_mode
- input
- Slides
- padding-y
- Brand Guidelines Template
- destructive
- destructive-foreground
- muted
- lucide-react
- primary-foreground
- .test_add_components_no_config
- validate_data.py
- test_sync_brand_to_tokens.py
- main
- ring
- secondary-foreground
- .test_add_components_success
- tailwind-merge
- .test_add_components_dry_run
- .test_add_all_components_no_config
- .test_list_installed_with_components
- .test_init_dry_run
- .test_check_shadcn_config_exists
- @tiptap/extension-highlight
- @tiptap/extension-underline
- @tiptap/starter-kit
- @tiptap/extension-link
- .test_add_all_components_dry_run
- zustand
- slides-create.md
- create.md
- dompurify
- .test_check_shadcn_config_not_exists
- .test_list_installed_empty
- @radix-ui/react-avatar
- tailwindcss-animate
- @tiptap/extension-horizontal-rule
- .test_add_plugins_no_duplicates
- .test_init_default_typescript
- .test_generate_javascript_config
- .test_init_javascript
- .test_write_config_creates_content
- .test_write_config_invalid_path
- .test_generate_config_with_colors
- .test_validate_config_valid
- .test_add_colors
- .test_validate_config_no_content
- @tiptap/extension-color
- .test_default_output_path_javascript
- .test_base_config_structure
- @radix-ui/react-slot
- @tiptap/extension-placeholder
- @types/dompurify

## God Nodes (most connected - your core abstractions)
1. `MediaService` - 131 edges
2. `RelationshipService` - 105 edges
3. `Session` - 103 edges
4. `FeedRepository` - 95 edges
5. `LiveService` - 91 edges
6. `FeedService` - 89 edges
7. `Button` - 87 edges
8. `Base` - 86 edges
9. `GroupService` - 84 edges
10. `TimestampMixin` - 83 edges

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

## Communities (326 total, 50 thin omitted)

### Community 0 - "LiveService"
Cohesion: 0.12
Nodes (43): accept_guest_invite(), add_moderator(), create_stream(), delete_stream(), end_stream(), get_active_streams(), get_chat_messages(), get_donations() (+35 more)

### Community 1 - "MessagingService"
Cohesion: 0.06
Nodes (67): add_members(), add_reaction(), create_conversation(), delete_conversation(), delete_message(), forward_message(), get_archived_conversations(), get_conversation() (+59 more)

### Community 2 - "FeedService"
Cohesion: 0.06
Nodes (61): archive_post(), create_post(), delete_post(), get_archived_posts(), get_draft_posts(), get_feed_position(), get_feed_service(), get_following_feed() (+53 more)

### Community 3 - "messaging/hooks.ts"
Cohesion: 0.06
Nodes (68): CallModal(), CallModalProps, CallState, ChatHeader(), ChatHeaderProps, formatLastSeen(), ChatList(), ChatListProps (+60 more)

### Community 4 - "RelationshipRepository"
Cohesion: 0.07
Nodes (9): BlockedUser, CloseFriend, Friendship, Mute, User, UUID, RelationshipRepository, FollowRequest (+1 more)

### Community 5 - "v1/auth.py"
Cohesion: 0.17
Nodes (17): delete_account(), get_auth_service(), get_current_user(), get_devices(), get_login_history(), google_login(), logout(), logout_all() (+9 more)

### Community 6 - "MediaRepository"
Cohesion: 0.06
Nodes (13): AlbumPhoto, MediaRepository, datetime, Reel, UUID, Media, PhotoAlbum, Story (+5 more)

### Community 7 - "RelationshipService"
Cohesion: 0.14
Nodes (47): accept_follow_request(), accept_friend_request(), add_close_friend(), block_user(), cancel_follow_request(), cancel_friend_request(), follow_user(), get_blocked_users() (+39 more)

### Community 8 - "PostCard.tsx"
Cohesion: 0.10
Nodes (23): LiquidGlassFilter(), ParsedContent(), ParsedContentProps, LazyVideo(), LazyVideoProps, barForeground(), DARK_BAR_FG, LIGHT_BAR_FG (+15 more)

### Community 9 - "CreatePostForm.tsx"
Cohesion: 0.07
Nodes (35): Label, labelVariants, BackgroundPicker(), BackgroundPickerProps, getPostBackgroundStyle(), POST_BACKGROUNDS, POST_BG_TEMPLATES, PostBackground (+27 more)

### Community 10 - "v1/media.py"
Cohesion: 0.09
Nodes (57): add_reaction(), add_reply(), add_story_to_highlight(), archive_story(), create_album(), create_highlight(), create_reel(), create_story() (+49 more)

### Community 11 - "CommentService"
Cohesion: 0.07
Nodes (44): create_comment(), delete_comment(), get_comment_replies(), get_comment_service(), get_post_comments(), hide_comment(), pin_comment(), CommentCreate (+36 more)

### Community 12 - "models/__init__.py"
Cohesion: 0.11
Nodes (62): Base, AlbumPhoto, BlockedUser, CloseFriend, CommentReaction, CommentReport, Conversation, ConversationMember (+54 more)

### Community 13 - "NotificationDropdown.tsx"
Cohesion: 0.20
Nodes (16): NotificationBell(), NotificationDropdown(), NotificationDropdownProps, getNotificationRoute(), getNotificationText(), NotificationItem(), useDeleteNotification(), useMarkAllAsRead() (+8 more)

### Community 14 - "friends/hooks.ts"
Cohesion: 0.07
Nodes (65): UserActionMenu(), UserActionMenuProps, RightSidebar(), Avatar, AVATAR_SIZE_PX, AvatarGroup, AvatarProps, avatarVariants (+57 more)

### Community 15 - "FeedRepository"
Cohesion: 0.08
Nodes (9): PollOption, PollVote, FeedRepository, parse_cursor(), Post, UUID, Decode a feed keyset cursor into (is_pinned, created_at, post_id). Falls back…, FeedPosition (+1 more)

### Community 16 - "services/__init__.py"
Cohesion: 0.18
Nodes (8): BlockedUserDetail, BlockUserRequest, BlockUserResponse, PrivacySettingResponse, PrivacySettingUpdate, BaseModel, PrivacySettingUpdate, UUID

### Community 17 - "PrivacySettingsPage.tsx"
Cohesion: 0.12
Nodes (31): Switch, SwitchProps, BlockMuteList(), BlockMuteListProps, PrivacySection(), PrivacySectionProps, PrivacyToggle(), PrivacyToggleProps (+23 more)

### Community 18 - "MessagingRepository"
Cohesion: 0.11
Nodes (8): MessagingRepository, UUID, Conversation, ConversationMember, Message, MessageReaction, MessageRead, OnlineStatus

### Community 19 - "LiveRepository"
Cohesion: 0.10
Nodes (9): LiveRepository, LiveStream, UUID, LiveChatMessage, LiveDonation, LiveGuest, LiveModerator, LiveReaction (+1 more)

### Community 20 - "friendsApi.ts"
Cohesion: 0.09
Nodes (30): RelationshipButton(), RelationshipButtonProps, ConfirmationDialog(), ConfirmationDialogProps, FollowListProps, cn(), FriendListProps, FriendRequestCardProps (+22 more)

### Community 21 - "User"
Cohesion: 0.12
Nodes (12): Device, LoginHistory, User, DeviceRepository, LoginHistoryRepository, User, UUID, SessionRepository (+4 more)

### Community 22 - "MediaService"
Cohesion: 0.09
Nodes (14): get_media_service(), ReelResponse, StoryReplyResponse, StoryResponse, StoryViewResponse, MediaService, ReelCreate, ReelUpdate (+6 more)

### Community 23 - "CommentItem.tsx"
Cohesion: 0.13
Nodes (29): CommentForm(), CommentFormProps, CommentItem(), CommentItemProps, CommentReplies(), CommentReactions(), CommentReactionsProps, EMOJI_OPTIONS (+21 more)

### Community 24 - "SearchService"
Cohesion: 0.11
Nodes (33): clear_search_history(), delete_saved_search(), get_saved_searches(), get_search_history(), get_search_service(), delete, get, post (+25 more)

### Community 25 - "liquid-glass/index.ts"
Cohesion: 0.16
Nodes (24): clamp(), Geometry, LiquidGlassActiveIndicator(), LiquidGlassActiveIndicatorProps, SPRING, getValueOrMotion(), LiquidGlassFilter(), LiquidGlassFilterProps (+16 more)

### Community 26 - "button.tsx"
Cohesion: 0.06
Nodes (61): Badge(), BadgeProps, badgeVariants, Button, ButtonProps, buttonVariants, Card, CardContent (+53 more)

### Community 27 - "media_service.py"
Cohesion: 0.17
Nodes (26): add_photo_to_album(), AlbumPhotoAdd, AlbumPhotoResponse, CloudinarySignRequest, CloudinarySignResponse, MediaUpdate, MediaUpload, MediaUserResponse (+18 more)

### Community 28 - "HashtagService"
Cohesion: 0.09
Nodes (28): create_hashtag(), follow_hashtag(), get_followed_hashtags(), get_hashtag_detail(), get_hashtag_posts(), get_hashtag_service(), get_trending_hashtags(), delete (+20 more)

### Community 29 - "v1/__init__.py"
Cohesion: 0.22
Nodes (8): Config, get_settings(), Settings, health_check(), get, websocket, websocket_endpoint(), BaseSettings

### Community 30 - "FriendsRepository"
Cohesion: 0.12
Nodes (5): FriendsRepository, CloseFriend, Friendship, User, UUID

### Community 31 - "compilerOptions"
Cohesion: 0.08
Nodes (23): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleDetection (+15 more)

### Community 32 - "devDependencies"
Cohesion: 0.08
Nodes (25): autoprefixer, eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, autoprefixer, eslint, eslint-plugin-react-hooks (+17 more)

### Community 33 - "types/index.ts"
Cohesion: 0.04
Nodes (104): StoriesRow(), timeAgo(), useBlockUser(), CreateReel(), CreateReelProps, Privacy, PRIVACY_OPTIONS, MediaGrid() (+96 more)

### Community 34 - "dependencies"
Cohesion: 0.08
Nodes (25): axios, class-variance-authority, dependencies, axios, class-variance-authority, react, react-dom, @tanstack/react-query (+17 more)

### Community 35 - "GroupService"
Cohesion: 0.07
Nodes (55): attend_event(), create_announcement(), create_event(), create_group(), create_poll(), delete_announcement(), delete_group(), delete_message() (+47 more)

### Community 36 - "hashtags/hooks.ts"
Cohesion: 0.12
Nodes (23): FollowButton(), FollowButtonProps, HashtagCard(), HashtagCardProps, HashtagPostCard(), TrendingTags(), HashtagDetailPage(), HashtagExplorePage() (+15 more)

### Community 37 - "NotificationService"
Cohesion: 0.13
Nodes (22): delete_notification(), get_notification_service(), get_notifications(), get_unread_count(), mark_as_read(), delete, get, post (+14 more)

### Community 38 - "EventService"
Cohesion: 0.06
Nodes (45): cancel_event(), create_event(), delete_chat_message(), delete_event(), get_attendees(), get_chat_messages(), get_event(), get_event_invites() (+37 more)

### Community 39 - "package.json"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, dev, lint, preview, typecheck (+2 more)

### Community 40 - "PrivacyService"
Cohesion: 0.25
Nodes (20): block_user(), get_blocked_users(), get_muted_users(), get_privacy_service(), get_privacy_settings(), get_restricted_users(), mute_user(), delete (+12 more)

### Community 41 - "update_album"
Cohesion: 0.22
Nodes (9): MediaUpdate, PhotoAlbumUpdate, put, ReelUpdate, StoryHighlightUpdate, update_album(), update_highlight(), update_media() (+1 more)

### Community 42 - "ProfilePage.tsx"
Cohesion: 0.05
Nodes (98): useAnalyticsOverview(), CreatePostButton(), CreatePostButtonProps, EmptyFeed(), EmptyFeedProps, FEED_CONFIG, FeedFilters(), FeedFiltersProps (+90 more)

### Community 43 - "useAuthStore"
Cohesion: 0.06
Nodes (43): App(), ProtectedRoute(), PublicRoute(), SetupUsernameRoute(), AppLayout(), AppLayoutProps, LayoutContext, LayoutContextType (+35 more)

### Community 44 - "PhotoAlbumResponse"
Cohesion: 0.39
Nodes (3): PhotoAlbumResponse, PhotoAlbumCreate, PhotoAlbumUpdate

### Community 45 - "UUID"
Cohesion: 0.25
Nodes (6): LiveStreamResponse, LiveScheduleRequest, LiveStreamCreate, LiveStreamUpdate, UUID, LiveStreamListResponse

### Community 46 - "compilerOptions"
Cohesion: 0.33
Nodes (5): compilerOptions, composite, tsBuildInfoFile, include, src

### Community 47 - "opencode.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

### Community 86 - "PrivacyRepository"
Cohesion: 0.23
Nodes (4): PrivacyRepository, BlockedUser, PrivacySetting, UUID

### Community 88 - "videos/hooks.ts"
Cohesion: 0.05
Nodes (66): CategoryFilter(), CategoryFilterProps, formatDuration(), formatViews(), timeAgo(), VideoCard(), VideoCardProps, CommentItem() (+58 more)

### Community 89 - "gray"
Cohesion: 0.09
Nodes (23): $type, $value, $type, $value, $type, $value, $type, $value (+15 more)

### Community 91 - "VideoRepository"
Cohesion: 0.10
Nodes (6): UUID, VideoRepository, Playlist, Video, VideoCategory, VideoComment

### Community 93 - "video_service.py"
Cohesion: 0.24
Nodes (19): PlaylistCreate, PlaylistDetailResponse, PlaylistListResponse, PlaylistResponse, PlaylistUpdate, BaseModel, RecommendationListResponse, VideoCategoryBrief (+11 more)

### Community 99 - "SearchRepository"
Cohesion: 0.13
Nodes (12): LiveStream, Post, Reel, SavedSearch, SearchHistory, Comment, LiveStream, Post (+4 more)

### Community 100 - "Content Visibility Audit — Friendix Social Platform"
Cohesion: 0.04
Nodes (45): BUG F-1 (Critical): Repost sends `null` body — will fail with 422, BUG F-2 (Critical): Quote post sends `null` body — will fail with 422, BUG F-3 (Medium): Profile page PostCard missing all action handlers, BUG F-4 (Low): `useUserMedia` has dead `userId` parameter, BUG F-5 (Low): Infinite spinner if auth never resolves, BUG F-6 (Low): `MediaPage` passes duplicate `userId` arg, BUG L-1 (Critical): `get_active_streams` ignores privacy, BUG L-2 (Critical): `join_stream` ignores privacy — anyone can join any stream (+37 more)

### Community 101 - "AdminRepository"
Cohesion: 0.08
Nodes (20): AuditLog, get_public_settings(), get, Public appearance settings consumed by the client app (category "appearance")., AuditLog, BannedUser, Comment, FeatureFlag (+12 more)

### Community 102 - "Detailed Findings"
Cohesion: 0.07
Nodes (29): 10. CONFIGURATION ISSUES (2 total), 1.1 Feed Hooks (9 unused), 1.2 Media Hooks (18 unused), 1.3 Live Hooks (14 unused), 1.4 Friends Hooks (4 unused), 1.5 Comments Hooks (1 unused), 1. UNUSED REACT HOOKS (37 total), 2. UNUSED UTILITIES (10 total) (+21 more)

### Community 103 - "PROJECT_RULES.md"
Cohesion: 0.08
Nodes (24): 10. Security Rules, 11. Code Quality Rules, 12. AI Coding Assistant Rules, 13. Git Rules, 1. Project Identity, 2. Documentation Rules, 3. Technology Stack, 4. Frontend Architecture Rules (+16 more)

### Community 104 - "UUID"
Cohesion: 0.06
Nodes (9): CloseFriendDetail, FollowResponse, FriendDetail, UUID, BlockDetail, FollowRequestDetail, MuteDetail, RelationshipSummary (+1 more)

### Community 106 - "Tailwind CSS Utility Reference"
Cohesion: 0.05
Nodes (43): Arbitrary Values, Aspect Ratio, Background Colors, Border Color, Border Radius, Border Style, Border Width, Borders (+35 more)

### Community 107 - "cloudinaryTransform.ts"
Cohesion: 0.08
Nodes (33): AdaptiveImageProps, ImagePreset, OptimizedImage, OptimizedImageProps, PRESET_DEFAULTS, useUploadToMedia(), HashtagPostCardProps, DEFAULT_STATE (+25 more)

### Community 108 - "slide_search_core.py"
Cohesion: 0.09
Nodes (36): format_context(), format_result(), main(), Format a single search result for display, Format contextual recommendations for display., BM25, calculate_pattern_break(), detect_domain() (+28 more)

### Community 109 - "Brand Guidelines v1.0"
Cohesion: 0.05
Nodes (37): 1. Color Palette, 2. Typography, 3. Logo Usage, 4. Voice & Tone, 5. Imagery Guidelines, 6. Design Components, Accessibility, AI Image Generation (+29 more)

### Community 110 - "search"
Cohesion: 0.16
Nodes (18): get_cip_brief(), Main search function with auto-domain detection, Search across all domains and combine results, Generate a comprehensive CIP brief for a brand, search(), search_all(), generate_html(), get_deliverable_info() (+10 more)

### Community 115 - "security.py"
Cohesion: 0.25
Nodes (9): create_access_token(), create_refresh_token(), decode_token(), get_current_user_id(), UUID, _parse_user_agent(), HTTPAuthorizationCredentials, timedelta (+1 more)

### Community 116 - "color"
Cohesion: 0.15
Nodes (21): $type, $value, $type, $value, 500, 600, blue, green (+13 more)

### Community 117 - "messaging_websocket"
Cohesion: 0.31
Nodes (4): ConnectionManager, messaging_websocket(), WebSocket, _serialize_message()

### Community 118 - "schemas/__init__.py"
Cohesion: 0.35
Nodes (17): LiveChatMessageCreate, LiveChatMessageListResponse, LiveChatMessageResponse, LiveDonationCreate, LiveDonationListResponse, LiveDonationResponse, LiveGuestCreate, LiveModeratorCreate (+9 more)

### Community 119 - "events/hooks.ts"
Cohesion: 0.09
Nodes (37): EventAttendees(), EventCard(), EventCardProps, EventChat(), EventChatProps, InviteModal(), InviteModalProps, CreateEventPage() (+29 more)

### Community 120 - "Design"
Cohesion: 0.06
Nodes (35): Banner Design (Built-in), Banner: Design Rules, Banner: Quick Size Reference, Banner: Top Art Styles, Banner: Workflow, CIP Design (Built-in), CIP: Generate Brief, CIP: Generate Mockups (+27 more)

### Community 121 - "auth_service.py"
Cohesion: 0.42
Nodes (7): AccountDelete, DeviceResponse, GoogleOAuthRequest, LoginHistoryResponse, BaseModel, TokenResponse, UserResponse

### Community 122 - "Canvas Design System"
Cohesion: 0.06
Nodes (35): 1. Visual Communication First, 2. Minimal Text Integration, 3. Expert Craftsmanship, 4. Systematic Patterns, Analog Meditation, Approach, Canvas Boundaries, Canvas Design System (+27 more)

### Community 123 - "PermissionsService"
Cohesion: 0.21
Nodes (4): PermissionsService, Mute, PrivacySetting, UUID

### Community 124 - "AdminService"
Cohesion: 0.08
Nodes (55): AdminUserListResponse, AuditLogListResponse, ban_user(), create_feature_flag(), create_system_setting(), delete_feature_flag(), delete_system_setting(), get_admin_service() (+47 more)

### Community 125 - "feed_repository.py"
Cohesion: 0.20
Nodes (11): FeedPosition, Notification, Poll, PostHide, encode_cursor(), encode_trending_cursor(), parse_trending_cursor(), datetime (+3 more)

### Community 126 - "groups/hooks.ts"
Cohesion: 0.05
Nodes (66): CreateGroupModal(), CreateGroupModalProps, PRIVACY_OPTIONS, GroupAnnouncements(), GroupAnnouncementsProps, GroupCard(), GroupCardProps, PRIVACY_ICONS (+58 more)

### Community 127 - "AnalyticsPage.tsx"
Cohesion: 0.06
Nodes (29): AnalyticsCardSkeleton(), PostSkeleton(), AnalyticsPage(), periodOptions, Tab, tabs, useEngagement(), useFollowersGrowth() (+21 more)

### Community 134 - "GroupRepository"
Cohesion: 0.09
Nodes (10): GroupRepository, UUID, slugify(), Group, GroupAnnouncement, GroupEvent, GroupJoinRequest, GroupMember (+2 more)

### Community 135 - "Prerequisites"
Cohesion: 0.06
Nodes (33): Accessibility, Available Domains, Available Stacks, Common Rules for Professional UI, Common Sticking Points, Example Workflow, How to Use This Skill, Icons & Visual Elements (+25 more)

### Community 142 - "Form & Input Components"
Cohesion: 0.06
Nodes (32): Accordion, Alert, Alert Dialog, Avatar, Badge, Button, Card, Checkbox (+24 more)

### Community 143 - "Tailwind CSS Responsive Design"
Cohesion: 0.06
Nodes (32): 1. Mobile-First Design, 2. Consistent Breakpoint Usage, 3. Test at Breakpoint Boundaries, 4. Use Container for Content Width, 5. Progressive Enhancement, 6. Avoid Too Many Breakpoints, Best Practices, Breakpoint System (+24 more)

### Community 144 - "ProfileRepository"
Cohesion: 0.19
Nodes (3): ProfileRepository, User, UUID

### Community 145 - "SearchPage.tsx"
Cohesion: 0.09
Nodes (36): useSearchHashtags(), AdvancedFilters(), AdvancedFiltersProps, POST_TYPES, CommentSearchResults(), CommentSearchResultsProps, LiveSearchResults(), LiveSearchResultsProps (+28 more)

### Community 146 - "BM25"
Cohesion: 0.17
Nodes (11): BM25, detect_domain(), _load_csv(), Load CSV and return list of dicts, Core search function using BM25, Auto-detect the most relevant domain from query, BM25 ranking algorithm for text search, Lowercase, split, remove punctuation, filter short words (+3 more)

### Community 149 - "VideoService"
Cohesion: 0.10
Nodes (15): VideoCommentResponse, VideoResponse, PlaylistCreate, PlaylistUpdate, UUID, VideoCommentCreate, VideoCreate, VideoUpdate (+7 more)

### Community 150 - "AnalyticsRepository"
Cohesion: 0.19
Nodes (3): AnalyticsRepository, datetime, UUID

### Community 151 - "live/hooks.ts"
Cohesion: 0.06
Nodes (45): LiveChat(), LiveChatProps, LiveDonations(), LiveDonationsProps, EMOJI_OPTIONS, LiveReactions(), LiveReactionsProps, LiveStreamPlayer() (+37 more)

### Community 152 - "Session"
Cohesion: 0.12
Nodes (38): add_video_to_playlist(), clear_watch_history(), create_comment(), create_playlist(), create_video(), delete_comment(), delete_playlist(), delete_video() (+30 more)

### Community 153 - "AnalyticsService"
Cohesion: 0.22
Nodes (12): get_engagement(), get_followers_growth(), get_overview(), get_post_analytics(), get_profile_views(), get_reel_analytics(), get_story_analytics(), get_video_analytics() (+4 more)

### Community 154 - "FriendsService"
Cohesion: 0.12
Nodes (6): FriendshipResponse, FriendsService, CloseFriendDetail, FollowResponse, FriendDetail, UUID

### Community 155 - "design_system.py"
Cohesion: 0.13
Nodes (20): ansi_ljust(), _detect_page_type(), format_ascii_box(), format_master_md(), format_page_override_md(), _generate_intelligent_overrides(), hex_to_ansi(), persist_design_system() (+12 more)

### Community 156 - "ProfileResponse"
Cohesion: 0.18
Nodes (7): ProfileResponse, AvatarUpdate, CoverPhotoUpdate, ProfileUpdate, UsernameUpdate, UUID, UsernameResponse

### Community 157 - "ProfileService"
Cohesion: 0.18
Nodes (27): check_username(), get_explore_profiles(), get_my_profile(), get_profile_service(), get_public_profile(), AvatarUpdate, CoverPhotoUpdate, get (+19 more)

### Community 159 - "LiveModeratorResponse"
Cohesion: 0.12
Nodes (7): LiveModeratorResponse, LiveChatMessageCreate, LiveDonationCreate, LiveModeratorCreate, LiveReactionCreate, LiveChatMessageListResponse, LiveDonationListResponse

### Community 160 - "Typography Specifications"
Cohesion: 0.06
Nodes (30): Accessibility, Base System, Best Practices, Clean & Modern, Common Font Pairings, Contrast Requirements, CSS Implementation, Editorial (+22 more)

### Community 164 - "MediaResponse"
Cohesion: 0.39
Nodes (3): MediaResponse, MediaUpdate, MediaUpload

### Community 165 - "$type"
Cohesion: 0.60
Nodes (5): $type, $value, 700, 700, 700

### Community 166 - "BM25"
Cohesion: 0.10
Nodes (21): BM25, _domain_keywords(), _get_bm25(), _load_csv(), _load_product_keywords(), _normalize(), Apply synonym substitution before tokenizing., BM25 ranking algorithm for text search (+13 more)

### Community 173 - "Logo Usage Rules"
Cohesion: 0.07
Nodes (28): Absolute Don'ts, Approved Backgrounds, Before Using Logo, Clear Space, Co-branding, Color Rules, Color Usage, Color Variants (+20 more)

### Community 175 - "Component Specifications"
Cohesion: 0.07
Nodes (28): Alert, Anatomy, Anatomy, Anatomy, Anatomy, Anatomy, Badge, Button (+20 more)

### Community 176 - "shadcn/ui Accessibility Patterns"
Cohesion: 0.07
Nodes (28): Accordion, Alert, ARIA Labels, Checkbox and Radio, Color Contrast, Command Palette Navigation, Component-Specific Patterns, Dialog/Modal Navigation (+20 more)

### Community 177 - "TestTailwindConfigGenerator"
Cohesion: 0.07
Nodes (14): Test adding full color palette., Test adding custom spacing., Test adding custom breakpoints., Test TailwindConfigGenerator class., Test plugin recommendations., Test plugin recommendations for Next.js., Test generating config with plugins., Test validating config with empty theme extensions. (+6 more)

### Community 178 - "html-token-validator.py"
Cohesion: 0.13
Nodes (23): get_context(), is_allowed_exception(), is_allowed_rgba(), is_inside_block(), load_css_variables(), main(), print_result(), print_summary() (+15 more)

### Community 179 - "DesignSystemGenerator"
Cohesion: 0.08
Nodes (19): DesignSystemGenerator, _palette_is_dark(), WCAG relative luminance of a #RRGGBB string, or None if unparseable., True when a colors.csv row's Background is a dark surface., Generates design system recommendations from aggregated searches., Load reasoning rules from CSV., Execute searches across multiple domains., Find matching reasoning rule for a category. (+11 more)

### Community 180 - "Asset Approval Checklist"
Cohesion: 0.08
Nodes (25): Accessibility, Archival, Asset Approval Checklist, Automation Support, Color Compliance, Common Issues & Fixes, Content Accessibility, Content Quality (+17 more)

### Community 181 - "Logo AI Prompt Engineering"
Cohesion: 0.08
Nodes (25): Common Pitfalls, Core Prompt Structure, Detailed Brief, Eco/Sustainable, Effective Keywords by Style, Fashion Brand, Healthcare, Industry-Specific Prompts (+17 more)

### Community 182 - "Color Palette Management"
Cohesion: 0.08
Nodes (24): Accessibility Requirements, Brand Compliance Validation, Checking Contrast, Color Documentation Format, Color Extraction, Color Palette Examples, Color Palette Management, Color System Structure (+16 more)

### Community 183 - "CIP Deliverable Guide"
Cohesion: 0.08
Nodes (24): Apparel, Business Card, Car/Sedan, CIP Deliverable Guide, Core Identity, Digital Assets, Email Signature, Envelope (+16 more)

### Community 184 - "BM25"
Cohesion: 0.12
Nodes (19): BM25, detect_domain(), _load_csv(), Load CSV and return list of dicts, Core search function using BM25, Auto-detect the most relevant domain from query, Main search function with auto-domain detection, Search across all domains and combine results (+11 more)

### Community 185 - "States and Variants"
Cohesion: 0.08
Nodes (24): Accessibility, Accessibility Requirements, ARIA States, Color Contrast, Color Variants, Disabled States, Error Messages, Error States (+16 more)

### Community 186 - "UI Styling Skill"
Cohesion: 0.08
Nodes (24): Accessibility Patterns, Alternative: Tailwind-Only Setup, Best Practices, Common Patterns, Component Layer: shadcn/ui, Component Library Guide, Component + Styling Setup, Core Stack (+16 more)

### Community 187 - "Workflow"
Cohesion: 0.08
Nodes (23): Art Direction Styles (Reuse from Banner), Color & Contrast, Design Best Practices, HTML Design Rules, HTML Template Structure, Option A: Chrome Headless CLI (Recommended — zero dependencies), Option B: chrome-devtools skill, Option C: Playwright script (+15 more)

### Community 188 - "relationship_service.py"
Cohesion: 0.25
Nodes (20): BlockDetail, BlockResponse, CloseFriendDetail, CloseFriendResponse, FavoriteUpdate, FollowRequestDetail, FollowRequestResponse, FollowResponse (+12 more)

### Community 189 - "Design System"
Cohesion: 0.09
Nodes (22): Best Practices, Chart.js Integration, Command, Component Spec Pattern, Contextual Decision Flow, Decision System CSVs, Design System, Integration (+14 more)

### Community 190 - "Tailwind CSS Customization"
Cohesion: 0.09
Nodes (22): @apply Directive, Best Practices, Color Customization, Complete Tailwind Config, Configuration Examples, Content Configuration, Custom Color Palette, Custom Font Sizes (+14 more)

### Community 191 - "spacing"
Cohesion: 0.06
Nodes (34): $type, $value, $type, $value, $type, $value, $type, $value (+26 more)

### Community 192 - "Routing by Task Type"
Cohesion: 0.10
Nodes (19): Banner Design Tasks, Brand Identity Tasks, Component Creation, Corporate Identity Program Tasks, Design Routing Guide, Design System Migration, Icon Design Tasks, Implementation Tasks (+11 more)

### Community 193 - "generate-slide.py"
Cohesion: 0.15
Nodes (19): _e(), generate_chart_slide(), generate_cta_slide(), generate_deck(), generate_metrics_slide(), generate_problem_slide(), generate_solution_slide(), generate_testimonial_slide() (+11 more)

### Community 194 - "shadcn/ui Theming & Customization"
Cohesion: 0.10
Nodes (19): Base Color Presets, Best Practices, Color Customization, Color Format, Component Customization, CSS Variable System, Customize Styles, Customize Variants (+11 more)

### Community 195 - "TailwindConfigGenerator"
Cohesion: 0.11
Nodes (10): Generate Tailwind CSS configuration files., Add full color palette (50-950 shades) for a base color. Args: name: Color name…, TailwindConfigGenerator, Test adding colors multiple times., Test adding custom fonts., Test generating TypeScript configuration., Test initialization with different frameworks., Test generating complete JavaScript configuration. (+2 more)

### Community 196 - "Asset Organization Guide"
Cohesion: 0.11
Nodes (18): Asset Entry (manifest.json), Asset Organization Guide, By Campaign, By Status, By Type, Cleanup Workflow, Components, Directory Structure (+10 more)

### Community 197 - "Primary Color Meanings"
Cohesion: 0.11
Nodes (18): Accessibility Considerations, Analogous, Black, Blue, Color Combinations by Industry, Color Harmony Types, Complementary, Green (+10 more)

### Community 198 - "Core Logo Types"
Cohesion: 0.11
Nodes (18): 1. Wordmark (Logotype), 2. Lettermark (Monogram), 3. Pictorial Mark (Brand Mark), 4. Abstract Mark, 5. Mascot, 6. Emblem, 7. Combination Mark, Aesthetic Styles (+10 more)

### Community 199 - "color"
Cohesion: 0.11
Nodes (19): $type, $value, background, foreground, muted-foreground, primary, primary-hover, secondary (+11 more)

### Community 200 - "test_design_system_mode.py"
Cohesion: 0.16
Nodes (10): _filter_anti_patterns_for_mode(), _query_wants_dark(), True when a styles.csv row describes itself as dark-first., True when the query explicitly asks for a dark theme., Resolve the mode the rest of the output has to agree with., Drop "avoid dark mode" advice once dark mode is the resolved answer., _resolve_color_mode(), _style_is_dark_primary() (+2 more)

### Community 201 - "$type"
Cohesion: 0.60
Nodes (5): $type, $value, border, border, border

### Community 202 - "Brand Consistency Checklist"
Cohesion: 0.11
Nodes (17): Audit Frequency, Brand Consistency Checklist, Channel Audit, Collateral, Colors, Common Issues, Email, Imagery (+9 more)

### Community 203 - "CIP Mockup Prompt Engineering"
Cohesion: 0.11
Nodes (17): Apparel (Polo/T-Shirt), Base Prompt Structure, Business Card, CIP Mockup Prompt Engineering, Context Modifiers, Corporate Minimal, Deliverable-Specific Modifiers, Letterhead (+9 more)

### Community 204 - "Color Semantics"
Cohesion: 0.11
Nodes (17): Accent, Applying Semantic Tokens, Background & Foreground, Border & Ring, Color Semantics, Dark Mode Overrides, Destructive, Interactive States (+9 more)

### Community 205 - "fetch-background.py"
Cohesion: 0.17
Nodes (17): generate_css_for_background(), get_background_image(), get_curated_images(), get_overlay_css(), get_pexels_search_url(), load_backgrounds_config(), load_brand_colors(), main() (+9 more)

### Community 206 - "search"
Cohesion: 0.11
Nodes (14): detect_domain(), Auto-detect the most relevant domain from query. Matches are weighted by…, Main search function with auto-domain detection, search(), format_markdown(), generate_design_system(), Format design system as markdown., Main entry point for design system generation. Args: query: Search query (e.g.,… (+6 more)

### Community 207 - "TestShadcnInstaller"
Cohesion: 0.11
Nodes (10): Test ShadcnInstaller class., Test component addition with subprocess error., Create temporary project structure., Test successful addition of all components., Test listing installed components without config., Test initialization with custom project root., Test getting installed components when files exist., Test getting installed components without config. (+2 more)

### Community 208 - "card"
Cohesion: 0.20
Nodes (12): $type, $value, bg, bg, padding, shadow, card, bg (+4 more)

### Community 209 - "Design Principles"
Cohesion: 0.12
Nodes (15): 22 Art Direction Styles, Banner Sizes & Art Direction Styles Reference, Complete Banner Sizes, CTA Rules, Design Principles, Pinterest Research Queries, Print, Print Specs (+7 more)

### Community 210 - "Design Principles"
Cohesion: 0.12
Nodes (15): 22 Art Direction Styles, Banner Sizes & Art Direction Styles Reference, Complete Banner Sizes, CTA Rules, Design Principles, Pinterest Research Queries, Print, Print Specs (+7 more)

### Community 211 - "icon/generate.py"
Cohesion: 0.20
Nodes (15): apply_color(), apply_viewbox_size(), extract_svgs(), generate_batch(), generate_icon(), generate_sizes(), load_env(), main() (+7 more)

### Community 212 - "fontSize"
Cohesion: 0.11
Nodes (20): $type, $value, $type, $value, $type, $value, $type, $value (+12 more)

### Community 213 - "CIP Design Reference"
Cohesion: 0.13
Nodes (14): CIP Brief (Start Here), CIP Design Reference, Commands, Deliverable Categories, Design Styles, Detailed References, Generate Mockups, HTML Presentation Features (+6 more)

### Community 214 - "Icon Design Reference"
Cohesion: 0.13
Nodes (14): Available Styles, CLI Options, Commands, Generate Batch Variations, Generate Multiple Sizes, Generate Single Icon, Icon Categories, Icon Design Reference (+6 more)

### Community 215 - "Copywriting Formulas"
Cohesion: 0.13
Nodes (14): AIDA (Attention-Interest-Desire-Action), Before-After-Bridge, Contrast Patterns, Copywriting Formulas, Core Formulas, Cost of Inaction, FAB (Features-Advantages-Benefits), Formula-to-Slide Mapping (+6 more)

### Community 216 - "Copywriting Formulas"
Cohesion: 0.13
Nodes (14): AIDA (Attention-Interest-Desire-Action), Before-After-Bridge, Contrast Patterns, Copywriting Formulas, Core Formulas, Cost of Inaction, FAB (Features-Advantages-Benefits), Formula-to-Slide Mapping (+6 more)

### Community 217 - "main"
Cohesion: 0.13
Nodes (8): main(), Add custom font families. Args: fonts: Dict of font_type: [font_names] e.g.,…, Add custom spacing values. Args: spacing: Dict of name: value e.g., {'18':…, Add custom breakpoints. Args: breakpoints: Dict of name: width e.g., {'3xl':…, Add plugin requirements. Args: plugins: List of plugin names e.g.,…, Get plugin recommendations based on configuration. Returns: List of recommended…, Validate configuration. Returns: Tuple of (valid, message), Add custom colors to theme. Args: colors: Dict of color_name: color_value Value…

### Community 218 - "UI/UX Implementation Report"
Cohesion: 0.13
Nodes (14): Accessibility Summary, Build Verification, Design System Consistency, Files Changed (17 files), New Components Created, Phase 1 — Critical Fixes, Phase 2 — Loading & Error States, Phase 3 — Accessibility (+6 more)

### Community 219 - "Banner Design - Multi-Format Creative Banner System"
Cohesion: 0.14
Nodes (13): Art Direction Styles (Top 10), Banner Design - Multi-Format Creative Banner System, Banner Size Quick Reference, Design Rules, Prerequisites, Security, Step 1: Gather Requirements (AskUserQuestion), Step 2: Research & Art Direction (+5 more)

### Community 220 - "Messaging Framework"
Cohesion: 0.14
Nodes (13): Core Statements, Elevator Pitches, Framework Structure, Message Architecture, Message by Audience, Message Testing, Messaging Framework, Mission Statement (+5 more)

### Community 221 - "Brand Voice Framework"
Cohesion: 0.14
Nodes (13): Brand Voice Framework, Character Spectrum, Emotion Spectrum, Language Spectrum, Step 1: Define Personality Traits, Step 2: Create Voice Chart, Step 3: Context Adaptation, Tone Spectrum (+5 more)

### Community 222 - "extract-colors.cjs"
Cohesion: 0.22
Nodes (11): calculateCompliance(), colorDistance(), displayPalette(), extractHexColors(), findNearestBrandColor(), fs, generateImageMagickCommand(), hexToRgb() (+3 more)

### Community 223 - "validate-asset.cjs"
Cohesion: 0.25
Nodes (13): checkManifest(), formatBytes(), formatOutput(), fs, main(), parseFilename(), path, RULES (+5 more)

### Community 224 - "Layout Patterns"
Cohesion: 0.14
Nodes (13): Card Styles, Component Variants, CSS Structures, Feature Grid (3 columns), Layout Decision Flow, Layout Patterns, Layout Selection by Use Case, Metric Styles (+5 more)

### Community 225 - "cip/generate.py"
Cohesion: 0.23
Nodes (13): build_cip_prompt(), check_logo_required(), generate_cip_set(), generate_with_nano_banana(), load_env(), load_logo_image(), main(), Generate image using Gemini Nano Banana (native image generation) Supports two… (+5 more)

### Community 226 - "Tailwind Integration"
Cohesion: 0.14
Nodes (13): Animation Tokens, Base Layer, Button Example, Component Classes, CSS Variables Setup, Dark Mode Toggle, HSL Format Benefits, shadcn/ui Alignment (+5 more)

### Community 227 - "radius"
Cohesion: 0.11
Nodes (27): $type, $value, lg, sm, $type, $value, $type, $value (+19 more)

### Community 228 - "Layout Patterns"
Cohesion: 0.14
Nodes (13): Card Styles, Component Variants, CSS Structures, Feature Grid (3 columns), Layout Decision Flow, Layout Patterns, Layout Selection by Use Case, Metric Styles (+5 more)

### Community 229 - "update.md"
Cohesion: 0.15
Nodes (12): Color Presets, Examples, Files Modified, Important, Overview, Skills Used, Step 1: Gather Brand Input, Step 2: Update Brand Guidelines (+4 more)

### Community 230 - "Logo Design Reference"
Cohesion: 0.15
Nodes (12): Available Styles, Color Psychology, Commands, Design Brief (Start Here), Detailed References, Generate Logo, Industry Defaults, Logo Design Reference (+4 more)

### Community 231 - "Token Architecture"
Cohesion: 0.15
Nodes (12): Categories, Dark Mode, File Organization, Layer 1: Primitive Tokens, Layer 2: Semantic Tokens, Layer 3: Component Tokens, Layer Overview, Migration from Flat Tokens (+4 more)

### Community 232 - "design-tokens-starter.json"
Cohesion: 0.15
Nodes (12): component, $type, $value, dark, semantic, $schema, $type, $value (+4 more)

### Community 233 - "Primitive Tokens"
Cohesion: 0.17
Nodes (11): Border Radius, Color Scales, Gray Scale, Motion / Duration, Primary Colors (Blue), Primitive Tokens, Shadows, Spacing Scale (+3 more)

### Community 234 - "validate-tokens.cjs"
Cohesion: 0.24
Nodes (11): extensions, formatReport(), fs, getFiles(), main(), parseArgs(), path, patterns (+3 more)

### Community 235 - "ShadcnInstaller"
Cohesion: 0.17
Nodes (7): Handle shadcn/ui component installation., Initialize installer. Args: project_root: Project root directory (default:…, ShadcnInstaller, Test adding components that are already installed., Test component addition when npx is not found., Test initialization with default project root., Test getting installed components when none exist.

### Community 236 - ".add_components"
Cohesion: 0.17
Nodes (8): main(), Add all available shadcn/ui components. Args: overwrite: If True, overwrite…, List installed components. Returns: Tuple of (success, message with component…, Check if shadcn is initialized in project. Returns: True if components.json…, Get list of already installed components. Returns: List of installed component…, Read shadcn version from project package.json; fall back to a pinned default., Add shadcn/ui components. Args: components: List of component names to add…, Tests for shadcn_add.py

### Community 237 - "test_tailwind_config_gen.py"
Cohesion: 0.20
Nodes (7): Tests for tailwind_config_gen.py, Reduce a generated TS/JS config to a bare assignable object so it can be handed…, Regression guard for the missing-comma bug between the ``theme`` block and…, The property preceding ``plugins`` must end with a comma (pure-Python check, so…, The emitted config parses as valid JS via ``node --check``., _strip_to_object(), TestGeneratedConfigIsValidJs

### Community 238 - ".generate_config_string"
Cohesion: 0.20
Nodes (6): Generate configuration file content. Returns: Configuration file as string, Generate TypeScript configuration., Generate JavaScript configuration., Format plugins array for config. Validates each plugin name against a strict…, Add indentation to JSON string., Write configuration to file. Returns: Tuple of (success, message)

### Community 240 - "Core Visual Elements"
Cohesion: 0.18
Nodes (10): Color Palette, Colors, Core Visual Elements, Logo, Logo, Quick Checks, Typography, Typography (+2 more)

### Community 241 - "inject-brand-context.cjs"
Cohesion: 0.31
Nodes (10): extractColorsFromTable(), extractCoreAttributes(), extractHexColors(), extractImageStyle(), extractTypography(), extractVoice(), fs, generatePromptAddition() (+2 more)

### Community 242 - "CIP Design Style Guide"
Cohesion: 0.18
Nodes (10): Bold Dynamic, CIP Design Style Guide, Classic Traditional, Color Psychology, Corporate Minimal, Fresh Modern, Luxury Premium, Modern Tech (+2 more)

### Community 243 - "embed-tokens.cjs"
Cohesion: 0.20
Nodes (9): args, extractTokens(), fs, minimal, MINIMAL_TOKENS, path, projectRoot, tokensPath (+1 more)

### Community 245 - "._base_config"
Cohesion: 0.25
Nodes (4): Initialize generator. Args: typescript: If True, generate .ts config, else .js…, Determine default output path., Create base configuration structure., Get default content paths for framework.

### Community 246 - "Brand"
Cohesion: 0.20
Nodes (9): Brand, Brand Sync Workflow, Quick Start, References, Routing, Scripts, Subcommands, Templates (+1 more)

### Community 247 - "Slide Strategies"
Cohesion: 0.20
Nodes (9): Common Structures, Duarte Sparkline Pattern, Matching Strategy to Context, Product Demo (6 slides), Sales Pitch (9 slides), Search Commands, Slide Strategies, Strategy Selection (+1 more)

### Community 248 - "logo/generate.py"
Cohesion: 0.29
Nodes (9): enhance_prompt(), generate_batch(), generate_logo(), load_env(), main(), Enhance the logo prompt with style and industry modifiers, Generate a logo using Gemini models with image generation Args: aspect_ratio:…, Generate multiple logo variants with different styles (+1 more)

### Community 249 - "Component Tokens"
Cohesion: 0.20
Nodes (9): Alert Tokens, Badge Tokens, Button Tokens, Card Tokens, Component Tokens, Dialog/Modal Tokens, Input Tokens, Table Tokens (+1 more)

### Community 250 - "generate-tokens.cjs"
Cohesion: 0.36
Nodes (9): flattenTokens(), fs, generateCSS(), generateTailwind(), main(), parseArgs(), path, resolveReference() (+1 more)

### Community 251 - "button"
Cohesion: 0.20
Nodes (10): fg, font-size, hover-bg, button, $type, $value, $type, $value (+2 more)

### Community 252 - "primitive"
Cohesion: 0.18
Nodes (11): fast, normal, slow, $type, $value, $type, $value, primitive (+3 more)

### Community 253 - "Slide Strategies"
Cohesion: 0.20
Nodes (9): Common Structures, Duarte Sparkline Pattern, Matching Strategy to Context, Product Demo (6 slides), Sales Pitch (9 slides), Search Commands, Slide Strategies, Strategy Selection (+1 more)

### Community 254 - "test_validate_tokens.py"
Cohesion: 0.38
Nodes (6): Regression tests for validate-tokens.cjs. The validator used to skip any line…, A hardcoded hex on the same line as a var() token is still a violation., A line that references only tokens produces no false positives., _run(), test_flags_hardcoded_hex_sharing_line_with_token(), test_token_only_line_reports_no_violation()

### Community 255 - "radius"
Cohesion: 0.60
Nodes (5): radius, radius, radius, $type, $value

### Community 256 - "sync-brand-to-tokens.cjs"
Cohesion: 0.33
Nodes (8): adjustBrightness(), { execFileSync }, extractColorsFromMarkdown(), fs, generateColorScale(), main(), path, updateDesignTokens()

### Community 257 - "NotificationRepository"
Cohesion: 0.28
Nodes (3): NotificationRepository, UUID, Notification

### Community 258 - "permissions.py"
Cohesion: 0.47
Nodes (5): is_admin(), is_moderator(), UUID, Check if a user has moderator or admin role., Check if a user has admin role.

### Community 259 - "Slides Reference"
Cohesion: 0.29
Nodes (6): Key Features, Knowledge Base, Slides Reference, Usage, When to Use, Workflow

### Community 260 - "HTML Slide Template"
Cohesion: 0.29
Nodes (6): Animation Classes, Background Images, Base Structure, Chart.js Integration, CSS Variables Reference, HTML Slide Template

### Community 261 - "HTML Slide Template"
Cohesion: 0.29
Nodes (6): Animation Classes, Background Images, Base Structure, Chart.js Integration, CSS Variables Reference, HTML Slide Template

### Community 262 - "800"
Cohesion: 0.67
Nodes (4): $type, $value, 800, 800

### Community 263 - "_select_palette_for_mode"
Cohesion: 0.43
Nodes (3): Pick the highest-ranked palette matching the resolved mode. Only the dark case…, _select_palette_for_mode(), TestPaletteSelection

### Community 264 - "input"
Cohesion: 0.29
Nodes (8): padding-x, input, $type, $value, focus-ring, padding-x, $type, $value

### Community 265 - "Slides"
Cohesion: 0.33
Nodes (5): References (Knowledge Base), Routing, Slides, Subcommands, When to Use

### Community 266 - "padding-y"
Cohesion: 0.67
Nodes (4): padding-y, padding-y, $type, $value

### Community 267 - "Brand Guidelines Template"
Cohesion: 0.40
Nodes (4): Brand Guidelines Template, Document Structure, Extractable Fields, Usage

### Community 268 - "destructive"
Cohesion: 0.67
Nodes (3): destructive, $type, $value

### Community 269 - "destructive-foreground"
Cohesion: 0.67
Nodes (3): destructive-foreground, $type, $value

### Community 270 - "muted"
Cohesion: 0.67
Nodes (3): muted, $type, $value

### Community 272 - "primary-foreground"
Cohesion: 0.67
Nodes (3): primary-foreground, $type, $value

### Community 274 - "validate_data.py"
Cohesion: 0.83
Nodes (3): _check_file(), main(), _read_rows()

### Community 284 - "ring"
Cohesion: 0.67
Nodes (3): ring, $type, $value

### Community 285 - "secondary-foreground"
Cohesion: 0.67
Nodes (3): secondary-foreground, $type, $value

## Knowledge Gaps
- **1271 isolated node(s):** `Config`, `name`, `private`, `version`, `type` (+1266 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **50 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `User` to `NotificationRepository`, `permissions.py`, `MessagingService`, `RelationshipRepository`, `GroupRepository`, `RelationshipService`, `CommentService`, `models/__init__.py`, `FeedRepository`, `ProfileRepository`, `MessagingRepository`, `LiveRepository`, `AnalyticsRepository`, `HashtagService`, `FriendsRepository`, `NotificationService`, `EventService`, `relationship_service.py`, `PrivacyRepository`, `VideoRepository`, `SearchRepository`, `AdminRepository`, `messaging_websocket`, `PermissionsService`, `AdminService`, `feed_repository.py`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `ProfileRepository` connect `ProfileRepository` to `LiveService`, `FeedService`, `GroupRepository`, `RelationshipService`, `services/__init__.py`, `LiveRepository`, `User`, `VideoService`, `SearchService`, `FriendsService`, `HashtagService`, `ProfileService`, `GroupService`, `EventService`, `PrivacyService`, `relationship_service.py`, `PrivacyRepository`, `video_service.py`, `SearchRepository`, `schemas/__init__.py`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `Friendship` connect `models/__init__.py` to `LiveService`, `MessagingService`, `RelationshipRepository`, `MediaRepository`, `RelationshipService`, `v1/media.py`, `CommentService`, `FeedRepository`, `MessagingRepository`, `LiveRepository`, `AnalyticsRepository`, `FriendsService`, `FriendsRepository`, `relationship_service.py`, `VideoRepository`, `AdminRepository`, `schemas/__init__.py`, `PermissionsService`, `feed_repository.py`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Are the 26 inferred relationships involving `MediaService` (e.g. with `FeedRepository` and `MediaRepository`) actually correct?**
  _`MediaService` has 26 INFERRED edges - model-reasoned connections that need verification._
- **Are the 25 inferred relationships involving `RelationshipService` (e.g. with `BlockedUser` and `FollowRequest`) actually correct?**
  _`RelationshipService` has 25 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `Session` (e.g. with `Base` and `DeviceRepository`) actually correct?**
  _`Session` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 23 inferred relationships involving `FeedRepository` (e.g. with `BlockedUser` and `CloseFriend`) actually correct?**
  _`FeedRepository` has 23 INFERRED edges - model-reasoned connections that need verification._