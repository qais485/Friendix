# Graph Report - Friendix Social Platform  (2026-08-04)

## Corpus Check
- 400 files · ~167,392 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 5741 nodes · 13048 edges · 329 communities (277 shown, 52 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 540 edges (avg confidence: 0.5)
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
- UUID
- composer/index.ts
- v1/media.py
- CommentService
- models/__init__.py
- profile/hooks.ts
- ProfilePage.tsx
- FeedRepository
- PrivacyRepository
- PrivacySettingsPage.tsx
- MessagingRepository
- LiveRepository
- SearchService
- DeviceRepository
- MediaService
- types/index.ts
- LiveGuestResponse
- media/hooks.ts
- button.tsx
- media_service.py
- HashtagService
- security.py
- FriendsRepository
- compilerOptions
- devDependencies
- media/components/index.ts
- dependencies
- GroupService
- mediaApi.ts
- NotificationService
- EventService
- package.json
- UserRepository
- update_album
- HomePage.tsx
- StoriesRow.tsx
- PhotoAlbumResponse
- cloudinaryTransform.ts
- compilerOptions
- opencode.json
- vite-env.d.ts
- graphify.js
- NotificationItem.tsx
- @radix-ui/react-label
- videos/hooks.ts
- gray
- react-router-dom
- VideoRepository
- video_service.py
- User
- Content Visibility Audit — Friendix Social Platform
- models.py
- Detailed Findings
- PROJECT_RULES.md
- UUID
- clsx
- Tailwind CSS Utility Reference
- v1/__init__.py
- slide_search_core.py
- Brand Guidelines v1.0
- BM25
- AGENTS.md
- $type
- @tiptap/extension-horizontal-rule
- @tiptap/extension-placeholder
- events/hooks.ts
- Design
- permissions.py
- Canvas Design System
- PermissionsService
- AdminService
- LiveModeratorResponse
- groups/hooks.ts
- AnalyticsPage.tsx
- GroupRepository
- Prerequisites
- Form & Input Components
- Tailwind CSS Responsive Design
- ProfileRepository
- SearchPage.tsx
- ._enrich_donation
- VideoService
- AnalyticsRepository
- live/hooks.ts
- Session
- AnalyticsService
- FriendsService
- design_system.py
- CreateReel.tsx
- NotificationRepository
- input
- Typography Specifications
- friendsApi.ts
- none
- StoryHighlights.tsx
- primary
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
- schemas/__init__.py
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
- duration
- Slide Strategies
- test_validate_tokens.py
- PhotoAlbumView.tsx
- sync-brand-to-tokens.cjs
- StoryArchiveView.tsx
- padding-x
- Slides Reference
- HTML Slide Template
- HTML Slide Template
- 16
- _select_palette_for_mode
- dompurify
- Slides
- 1
- Brand Guidelines Template
- radius
- 3
- sm
- lucide-react
- xl
- .test_add_components_no_config
- validate_data.py
- test_sync_brand_to_tokens.py
- main
- class-variance-authority
- useAuthStore
- .test_add_components_success
- 8
- .test_add_all_components_no_config
- destructive-foreground
- muted
- primary-foreground
- secondary-foreground
- ring
- @tiptap/extension-highlight
- @tiptap/extension-underline
- @radix-ui/react-avatar
- @radix-ui/react-slot
- @tiptap/starter-kit
- @tiptap/extension-link
- .test_add_all_components_dry_run
- @types/dompurify
- zustand
- slides-create.md
- create.md
- .test_add_components_dry_run
- .test_list_installed_with_components
- lg
- .test_check_shadcn_config_not_exists
- .test_list_installed_empty
- .test_init_dry_run
- tailwindcss-animate
- .test_check_shadcn_config_exists
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
- framer-motion

## God Nodes (most connected - your core abstractions)
1. `MediaService` - 131 edges
2. `RelationshipService` - 105 edges
3. `Session` - 102 edges
4. `FeedRepository` - 93 edges
5. `LiveService` - 91 edges
6. `FeedService` - 88 edges
7. `Base` - 86 edges
8. `Button` - 86 edges
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

## Communities (329 total, 52 thin omitted)

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
Cohesion: 0.07
Nodes (60): CallModal(), CallModalProps, CallState, ChatHeader(), ChatHeaderProps, formatLastSeen(), ChatList(), ChatThemeSelector() (+52 more)

### Community 4 - "RelationshipRepository"
Cohesion: 0.07
Nodes (9): BlockedUser, CloseFriend, Friendship, Mute, User, UUID, RelationshipRepository, FollowRequest (+1 more)

### Community 5 - "v1/auth.py"
Cohesion: 0.13
Nodes (24): delete_account(), get_auth_service(), get_current_user(), get_devices(), get_login_history(), google_login(), logout(), logout_all() (+16 more)

### Community 6 - "MediaRepository"
Cohesion: 0.06
Nodes (13): AlbumPhoto, MediaRepository, datetime, Reel, UUID, Media, PhotoAlbum, Story (+5 more)

### Community 7 - "RelationshipService"
Cohesion: 0.14
Nodes (47): accept_follow_request(), accept_friend_request(), add_close_friend(), block_user(), cancel_follow_request(), cancel_friend_request(), follow_user(), get_blocked_users() (+39 more)

### Community 8 - "UUID"
Cohesion: 0.25
Nodes (6): LiveStreamResponse, LiveScheduleRequest, LiveStreamCreate, LiveStreamUpdate, UUID, LiveStreamListResponse

### Community 9 - "composer/index.ts"
Cohesion: 0.05
Nodes (45): Label, labelVariants, Switch, SwitchProps, BackgroundPicker(), BackgroundPickerProps, POST_BACKGROUNDS, POST_BG_TEMPLATES (+37 more)

### Community 10 - "v1/media.py"
Cohesion: 0.09
Nodes (57): add_reaction(), add_reply(), add_story_to_highlight(), archive_story(), create_album(), create_highlight(), create_reel(), create_story() (+49 more)

### Community 11 - "CommentService"
Cohesion: 0.07
Nodes (44): create_comment(), delete_comment(), get_comment_replies(), get_comment_service(), get_post_comments(), hide_comment(), pin_comment(), CommentCreate (+36 more)

### Community 12 - "models/__init__.py"
Cohesion: 0.11
Nodes (59): Base, AlbumPhoto, BlockedUser, CloseFriend, Conversation, ConversationMember, Event, EventChatMessage (+51 more)

### Community 13 - "profile/hooks.ts"
Cohesion: 0.08
Nodes (38): Textarea, SetupUsernamePage(), UsernameStatus, EditProfileModal(), EditProfileModalProps, GENDER_OPTIONS, RELATIONSHIP_OPTIONS, THEME_OPTIONS (+30 more)

### Community 14 - "ProfilePage.tsx"
Cohesion: 0.07
Nodes (72): RelationshipButton(), UserActionMenu(), UserActionMenuProps, RightSidebar(), ToastContainer(), ConfirmationDialog(), ConfirmationDialogProps, useAnalyticsOverview() (+64 more)

### Community 15 - "FeedRepository"
Cohesion: 0.05
Nodes (39): check_username(), get_explore_profiles(), get_my_profile(), get_profile_service(), get_public_profile(), AvatarUpdate, CoverPhotoUpdate, get (+31 more)

### Community 16 - "PrivacyRepository"
Cohesion: 0.09
Nodes (32): block_user(), get_blocked_users(), get_muted_users(), get_privacy_service(), get_privacy_settings(), get_restricted_users(), mute_user(), delete (+24 more)

### Community 17 - "PrivacySettingsPage.tsx"
Cohesion: 0.14
Nodes (29): BlockMuteList(), BlockMuteListProps, TYPE_CONFIG, PrivacySection(), PrivacySectionProps, PrivacyToggle(), UserSearch(), useBlockedUsers() (+21 more)

### Community 18 - "MessagingRepository"
Cohesion: 0.11
Nodes (8): MessagingRepository, UUID, Conversation, ConversationMember, Message, MessageReaction, MessageRead, OnlineStatus

### Community 19 - "LiveRepository"
Cohesion: 0.11
Nodes (9): LiveRepository, LiveStream, UUID, LiveChatMessage, LiveDonation, LiveGuest, LiveModerator, LiveReaction (+1 more)

### Community 20 - "SearchService"
Cohesion: 0.11
Nodes (33): clear_search_history(), delete_saved_search(), get_saved_searches(), get_search_history(), get_search_service(), delete, get, post (+25 more)

### Community 21 - "DeviceRepository"
Cohesion: 0.15
Nodes (9): Device, LoginHistory, DeviceRepository, LoginHistoryRepository, UUID, SessionRepository, Device, LoginHistory (+1 more)

### Community 22 - "MediaService"
Cohesion: 0.08
Nodes (16): get_media_service(), MediaResponse, ReelResponse, StoryReplyResponse, StoryResponse, MediaService, MediaUpdate, MediaUpload (+8 more)

### Community 23 - "types/index.ts"
Cohesion: 0.13
Nodes (29): CommentForm(), CommentFormProps, CommentItem(), CommentItemProps, CommentReplies(), CommentReactions(), CommentReactionsProps, EMOJI_OPTIONS (+21 more)

### Community 24 - "LiveGuestResponse"
Cohesion: 0.15
Nodes (5): LiveGuestResponse, LiveChatMessageCreate, LiveGuestCreate, LiveReactionCreate, LiveChatMessageListResponse

### Community 25 - "media/hooks.ts"
Cohesion: 0.11
Nodes (22): PhotoAlbumView(), useActiveStories(), useAddPhotoToAlbum(), useAlbum(), useAlbumPhotos(), useCloudinarySignature(), useCreateAlbum(), useDeleteAlbum() (+14 more)

### Community 26 - "button.tsx"
Cohesion: 0.05
Nodes (62): Badge(), BadgeProps, badgeVariants, Button, ButtonProps, buttonVariants, Card, CardContent (+54 more)

### Community 27 - "media_service.py"
Cohesion: 0.15
Nodes (27): add_photo_to_album(), AlbumPhotoAdd, AlbumPhotoResponse, CloudinarySignRequest, CloudinarySignResponse, MediaUpdate, MediaUpload, MediaUserResponse (+19 more)

### Community 28 - "HashtagService"
Cohesion: 0.09
Nodes (28): create_hashtag(), follow_hashtag(), get_followed_hashtags(), get_hashtag_detail(), get_hashtag_posts(), get_hashtag_service(), get_trending_hashtags(), delete (+20 more)

### Community 29 - "security.py"
Cohesion: 0.28
Nodes (10): create_access_token(), create_refresh_token(), decode_token(), get_current_user_id(), UUID, GoogleOAuthRequest, _parse_user_agent(), HTTPAuthorizationCredentials (+2 more)

### Community 30 - "FriendsRepository"
Cohesion: 0.12
Nodes (5): FriendsRepository, CloseFriend, Friendship, User, UUID

### Community 31 - "compilerOptions"
Cohesion: 0.08
Nodes (23): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleDetection (+15 more)

### Community 32 - "devDependencies"
Cohesion: 0.08
Nodes (25): autoprefixer, eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, autoprefixer, eslint, eslint-plugin-react-hooks (+17 more)

### Community 33 - "media/components/index.ts"
Cohesion: 0.13
Nodes (17): DEFAULT_STATE, EditState, ImageEditor(), ImageEditorProps, ReelPlayer(), QUICK_REACTIONS, StoryReactions(), StoryReactionsProps (+9 more)

### Community 34 - "dependencies"
Cohesion: 0.08
Nodes (25): axios, dependencies, axios, react, react-dom, tailwind-merge, @tanstack/react-query, @tiptap/extension-font-family (+17 more)

### Community 35 - "GroupService"
Cohesion: 0.07
Nodes (55): attend_event(), create_announcement(), create_event(), create_group(), create_poll(), delete_announcement(), delete_group(), delete_message() (+47 more)

### Community 36 - "mediaApi.ts"
Cohesion: 0.17
Nodes (19): AlbumPhoto, CloudinarySignature, MediaStats, MediaTab, MediaUpdate, MediaUpload, PhotoAlbumCreate, PhotoAlbumUpdate (+11 more)

### Community 37 - "NotificationService"
Cohesion: 0.13
Nodes (21): delete_notification(), get_notification_service(), get_notifications(), get_unread_count(), mark_as_read(), delete, get, post (+13 more)

### Community 38 - "EventService"
Cohesion: 0.06
Nodes (45): cancel_event(), create_event(), delete_chat_message(), delete_event(), get_attendees(), get_chat_messages(), get_event(), get_event_invites() (+37 more)

### Community 39 - "package.json"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, dev, lint, preview, typecheck (+2 more)

### Community 41 - "update_album"
Cohesion: 0.22
Nodes (9): MediaUpdate, PhotoAlbumUpdate, put, ReelUpdate, StoryHighlightUpdate, update_album(), update_highlight(), update_media() (+1 more)

### Community 42 - "HomePage.tsx"
Cohesion: 0.09
Nodes (55): LiquidGlassFilter(), ParsedContent(), ParsedContentProps, InputDialog(), InputDialogProps, getPostBackgroundStyle(), CreatePostForm(), EmptyFeed() (+47 more)

### Community 43 - "StoriesRow.tsx"
Cohesion: 0.36
Nodes (6): MusicStoryCreator(), MusicStoryCreatorProps, SAMPLE_TRACKS, StoryCreator(), StoryCreatorProps, useCreateStory()

### Community 44 - "PhotoAlbumResponse"
Cohesion: 0.39
Nodes (3): PhotoAlbumResponse, PhotoAlbumCreate, PhotoAlbumUpdate

### Community 45 - "cloudinaryTransform.ts"
Cohesion: 0.11
Nodes (26): ImagePreset, OptimizedImage, OptimizedImageProps, PRESET_DEFAULTS, MediaCard(), MediaCardProps, TYPE_COLORS, TYPE_ICONS (+18 more)

### Community 46 - "compilerOptions"
Cohesion: 0.33
Nodes (5): compilerOptions, composite, tsBuildInfoFile, include, src

### Community 47 - "opencode.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

### Community 86 - "NotificationItem.tsx"
Cohesion: 0.17
Nodes (20): NotificationBell(), NotificationDropdown(), NotificationDropdownProps, getNotificationRoute(), getNotificationText(), NOTIFICATION_COLORS, NOTIFICATION_ICONS, NotificationItem() (+12 more)

### Community 88 - "videos/hooks.ts"
Cohesion: 0.05
Nodes (64): CategoryFilter(), CategoryFilterProps, formatDuration(), formatViews(), timeAgo(), VideoCard(), VideoCardProps, CommentItem() (+56 more)

### Community 89 - "gray"
Cohesion: 0.05
Nodes (53): $type, $value, $type, $value, $type, $value, $type, $value (+45 more)

### Community 91 - "VideoRepository"
Cohesion: 0.09
Nodes (12): Playlist, PlaylistVideo, VideoCategory, VideoLike, WatchHistory, WatchLater, UUID, VideoRepository (+4 more)

### Community 93 - "video_service.py"
Cohesion: 0.24
Nodes (19): PlaylistCreate, PlaylistDetailResponse, PlaylistListResponse, PlaylistResponse, PlaylistUpdate, BaseModel, RecommendationListResponse, VideoCategoryBrief (+11 more)

### Community 99 - "User"
Cohesion: 0.13
Nodes (10): SavedSearch, SearchHistory, User, Comment, LiveStream, Post, Reel, User (+2 more)

### Community 100 - "Content Visibility Audit — Friendix Social Platform"
Cohesion: 0.04
Nodes (45): BUG F-1 (Critical): Repost sends `null` body — will fail with 422, BUG F-2 (Critical): Quote post sends `null` body — will fail with 422, BUG F-3 (Medium): Profile page PostCard missing all action handlers, BUG F-4 (Low): `useUserMedia` has dead `userId` parameter, BUG F-5 (Low): Infinite spinner if auth never resolves, BUG F-6 (Low): `MediaPage` passes duplicate `userId` arg, BUG L-1 (Critical): `get_active_streams` ignores privacy, BUG L-2 (Critical): `join_stream` ignores privacy — anyone can join any stream (+37 more)

### Community 101 - "models.py"
Cohesion: 0.09
Nodes (21): AuditLog, AuditLog, BannedUser, Comment, CommentReaction, CommentReport, FeatureFlag, Message (+13 more)

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

### Community 107 - "v1/__init__.py"
Cohesion: 0.13
Nodes (12): ConnectionManager, messaging_websocket(), WebSocket, _serialize_message(), Config, get_settings(), Settings, health_check() (+4 more)

### Community 108 - "slide_search_core.py"
Cohesion: 0.09
Nodes (36): format_context(), format_result(), main(), Format a single search result for display, Format contextual recommendations for display., BM25, calculate_pattern_break(), detect_domain() (+28 more)

### Community 109 - "Brand Guidelines v1.0"
Cohesion: 0.05
Nodes (37): 1. Color Palette, 2. Typography, 3. Logo Usage, 4. Voice & Tone, 5. Imagery Guidelines, 6. Design Components, Accessibility, AI Image Generation (+29 more)

### Community 110 - "BM25"
Cohesion: 0.09
Nodes (29): BM25, detect_domain(), get_cip_brief(), _load_csv(), Load CSV and return list of dicts, Core search function using BM25, Auto-detect the most relevant domain from query, Main search function with auto-domain detection (+21 more)

### Community 115 - "$type"
Cohesion: 0.60
Nodes (5): $type, $value, border, border, border

### Community 119 - "events/hooks.ts"
Cohesion: 0.09
Nodes (37): EventAttendees(), EventCard(), EventCardProps, EventChat(), EventChatProps, InviteModal(), InviteModalProps, CreateEventPage() (+29 more)

### Community 120 - "Design"
Cohesion: 0.06
Nodes (35): Banner Design (Built-in), Banner: Design Rules, Banner: Quick Size Reference, Banner: Top Art Styles, Banner: Workflow, CIP Design (Built-in), CIP: Generate Brief, CIP: Generate Mockups (+27 more)

### Community 121 - "permissions.py"
Cohesion: 0.47
Nodes (5): is_admin(), is_moderator(), UUID, Check if a user has moderator or admin role., Check if a user has admin role.

### Community 122 - "Canvas Design System"
Cohesion: 0.06
Nodes (35): 1. Visual Communication First, 2. Minimal Text Integration, 3. Expert Craftsmanship, 4. Systematic Patterns, Analog Meditation, Approach, Canvas Boundaries, Canvas Design System (+27 more)

### Community 123 - "PermissionsService"
Cohesion: 0.21
Nodes (4): PermissionsService, Mute, PrivacySetting, UUID

### Community 124 - "AdminService"
Cohesion: 0.08
Nodes (55): AdminUserListResponse, AuditLogListResponse, ban_user(), create_feature_flag(), create_system_setting(), delete_feature_flag(), delete_system_setting(), get_admin_service() (+47 more)

### Community 126 - "groups/hooks.ts"
Cohesion: 0.05
Nodes (66): CreateGroupModal(), CreateGroupModalProps, PRIVACY_OPTIONS, GroupAnnouncements(), GroupAnnouncementsProps, GroupCard(), GroupCardProps, PRIVACY_ICONS (+58 more)

### Community 127 - "AnalyticsPage.tsx"
Cohesion: 0.05
Nodes (31): ErrorBannerProps, ErrorState(), ErrorStateProps, AnalyticsCardSkeleton(), AnalyticsPage(), periodOptions, Tab, tabs (+23 more)

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
Cohesion: 0.16
Nodes (3): ProfileRepository, User, UUID

### Community 145 - "SearchPage.tsx"
Cohesion: 0.05
Nodes (59): FollowButton(), FollowButtonProps, HashtagCard(), HashtagCardProps, HashtagPostCard(), TrendingTags(), HashtagDetailPage(), HashtagExplorePage() (+51 more)

### Community 149 - "VideoService"
Cohesion: 0.10
Nodes (15): VideoCommentResponse, VideoResponse, PlaylistCreate, PlaylistUpdate, UUID, VideoCommentCreate, VideoCreate, VideoUpdate (+7 more)

### Community 150 - "AnalyticsRepository"
Cohesion: 0.18
Nodes (4): ProfileView, AnalyticsRepository, datetime, UUID

### Community 151 - "live/hooks.ts"
Cohesion: 0.06
Nodes (45): LiveChat(), LiveChatProps, LiveDonations(), LiveDonationsProps, EMOJI_OPTIONS, LiveReactions(), LiveReactionsProps, LiveStreamPlayer() (+37 more)

### Community 152 - "Session"
Cohesion: 0.15
Nodes (38): add_video_to_playlist(), clear_watch_history(), create_comment(), create_playlist(), create_video(), delete_comment(), delete_playlist(), delete_video() (+30 more)

### Community 153 - "AnalyticsService"
Cohesion: 0.22
Nodes (12): get_engagement(), get_followers_growth(), get_overview(), get_post_analytics(), get_profile_views(), get_reel_analytics(), get_story_analytics(), get_video_analytics() (+4 more)

### Community 154 - "FriendsService"
Cohesion: 0.12
Nodes (6): FriendshipResponse, FriendsService, CloseFriendDetail, FollowResponse, FriendDetail, UUID

### Community 155 - "design_system.py"
Cohesion: 0.09
Nodes (27): ansi_ljust(), _detect_page_type(), format_ascii_box(), format_markdown(), format_master_md(), format_page_override_md(), generate_design_system(), _generate_intelligent_overrides() (+19 more)

### Community 156 - "CreateReel.tsx"
Cohesion: 0.23
Nodes (10): CreateReel(), CreateReelProps, Privacy, PRIVACY_OPTIONS, ReelPlayerProps, useCreateReel(), useUploadMedia(), uploadToCloudinary() (+2 more)

### Community 157 - "NotificationRepository"
Cohesion: 0.25
Nodes (4): Notification, NotificationRepository, UUID, Notification

### Community 159 - "input"
Cohesion: 0.29
Nodes (8): padding-y, input, $type, $value, focus-ring, padding-y, $type, $value

### Community 160 - "Typography Specifications"
Cohesion: 0.06
Nodes (30): Accessibility, Base System, Best Practices, Clean & Modern, Common Font Pairings, Contrast Requirements, CSS Implementation, Editorial (+22 more)

### Community 162 - "friendsApi.ts"
Cohesion: 0.10
Nodes (31): RelationshipButtonProps, FollowList(), FollowListProps, cn(), FriendList(), FriendListProps, FriendRequestCard(), FriendRequestCardProps (+23 more)

### Community 163 - "none"
Cohesion: 0.67
Nodes (4): $type, $value, none, none

### Community 164 - "StoryHighlights.tsx"
Cohesion: 0.48
Nodes (6): StoryHighlights(), StoryHighlightsProps, useCreateHighlight(), useDeleteHighlight(), useUserHighlights(), StoryHighlight

### Community 165 - "primary"
Cohesion: 0.67
Nodes (3): primary, $type, $value

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
Cohesion: 0.09
Nodes (22): $type, $value, $type, $value, $type, $value, $type, $value (+14 more)

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
Nodes (19): $type, $value, background, destructive, foreground, muted-foreground, primary-hover, secondary (+11 more)

### Community 200 - "test_design_system_mode.py"
Cohesion: 0.16
Nodes (10): _filter_anti_patterns_for_mode(), _query_wants_dark(), True when a styles.csv row describes itself as dark-first., True when the query explicitly asks for a dark theme., Resolve the mode the rest of the output has to agree with., Drop "avoid dark mode" advice once dark mode is the resolved answer., _resolve_color_mode(), _style_is_dark_primary() (+2 more)

### Community 201 - "schemas/__init__.py"
Cohesion: 0.35
Nodes (17): LiveChatMessageCreate, LiveChatMessageListResponse, LiveChatMessageResponse, LiveDonationCreate, LiveDonationListResponse, LiveDonationResponse, LiveGuestCreate, LiveModeratorCreate (+9 more)

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
Cohesion: 0.20
Nodes (7): detect_domain(), Auto-detect the most relevant domain from query. Matches are weighted by…, Main search function with auto-domain detection, search(), Known query -> expected top-domain sanity checks (not exact-row pinning, since…, TestDomainDetection, TestSearchDomains

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
Cohesion: 0.12
Nodes (16): $type, $value, $type, $value, $type, $value, $type, $value (+8 more)

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
Cohesion: 0.19
Nodes (14): $type, $value, $type, $value, $type, $value, primitive, radius (+6 more)

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

### Community 252 - "duration"
Cohesion: 0.20
Nodes (10): fast, normal, slow, $type, $value, $type, $value, duration (+2 more)

### Community 253 - "Slide Strategies"
Cohesion: 0.20
Nodes (9): Common Structures, Duarte Sparkline Pattern, Matching Strategy to Context, Product Demo (6 slides), Sales Pitch (9 slides), Search Commands, Slide Strategies, Strategy Selection (+1 more)

### Community 254 - "test_validate_tokens.py"
Cohesion: 0.38
Nodes (6): Regression tests for validate-tokens.cjs. The validator used to skip any line…, A hardcoded hex on the same line as a var() token is still a violation., A line that references only tokens produces no false positives., _run(), test_flags_hardcoded_hex_sharing_line_with_token(), test_token_only_line_reports_no_violation()

### Community 255 - "PhotoAlbumView.tsx"
Cohesion: 0.21
Nodes (10): PhotoAlbumViewProps, PRIVACY_ICONS, PRIVACY_LABELS, ACCEPT_MAP, TYPE_ICONS, TYPE_LABELS, UploadZone(), UploadZoneProps (+2 more)

### Community 256 - "sync-brand-to-tokens.cjs"
Cohesion: 0.33
Nodes (8): adjustBrightness(), { execFileSync }, extractColorsFromMarkdown(), fs, generateColorScale(), main(), path, updateDesignTokens()

### Community 257 - "StoryArchiveView.tsx"
Cohesion: 0.39
Nodes (7): StoryArchiveView(), StoryArchiveViewProps, StoryViewerProps, useArchivedStories(), useDeleteStory(), useUnarchiveStory(), Story

### Community 258 - "padding-x"
Cohesion: 0.67
Nodes (4): padding-x, padding-x, $type, $value

### Community 259 - "Slides Reference"
Cohesion: 0.29
Nodes (6): Key Features, Knowledge Base, Slides Reference, Usage, When to Use, Workflow

### Community 260 - "HTML Slide Template"
Cohesion: 0.29
Nodes (6): Animation Classes, Background Images, Base Structure, Chart.js Integration, CSS Variables Reference, HTML Slide Template

### Community 261 - "HTML Slide Template"
Cohesion: 0.29
Nodes (6): Animation Classes, Background Images, Base Structure, Chart.js Integration, CSS Variables Reference, HTML Slide Template

### Community 262 - "16"
Cohesion: 0.67
Nodes (3): $type, $value, 16

### Community 263 - "_select_palette_for_mode"
Cohesion: 0.43
Nodes (3): Pick the highest-ranked palette matching the resolved mode. Only the dark case…, _select_palette_for_mode(), TestPaletteSelection

### Community 265 - "Slides"
Cohesion: 0.33
Nodes (5): References (Knowledge Base), Routing, Slides, Subcommands, When to Use

### Community 266 - "1"
Cohesion: 0.67
Nodes (3): $type, $value, 1

### Community 267 - "Brand Guidelines Template"
Cohesion: 0.40
Nodes (4): Brand Guidelines Template, Document Structure, Extractable Fields, Usage

### Community 268 - "radius"
Cohesion: 0.60
Nodes (5): radius, radius, radius, $type, $value

### Community 269 - "3"
Cohesion: 0.67
Nodes (3): $type, $value, 3

### Community 270 - "sm"
Cohesion: 0.60
Nodes (5): sm, sm, sm, $type, $value

### Community 272 - "xl"
Cohesion: 0.67
Nodes (4): xl, xl, $type, $value

### Community 274 - "validate_data.py"
Cohesion: 0.83
Nodes (3): _check_file(), main(), _read_rows()

### Community 285 - "useAuthStore"
Cohesion: 0.06
Nodes (40): App(), ProtectedRoute(), PublicRoute(), SetupUsernameRoute(), AppLayout(), AppLayoutProps, LayoutContext, LayoutContextType (+32 more)

### Community 287 - "8"
Cohesion: 0.67
Nodes (3): $type, $value, 8

### Community 289 - "destructive-foreground"
Cohesion: 0.67
Nodes (3): destructive-foreground, $type, $value

### Community 290 - "muted"
Cohesion: 0.67
Nodes (3): muted, $type, $value

### Community 291 - "primary-foreground"
Cohesion: 0.67
Nodes (3): primary-foreground, $type, $value

### Community 292 - "secondary-foreground"
Cohesion: 0.67
Nodes (3): secondary-foreground, $type, $value

### Community 293 - "ring"
Cohesion: 0.67
Nodes (3): ring, $type, $value

### Community 307 - "lg"
Cohesion: 0.60
Nodes (5): lg, $type, $value, lg, lg

## Knowledge Gaps
- **1258 isolated node(s):** `Config`, `name`, `private`, `version`, `type` (+1253 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **52 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `User` to `MessagingService`, `RelationshipRepository`, `GroupRepository`, `RelationshipService`, `CommentService`, `models/__init__.py`, `FeedRepository`, `PrivacyRepository`, `ProfileRepository`, `MessagingRepository`, `LiveRepository`, `DeviceRepository`, `AnalyticsRepository`, `HashtagService`, `NotificationRepository`, `FriendsRepository`, `NotificationService`, `EventService`, `UserRepository`, `relationship_service.py`, `VideoRepository`, `models.py`, `v1/__init__.py`, `base.py`, `permissions.py`, `PermissionsService`, `AdminService`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `ProfileRepository` connect `ProfileRepository` to `LiveService`, `FeedService`, `User`, `GroupService`, `EventService`, `GroupRepository`, `RelationshipService`, `schemas/__init__.py`, `HashtagService`, `FeedRepository`, `PrivacyRepository`, `SearchService`, `VideoService`, `FriendsService`, `relationship_service.py`, `video_service.py`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `Friendship` connect `models/__init__.py` to `LiveService`, `MessagingService`, `RelationshipRepository`, `models.py`, `MediaRepository`, `RelationshipService`, `schemas/__init__.py`, `v1/media.py`, `CommentService`, `PermissionsService`, `FeedRepository`, `MessagingRepository`, `LiveRepository`, `AnalyticsRepository`, `FriendsService`, `VideoRepository`, `relationship_service.py`, `FriendsRepository`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Are the 26 inferred relationships involving `MediaService` (e.g. with `FeedRepository` and `MediaRepository`) actually correct?**
  _`MediaService` has 26 INFERRED edges - model-reasoned connections that need verification._
- **Are the 25 inferred relationships involving `RelationshipService` (e.g. with `BlockedUser` and `FollowRequest`) actually correct?**
  _`RelationshipService` has 25 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `Session` (e.g. with `Base` and `DeviceRepository`) actually correct?**
  _`Session` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 23 inferred relationships involving `FeedRepository` (e.g. with `BlockedUser` and `CloseFriend`) actually correct?**
  _`FeedRepository` has 23 INFERRED edges - model-reasoned connections that need verification._