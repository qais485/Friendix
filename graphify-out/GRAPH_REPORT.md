# Graph Report - Friendix Social Platform  (2026-08-08)

## Corpus Check
- 496 files · ~209,303 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4569 nodes · 11732 edges · 243 communities (221 shown, 22 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 1405 edges (avg confidence: 0.66)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `72407a23`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Post Feed & Publishing
- Direct Messaging
- Groups & Events
- Mobile Navigation & Badges
- Admin & User Management
- App Configuration
- Chat & Call UI
- Content Rendering & Filters
- Videos & Playlists
- Post Engagement Repositories
- Stories & Reels
- Live Streaming
- Go Live & Live Chat
- Privacy & Close Friends
- WebSocket Messaging
- Media Albums
- Event Planning
- Group Creation UI
- App Layout
- Comments Service
- Skeleton Loaders & Analytics
- Form UI Primitives
- User Action Menu
- Input Dialogs
- Group Membership & Polls
- Composer Pickers
- Image Editor
- Auth & Tokens
- Search Filters & Results
- Video Service & Playlists
- Friend Requests
- Search History
- Profile & Username
- Friendship Relationships
- Event Cards & Chat
- Live Streams & Moderators
- Close Friends & Follows
- Dependencies & Migrations
- Media Panel & Adaptive Image
- Video Playlists & History
- user users settings
- commentform commentitem commentreactions
- user report flag
- list friends request
- toastcontainer confirmationdialog eventattendees
- create init user
- request friend count
- followbutton hashtagcard trendingtags
- hashtags hashtag detail
- notification notifications read
- photoalbumview hooks useactivestories
- base poll db
- highlight media albumphotoadd
- tracking events
- invites event eventchatmessage
- album story stories
- liquidglassactiveindicator liquidglassfilter
- notificationbell notificationdropdown
- privacysettingspage privacyapi
- generator
- profile contentmetricsrefreshresponse
- react autoprefixer eslint
- react axios authority
- stream streams recording
- comment commentreaction init
- tsconfig compileroptions allowimportingtsextensions
- analytics engagement growth
- profile
- hashtag post hashtags
- rankingbreakdown 23 rules
- friendsapi relationshipbuttonprops followlistprops
- interests interestprofile 1461
- mediaapi media albumphoto
- init profilerepository
- videos playlistcreate playlistdetailresponse
- profiles profile
- friends blockdetail blockresponse
- init ranking basemodel
- videoapi videos playlist
- users blockeduser user
- videocategory categories init
- videocard historypage playlistdetailpage
- groupapi groups groupannouncement
- profiles contentprofile 1542
- live livechatmessagecreate livechatmessagelistresponse
- notification init read
- followlist friendlist friendrequestcard
- metricsstate 1584
- features
- playlistspage hooks usecreateplaylist
- watchpage useaddvideotoplaylist userecommendations
- createreel createreelprops privacy
- datetime
- package name private
- categoryfilter videospage categoryfilterprops
- config init metricsconfig
- donation reaction livereactionresponse
- reel reels reelresponse
- engine affinity item
- notfoundpage googleloginform app
- videocomments commentitem timeago
- interest interestbatchprocessresponse interestitem
- ranking type
- guest invite liveguestresponse
- media mediaresponse response
- storyarchiveview storyarchiveviewprops storyviewerprops
- recommendations rules
- setting systemsetting settings
- cloudinary font
- LearningLoopRepository
- hooks.ts
- message livechatmessageresponse messages
- highlight storyhighlightresponse highlights
- reply storyreplyresponse replies
- features language
- storyreactions reactions storyreactionsprops
- app compileroptions composite
- moderator livemoderatorresponse moderators
- mediaupload file media
- storyreactionresponse reaction reactions
- button rationale image
- storyreplyinput storyreplyinputprops useaddstoryreply
- env offline online
- StoryHighlight
- d importmeta importmetaenv
- clsx
- dompurify
- feed_repository.py
- react
- UploadZone.tsx
- label
- slot
- dom
- merge
- animate
- color
- highlight
- StoryReaction
- link
- underline
- StoryReplyInput.tsx
- zustand
- @tiptap/extension-font-family
- @tiptap/extension-image
- @tiptap/extension-strike
- @tiptap/extension-text-align
- @tiptap/pm
- @tiptap/extension-horizontal-rule
- @tiptap/extension-placeholder
- @tiptap/starter-kit
- @types/dompurify
- class-variance-authority
- StoryHighlights.tsx
- StoryReactions.tsx
- MusicStoryCreator.tsx

## God Nodes (most connected - your core abstractions)
1. `Session` - 155 edges
2. `MediaService` - 129 edges
3. `cn()` - 107 edges
4. `RelationshipService` - 104 edges
5. `FeedService` - 94 edges
6. `Base` - 92 edges
7. `TimestampMixin` - 91 edges
8. `FeedRepository` - 90 edges
9. `LiveService` - 89 edges
10. `Button` - 87 edges

## Surprising Connections (you probably didn't know these)
- `clear_cache()` --calls--> `get_application_cache()`  [INFERRED]
  backend/tests/conftest.py → backend/app/core/cache.py
- `test_backfill_is_idempotent()` --calls--> `ContentProfileService`  [INFERRED]
  backend/tests/test_content_profiles.py → backend/app/services/content_profile_service.py
- `test_feed_order_is_stable()` --calls--> `FeedGenerator`  [INFERRED]
  backend/tests/test_ranking.py → backend/app/services/feed_generator.py
- `refresh_metrics()` --calls--> `ContentMetricsService`  [INFERRED]
  backend/app/api/v1/content_profiles.py → backend/app/services/content_metrics_service.py
- `track_events()` --calls--> `EventTrackingService`  [INFERRED]
  backend/app/api/v1/event_tracking.py → backend/app/services/event_tracking_service.py

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **FastAPI Runtime Stack** — backend_requirements_fastapi, backend_requirements_starlette, backend_requirements_pydantic, backend_requirements_uvicorn, backend_requirements_anyio [INFERRED 0.85]
- **SPA Bootstrap Flow** — frontend_index, frontend_index_root, frontend_index_main_tsx [INFERRED 0.85]

## Communities (243 total, 22 thin omitted)

### Community 0 - "Post Feed & Publishing"
Cohesion: 0.05
Nodes (61): archive_post(), create_post(), delete_post(), get_archived_posts(), get_draft_posts(), get_feed_position(), get_feed_service(), get_following_feed() (+53 more)

### Community 1 - "Direct Messaging"
Cohesion: 0.05
Nodes (63): add_members(), add_reaction(), create_conversation(), delete_conversation(), delete_message(), forward_message(), get_archived_conversations(), get_conversation() (+55 more)

### Community 2 - "Groups & Events"
Cohesion: 0.06
Nodes (51): attend_event(), create_announcement(), create_event(), create_group(), create_poll(), delete_announcement(), delete_group(), delete_message() (+43 more)

### Community 3 - "Mobile Navigation & Badges"
Cohesion: 0.06
Nodes (53): Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input, InputProps (+45 more)

### Community 4 - "Admin & User Management"
Cohesion: 0.07
Nodes (51): AdminUserListResponse, AuditLogListResponse, ban_user(), create_feature_flag(), create_system_setting(), delete_feature_flag(), delete_system_setting(), get_admin_service() (+43 more)

### Community 5 - "App Configuration"
Cohesion: 0.07
Nodes (51): get_rules_config(), BaseSettings, Configurable recommendation rules (Phase 4.5).  A business rules layer that runs, RulesConfig, Candidate, is_fresh(), datetime, UUID (+43 more)

### Community 6 - "Chat & Call UI"
Cohesion: 0.17
Nodes (20): ContentPerformanceItem, CreatorDetailResponse, CreatorPerformanceItem, CreatorPerformanceResponse, EngagementSeriesPoint, EngagementSeriesResponse, BaseModel, RateMetrics (+12 more)

### Community 7 - "Content Rendering & Filters"
Cohesion: 0.09
Nodes (29): LiquidGlassFilter(), ParsedContent(), ParsedContentProps, LazyVideo(), LazyVideoProps, barAppearanceClasses(), barForeground(), DARK_BAR_FG (+21 more)

### Community 8 - "Videos & Playlists"
Cohesion: 0.10
Nodes (14): Playlist, PlaylistVideo, Video, VideoComment, WatchHistory, WatchLater, UUID, Batch variant of :meth:`is_liked` (single query, no N+1). (+6 more)

### Community 9 - "Post Engagement Repositories"
Cohesion: 0.12
Nodes (9): Post, PostHide, PostLike, PostSave, FeedRepository, Post, UUID, Fetch many posts in one query, pre-loading shared posts (no N+1). (+1 more)

### Community 10 - "Stories & Reels"
Cohesion: 0.10
Nodes (23): AppLayout(), AppLayoutProps, LayoutContext, LayoutContextType, useLayout(), FloatingActions(), BOTTOM_NAV_ITEMS, MobileBottomNav() (+15 more)

### Community 11 - "Live Streaming"
Cohesion: 0.11
Nodes (14): LiveChatMessage, LiveGuest, LiveModerator, LiveStream, LiveViewer, LiveRepository, LiveStream, UUID (+6 more)

### Community 12 - "Go Live & Live Chat"
Cohesion: 0.06
Nodes (46): GoLiveButton(), LiveChat(), LiveChatProps, LiveDonations(), LiveDonationsProps, EMOJI_OPTIONS, LiveReactions(), LiveReactionsProps (+38 more)

### Community 13 - "Privacy & Close Friends"
Cohesion: 0.07
Nodes (12): FollowRequest, Mute, Restrict, BlockedUser, CloseFriend, Friendship, Mute, User (+4 more)

### Community 14 - "WebSocket Messaging"
Cohesion: 0.09
Nodes (18): ConnectionManager, messaging_websocket(), WebSocket, _serialize_message(), Conversation, ConversationMember, Message, MessageReaction (+10 more)

### Community 15 - "Media Albums"
Cohesion: 0.08
Nodes (61): add_photo_to_album(), add_reaction(), add_reply(), add_story_to_highlight(), archive_story(), create_album(), create_highlight(), create_reel() (+53 more)

### Community 16 - "Event Planning"
Cohesion: 0.08
Nodes (35): cancel_event(), create_event(), delete_chat_message(), delete_event(), get_attendees(), get_chat_messages(), get_event(), get_event_invites() (+27 more)

### Community 17 - "Group Creation UI"
Cohesion: 0.06
Nodes (61): CreateGroupModal(), CreateGroupModalProps, PRIVACY_OPTIONS, GroupAnnouncements(), GroupAnnouncementsProps, GroupCard(), GroupCardProps, PRIVACY_ICONS (+53 more)

### Community 18 - "App Layout"
Cohesion: 0.11
Nodes (30): RightSidebar(), ToastContainer(), EventAttendeeItem(), EventAttendees(), EventAttendeesProps, useEventAttendees(), useBlockUser(), useFollow() (+22 more)

### Community 19 - "Comments Service"
Cohesion: 0.09
Nodes (36): create_comment(), delete_comment(), get_comment_replies(), get_comment_service(), get_post_comments(), hide_comment(), pin_comment(), CommentCreate (+28 more)

### Community 20 - "Skeleton Loaders & Analytics"
Cohesion: 0.06
Nodes (32): AnalyticsCardSkeleton(), PostSkeleton(), Skeleton(), AnalyticsPage(), periodOptions, ProfileViewsTab(), Tab, tabs (+24 more)

### Community 21 - "Form UI Primitives"
Cohesion: 0.08
Nodes (35): Badge(), BadgeProps, badgeVariants, Textarea, TextareaProps, SetupUsernamePage(), UsernameStatus, EditProfileModal() (+27 more)

### Community 22 - "User Action Menu"
Cohesion: 0.12
Nodes (40): RelationshipButton(), UserActionMenu(), UserActionMenuProps, FollowList(), cn(), FriendList(), FriendRequestCard(), FriendSuggestions() (+32 more)

### Community 23 - "Input Dialogs"
Cohesion: 0.11
Nodes (53): InputDialog(), InputDialogProps, errorMessage(), HomePage(), updatePostInInfiniteCache(), useArchivedPosts(), useArchivePost(), useCreatePost() (+45 more)

### Community 24 - "Group Membership & Polls"
Cohesion: 0.10
Nodes (15): Group, GroupEvent, GroupEventAttendee, GroupMember, GroupPoll, GroupRepository, UUID, slugify() (+7 more)

### Community 25 - "Composer Pickers"
Cohesion: 0.06
Nodes (37): EmptyState(), EmptyStateProps, ErrorBanner(), ErrorBannerProps, ErrorState(), ErrorStateProps, Separator, SeparatorProps (+29 more)

### Community 26 - "Image Editor"
Cohesion: 0.07
Nodes (50): AdaptiveImage(), AdaptiveImageProps, ImagePreset, OptimizedImage, OptimizedImageProps, PRESET_DEFAULTS, getPostBackgroundStyle(), MediaPanel() (+42 more)

### Community 27 - "Auth & Tokens"
Cohesion: 0.09
Nodes (32): delete_account(), get_auth_service(), get_current_user(), get_devices(), get_login_history(), google_login(), logout(), logout_all() (+24 more)

### Community 28 - "Search Filters & Results"
Cohesion: 0.11
Nodes (33): AdvancedFilters(), AdvancedFiltersProps, POST_TYPES, CommentSearchResults(), CommentSearchResultsProps, LiveSearchResults(), LiveSearchResultsProps, PostSearchResults() (+25 more)

### Community 29 - "Video Service & Playlists"
Cohesion: 0.08
Nodes (13): PlaylistResponse, VideoResponse, WatchLaterResponse, PlaylistCreate, PlaylistUpdate, UUID, VideoCreate, VideoUpdate (+5 more)

### Community 30 - "Friend Requests"
Cohesion: 0.13
Nodes (43): accept_follow_request(), accept_friend_request(), add_close_friend(), block_user(), cancel_follow_request(), cancel_friend_request(), follow_user(), get_blocked_users() (+35 more)

### Community 31 - "Search History"
Cohesion: 0.06
Nodes (39): clear_search_history(), delete_saved_search(), get_saved_searches(), get_search_history(), get_search_service(), UUID, save_search(), search() (+31 more)

### Community 32 - "Profile & Username"
Cohesion: 0.10
Nodes (31): check_username(), get_explore_profiles(), get_my_profile(), get_profile_service(), get_public_profile(), AvatarUpdate, CoverPhotoUpdate, ProfileUpdate (+23 more)

### Community 33 - "Friendship Relationships"
Cohesion: 0.06
Nodes (9): FriendshipResponse, CloseFriendDetail, FriendDetail, UUID, BlockDetail, FollowRequestDetail, MuteDetail, RelationshipSummary (+1 more)

### Community 34 - "Event Cards & Chat"
Cohesion: 0.10
Nodes (32): EventCard(), EventCardProps, EventChat(), EventChatProps, CreateEventPage(), EventDetailPage(), Tab, EventListPage() (+24 more)

### Community 35 - "Live Streams & Moderators"
Cohesion: 0.05
Nodes (71): accept_guest_invite(), add_moderator(), create_stream(), delete_stream(), end_stream(), get_active_streams(), get_chat_messages(), get_donations() (+63 more)

### Community 36 - "Close Friends & Follows"
Cohesion: 0.13
Nodes (8): CloseFriend, Follow, Friendship, FriendsRepository, CloseFriend, Friendship, User, UUID

### Community 37 - "Dependencies & Migrations"
Cohesion: 0.08
Nodes (40): backend/requirements.txt, alembic, annotated-types, anyio, certifi, cffi, click, colorama (+32 more)

### Community 38 - "Media Panel & Adaptive Image"
Cohesion: 0.16
Nodes (24): clamp(), Geometry, LiquidGlassActiveIndicator(), LiquidGlassActiveIndicatorProps, SPRING, getValueOrMotion(), LiquidGlassFilter(), LiquidGlassFilterProps (+16 more)

### Community 39 - "Video Playlists & History"
Cohesion: 0.15
Nodes (36): get_video_service(), add_video_to_playlist(), clear_watch_history(), create_comment(), create_playlist(), create_video(), delete_comment(), delete_playlist() (+28 more)

### Community 40 - "user users settings"
Cohesion: 0.13
Nodes (24): block_user(), get_blocked_users(), get_muted_users(), get_privacy_service(), get_privacy_settings(), get_restricted_users(), mute_user(), PrivacySettingUpdate (+16 more)

### Community 41 - "commentform commentitem commentreactions"
Cohesion: 0.11
Nodes (31): ConfirmationDialog(), ConfirmationDialogProps, CommentForm(), CommentFormProps, CommentItem(), CommentItemProps, CommentReplies(), CommentReactions() (+23 more)

### Community 42 - "user report flag"
Cohesion: 0.09
Nodes (14): AuditLog, get_public_settings(), Public appearance settings consumed by the client app (category "appearance")., FeatureFlag, SystemSetting, AdminRepository, datetime, User (+6 more)

### Community 43 - "list friends request"
Cohesion: 0.20
Nodes (4): PermissionsService, Mute, PrivacySetting, UUID

### Community 44 - "toastcontainer confirmationdialog eventattendees"
Cohesion: 0.22
Nodes (7): Hashtag, HashtagFollow, PostHashtag, HashtagRepository, Post, UUID, Hashtag

### Community 45 - "create init user"
Cohesion: 0.11
Nodes (10): Device, DeviceRepository, LoginHistoryRepository, User, UUID, SessionRepository, UserRepository, Device (+2 more)

### Community 46 - "request friend count"
Cohesion: 0.12
Nodes (6): FollowUserDetail, FriendsService, CloseFriendDetail, FollowResponse, FriendDetail, UUID

### Community 47 - "followbutton hashtagcard trendingtags"
Cohesion: 0.09
Nodes (32): FollowButton(), FollowButtonProps, HashtagCard(), HashtagCardProps, HashtagPostCard(), HashtagPostCardProps, TrendingTags(), HashtagDetailPage() (+24 more)

### Community 48 - "hashtags hashtag detail"
Cohesion: 0.13
Nodes (21): create_hashtag(), follow_hashtag(), get_followed_hashtags(), get_hashtag_detail(), get_hashtag_posts(), get_hashtag_service(), get_trending_hashtags(), search_hashtags() (+13 more)

### Community 49 - "notification notifications read"
Cohesion: 0.11
Nodes (19): delete_notification(), get_notification_service(), get_notifications(), get_unread_count(), mark_as_read(), UUID, NotificationActor, NotificationCountResponse (+11 more)

### Community 50 - "photoalbumview hooks useactivestories"
Cohesion: 0.12
Nodes (18): useAddPhotoToAlbum(), useAlbum(), useCloudinarySignature(), useCreateAlbum(), useDeleteMedia(), useDeleteReel(), useFeedReels(), useRemovePhotoFromAlbum() (+10 more)

### Community 51 - "base poll db"
Cohesion: 0.13
Nodes (31): Base, AlbumPhoto, AuditLog, BannedUser, CommentReport, GroupAnnouncement, GroupJoinRequest, GroupMessage (+23 more)

### Community 52 - "highlight media albumphotoadd"
Cohesion: 0.13
Nodes (23): AlbumPhotoAdd, AlbumPhotoResponse, CloudinarySignRequest, CloudinarySignResponse, MediaUpdate, MediaUpload, MediaUserResponse, PhotoAlbumCreate (+15 more)

### Community 53 - "tracking events"
Cohesion: 0.22
Nodes (8): EventTrackingService, datetime, UUID, Drop excess view_start events within one session (spam guard)., Drop events for non-existent content; correct spoofed creator ids., Collapse view-related events in the batch into one upsert per session., Service that ingests batches of content engagement events.      Collection is, Persist a batch of events.          Returns ``{"received", "duplicates", "inva

### Community 54 - "invites event eventchatmessage"
Cohesion: 0.11
Nodes (12): Any, CacheConfig, get_cache_config(), BaseSettings, Caching knobs for the recommendation / feed read path.  All values are overridab, get_application_cache(), Tiny caching layer for hot read paths.  A Redis-backed cache is used when the ``, Return the process-wide cache, building it once per configuration. (+4 more)

### Community 55 - "album story stories"
Cohesion: 0.09
Nodes (8): StoryReactionResponse, StoryReplyResponse, StoryResponse, StoryViewResponse, StoryCreate, StoryReactionCreate, StoryReplyCreate, UUID

### Community 56 - "liquidglassactiveindicator liquidglassfilter"
Cohesion: 0.18
Nodes (18): NotificationBell(), NotificationDropdown(), NotificationDropdownProps, getNotificationRoute(), getNotificationText(), NOTIFICATION_COLORS, NOTIFICATION_ICONS, NotificationItem() (+10 more)

### Community 57 - "notificationbell notificationdropdown"
Cohesion: 0.18
Nodes (3): AnalyticsRepository, datetime, UUID

### Community 58 - "privacysettingspage privacyapi"
Cohesion: 0.18
Nodes (23): BlockMuteListProps, useBlockedUsers(), useBlockUser(), useMutedUsers(), useMuteUser(), usePrivacySettings(), useRestrictedUsers(), useRestrictUser() (+15 more)

### Community 59 - "generator"
Cohesion: 0.40
Nodes (4): FeedConfig, get_feed_config(), BaseSettings, Configurable Feed Generator (Phase 5).  The feed generator composes the already-

### Community 60 - "profile contentmetricsrefreshresponse"
Cohesion: 0.13
Nodes (18): ContentMetricsRefreshResponse, ContentProfileBackfillResponse, ContentProfileListResponse, ContentProfileResponse, ContentProfileUpdate, BaseModel, compute_freshness(), compute_quality() (+10 more)

### Community 61 - "react autoprefixer eslint"
Cohesion: 0.08
Nodes (25): autoprefixer, eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, autoprefixer, eslint, eslint-plugin-react-hooks (+17 more)

### Community 62 - "react axios authority"
Cohesion: 0.08
Nodes (25): axios, dependencies, axios, react, react-dom, tailwind-merge, @tanstack/react-query, @tiptap/extension-font-family (+17 more)

### Community 63 - "stream streams recording"
Cohesion: 0.18
Nodes (20): backfill_profiles(), _check_type(), get_content_profile_service(), get_profile(), list_profiles(), UUID, Admin-only: rebuild profiles for the newest content of every type., Admin-only: full backfill of content profiles for all types (or one). (+12 more)

### Community 64 - "comment commentreaction init"
Cohesion: 0.22
Nodes (7): Comment, CommentReaction, CommentRepository, Comment, UUID, CommentReaction, CommentReport

### Community 65 - "tsconfig compileroptions allowimportingtsextensions"
Cohesion: 0.08
Nodes (23): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleDetection (+15 more)

### Community 66 - "analytics engagement growth"
Cohesion: 0.09
Nodes (24): get_engagement(), get_event_analytics(), get_followers_growth(), get_overview(), get_post_analytics(), get_profile_views(), get_reel_analytics(), get_story_analytics() (+16 more)

### Community 67 - "profile"
Cohesion: 0.14
Nodes (23): RelationshipButtonProps, FollowListProps, FriendListProps, friendsApi, Block, BlockDetail, CloseFriend, CloseFriendDetail (+15 more)

### Community 68 - "hashtag post hashtags"
Cohesion: 0.23
Nodes (20): _check_type(), creator_detail(), creators(), engagement_series(), get_service(), overview(), UUID, Total watch time plus a daily watch-time series. (+12 more)

### Community 69 - "rankingbreakdown 23 rules"
Cohesion: 0.13
Nodes (22): get_active_rules(), get_recommendation_service(), get_recommendations(), UUID, Rank candidates then apply the recommendation rules.      The result is the rule, Return the active rules and their parameter sets (ops transparency)., BaseModel, One decision made by a rule for a single candidate. (+14 more)

### Community 70 - "friendsapi relationshipbuttonprops followlistprops"
Cohesion: 0.18
Nodes (10): Event, EventChatMessage, EventInvite, EventRSVP, EventRepository, UUID, Event, EventChatMessage (+2 more)

### Community 71 - "interests interestprofile 1461"
Cohesion: 0.16
Nodes (11): InterestProfile, Per-user aggregate holding the incremental-processing watermark.      ``last_o, One row per (user, interest dimension) with a decaying strength score., UserInterest, InterestRepository, UUID, Insert derived signals, skipping any (event, dimension) already seen., Apply decaying strength updates to user interests. Returns count. (+3 more)

### Community 72 - "mediaapi media albumphoto"
Cohesion: 0.11
Nodes (18): App(), ProtectedRoute(), PublicRoute(), SetupUsernameRoute(), NotFoundPage(), GoogleLoginForm(), Window, InviteModal() (+10 more)

### Community 73 - "init profilerepository"
Cohesion: 0.16
Nodes (4): User, ProfileRepository, User, UUID

### Community 74 - "videos playlistcreate playlistdetailresponse"
Cohesion: 0.12
Nodes (12): compositeHtml, compositeHtmlPath, DEFAULT_BREAKPOINTS, DEV_BROWSER_TMP, { execSync }, fs, path, screenshots (+4 more)

### Community 75 - "profiles profile"
Cohesion: 0.14
Nodes (21): mediaApi, AlbumPhoto, CloudinarySignature, MediaStats, MediaTab, MediaUpdate, MediaUpload, PhotoAlbumCreate (+13 more)

### Community 76 - "friends blockdetail blockresponse"
Cohesion: 0.19
Nodes (19): BlockDetail, BlockResponse, CloseFriendDetail, CloseFriendResponse, FavoriteUpdate, FollowRequestDetail, FollowRequestResponse, FollowResponse (+11 more)

### Community 77 - "init ranking basemodel"
Cohesion: 0.13
Nodes (22): _check_type(), explain_ranking(), get_ranking_service(), preview_ranking(), UUID, Score a pool of content profiles and return them sorted by rank.      Personaliz, Return the rank score and per-signal breakdown for a single item., profile_features() (+14 more)

### Community 78 - "videoapi videos playlist"
Cohesion: 0.15
Nodes (21): VideoPlayerProps, Playlist, PlaylistCreate, PlaylistDetail, PlaylistListResponse, PlaylistUpdate, RecommendationListResponse, Video (+13 more)

### Community 79 - "users blockeduser user"
Cohesion: 0.27
Nodes (5): BlockedUser, PrivacyRepository, BlockedUser, PrivacySetting, UUID

### Community 80 - "videocategory categories init"
Cohesion: 0.18
Nodes (11): get_learning_service(), get_loop_status(), UUID, Report the learning loop's progress telemetry (read-only)., Admin-only: execute one learning cycle on demand.      Runs the interest update,, _require_admin(), run_loop_cycle(), LearningLoopService (+3 more)

### Community 81 - "videocard historypage playlistdetailpage"
Cohesion: 0.07
Nodes (31): get_interest_service(), get_my_profile(), get_profile_by_type(), process_all_users(), UUID, Return the authenticated user's interest profile., Return only one interest dimension (category / tag / creator / topic)., Consume the user's pending raw events into their interest profile. (+23 more)

### Community 82 - "groupapi groups groupannouncement"
Cohesion: 0.06
Nodes (72): FriendRequestCardProps, FriendSuggestionsProps, useFriends(), CallModal(), CallModalProps, CallState, ChatHeader(), ChatHeaderProps (+64 more)

### Community 83 - "profiles contentprofile 1542"
Cohesion: 0.16
Nodes (6): ContentProfile, Machine-readable profile for any content item.      One row per (content_type,, ContentProfileRepository, UUID, Delete profiles whose source content row no longer exists., Persistence + source extraction for content profiles.

### Community 84 - "live livechatmessagecreate livechatmessagelistresponse"
Cohesion: 0.15
Nodes (17): _count(), UUID, System status + diagnostics endpoints (admin-gated).  Exposes the learning-loop, Learning-loop worker health + pipeline config summary., Runtime + data-plane diagnostics (version, DB latency, table sizes)., _require_admin(), system_diagnostics(), system_status() (+9 more)

### Community 85 - "notification init read"
Cohesion: 0.30
Nodes (4): Notification, NotificationRepository, UUID, Notification

### Community 86 - "followlist friendlist friendrequestcard"
Cohesion: 0.14
Nodes (18): CreateReel(), CreateReelProps, Privacy, PRIVACY_OPTIONS, ReelPlayerProps, StoryReplyInput(), StoryReplyInputProps, ACCEPT_MAP (+10 more)

### Community 87 - "metricsstate 1584"
Cohesion: 0.11
Nodes (10): get_metrics_config(), MetricsConfig, BaseSettings, Configurable formulas for content profile metrics.  All weights and timescales, ContentMetricsRepository, UUID, Write-optimized persistence for the incremental content metrics pass., Bulk refresh freshness_score for every profile (single UPDATE). (+2 more)

### Community 88 - "features"
Cohesion: 0.20
Nodes (10): cache_key(), content_set_key(), Build a namespaced cache key from parts (e.g. ``cache_key("engagement", "..ids.., Canonical cache key for a set of content ids (order-independent)., UUID, RankingRepository, Return (interest_type, interest_key, strength) for a user's interests., Read surfaces for the ranking engine.      Candidates come from ``content_prof (+2 more)

### Community 89 - "playlistspage hooks usecreateplaylist"
Cohesion: 0.12
Nodes (21): PlaylistCreate, PlaylistDetailResponse, PlaylistListResponse, PlaylistUpdate, BaseModel, RecommendationListResponse, VideoCategoryBrief, VideoCategoryResponse (+13 more)

### Community 90 - "watchpage useaddvideotoplaylist userecommendations"
Cohesion: 0.16
Nodes (9): CategoryFilter(), CategoryFilterProps, useSearchVideos(), useTrendingVideos(), useVideoCategories(), useVideoList(), Tab, VideosPage() (+1 more)

### Community 91 - "createreel createreelprops privacy"
Cohesion: 0.20
Nodes (13): flush(), flushNow(), flushOnHide(), isAuthenticated(), queue, QueuedEvent, scheduleFlush(), startViewSession() (+5 more)

### Community 92 - "datetime"
Cohesion: 0.33
Nodes (5): datetime, UUID, Context queries for the rules engine (follows, history, reports, features)., Load content profiles for a list of (content_type, content_id) keys., RulesRepository

### Community 93 - "package name private"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, dev, lint, preview, typecheck (+2 more)

### Community 94 - "categoryfilter videospage categoryfilterprops"
Cohesion: 0.41
Nodes (14): post_factory(), _item(), Event-tracking security / validation tests (Task 5)., _svc(), test_absurd_watch_time_is_invalid(), test_bad_percentage_is_invalid(), test_duplicate_client_event_id_deduped(), test_future_timestamp_is_invalid() (+6 more)

### Community 95 - "config init metricsconfig"
Cohesion: 0.16
Nodes (9): encode_cursor(), encode_trending_cursor(), parse_cursor(), parse_trending_cursor(), datetime, Opaque keyset cursor for feeds ordered by (is_pinned, created_at, id) DESC., Opaque keyset cursor for feeds ordered by (trending_score, created_at, id) DESC., Decode a feed keyset cursor into (is_pinned, created_at, post_id).      Falls (+1 more)

### Community 96 - "donation reaction livereactionresponse"
Cohesion: 0.25
Nodes (11): formatDuration(), formatViews(), timeAgo(), VideoCard(), VideoCardProps, formatProgress(), HistoryPage(), useClearWatchHistory() (+3 more)

### Community 97 - "reel reels reelresponse"
Cohesion: 0.14
Nodes (9): ReelResponse, drop_content_profile(), UUID, Automatic content-profile synchronization.  Hooks content create/update/delete o, Build or refresh the profile for a content item after create/update., Delete the profile row when its content item is removed., sync_content_profile(), ReelCreate (+1 more)

### Community 98 - "engine affinity item"
Cohesion: 0.15
Nodes (13): get_ranking_config(), BaseSettings, RankingConfig, Configurable formulas for the ranking engine (Phase 4).  Every signal the rank, interest_affinity(), RankingEngine, _rate(), Modular ranking engine (Phase 4).  Each signal is an independent 0..1 scoring (+5 more)

### Community 99 - "notfoundpage googleloginform app"
Cohesion: 0.14
Nodes (12): get_learning_config(), LearningConfig, BaseSettings, Configurable Learning Loop (Phase 6).  The learning loop continuously closes the, health_check(), health_ready(), WebSocket, Liveness probe: the process is up and serving. (+4 more)

### Community 100 - "videocomments commentitem timeago"
Cohesion: 0.18
Nodes (8): get_rate_limiter(), In-process sliding-window rate limiter.  Thread-safe and lock-free for reads apa, Tracks timestamps per key; a call is allowed if the window is under limit., SlidingWindowRateLimiter, get_tracking_config(), BaseSettings, Security knobs for the event tracking ingest path.  All values are overridable t, TrackingConfig

### Community 101 - "interest interestbatchprocessresponse interestitem"
Cohesion: 0.36
Nodes (9): DecayPassOut, DecayTelemetry, InterestPassOut, InterestTelemetry, LearningCycleResult, LearningStatusResponse, MetricsPassOut, MetricsTelemetry (+1 more)

### Community 102 - "ranking type"
Cohesion: 0.17
Nodes (10): Switch, SwitchProps, BlockMuteList(), TYPE_CONFIG, PrivacySection(), PrivacySectionProps, PrivacyToggle(), PrivacyToggleProps (+2 more)

### Community 103 - "guest invite liveguestresponse"
Cohesion: 0.15
Nodes (7): { execFile, spawn }, fs, os, path, PREVIEW_HTML, SERVE_SCRIPT, { target, breakpoints }

### Community 104 - "media mediaresponse response"
Cohesion: 0.09
Nodes (24): get_feed_generator(), get_feed_service(), get_recommended_feed(), get_recommended_posts(), get_recommended_videos(), UUID, Ranked video page from the Ranking -> Rules pipeline, hydrated to full videos., Return a page of the personalized feed for the authenticated user.      Candid (+16 more)

### Community 105 - "storyarchiveview storyarchiveviewprops storyviewerprops"
Cohesion: 0.12
Nodes (13): ContentEvent, Append-only raw event log for content engagement tracking.      Every user act, Denormalized aggregate of a single viewing session.      Upserted while ingest, ViewSession, EventTrackingRepository, UUID, Write-optimized persistence for the content event tracking pipeline.      The, Return the subset of client ids already persisted (for dedup). (+5 more)

### Community 106 - "recommendations rules"
Cohesion: 0.19
Nodes (14): MediaCardProps, MediaGrid(), MediaGridProps, MediaViewerProps, PhotoAlbumView(), PhotoAlbumViewProps, PRIVACY_ICONS, PRIVACY_LABELS (+6 more)

### Community 107 - "setting systemsetting settings"
Cohesion: 0.06
Nodes (19): AlbumPhoto, PhotoAlbum, Reel, Story, StoryHighlightItem, StoryReaction, StoryView, MediaRepository (+11 more)

### Community 108 - "cloudinary font"
Cohesion: 0.33
Nodes (7): frontend/index.html, Cloudinary Service, Inter Google Font, src/main.tsx Entry Script, root Mount Element, Friendix Title, vite.svg Favicon

### Community 109 - "LearningLoopRepository"
Cohesion: 0.22
Nodes (5): LearningLoopState, Single-row control + telemetry for the Phase 6 Learning Loop.      Tracks when, LearningLoopRepository, Persistence for the Phase 6 learning loop.      Owns the single-row ``learning_l, Decay stale interests in bulk, then prune noise.          Returns ``(rows_decaye

### Community 110 - "hooks.ts"
Cohesion: 0.21
Nodes (5): AbstractContextManager, LearningLoopWorker, A stoppable background thread that repeatedly runs learning cycles., Run a single cycle against a fresh session., Snapshot for the ops dashboard (worker thread + last cycle telemetry).

### Community 111 - "message livechatmessageresponse messages"
Cohesion: 0.27
Nodes (10): useAddVideoToPlaylist(), useRecommendations(), useRecordWatch(), useToggleVideoLike(), useToggleWatchLater(), useVideoDetail(), formatDate(), formatDurationShort() (+2 more)

### Community 112 - "highlight storyhighlightresponse highlights"
Cohesion: 0.29
Nodes (3): StoryHighlightResponse, StoryHighlightCreate, StoryHighlightUpdate

### Community 113 - "reply storyreplyresponse replies"
Cohesion: 0.21
Nodes (9): Request, UUID, Receive up to 200 engagement events in one call.      Events are validated (ra, track_events(), EventTrackItem, EventTrackRequest, EventTrackResponse, BaseModel (+1 more)

### Community 114 - "features language"
Cohesion: 0.33
Nodes (5): detect_language(), Lightweight text feature helpers shared by content and interest profiling.  Thes, Split free text into normalized topic tokens (lowercased, deduped)., Heuristic language detection based on dominant Unicode script.      Returns a lo, topic_tokens()

### Community 115 - "storyreactions reactions storyreactionsprops"
Cohesion: 0.39
Nodes (3): MediaResponse, MediaUpdate, MediaUpload

### Community 116 - "app compileroptions composite"
Cohesion: 0.33
Nodes (5): compilerOptions, composite, tsBuildInfoFile, include, src

### Community 117 - "moderator livemoderatorresponse moderators"
Cohesion: 0.39
Nodes (8): CommentItem(), timeAgo(), VideoComments(), VideoCommentsProps, useCreateVideoComment(), useDeleteVideoComment(), useVideoCommentReplies(), useVideoComments()

### Community 118 - "mediaupload file media"
Cohesion: 0.67
Nodes (4): MediaUpload, upload_file(), upload_media(), UploadFile

### Community 119 - "storyreactionresponse reaction reactions"
Cohesion: 0.39
Nodes (3): PhotoAlbumResponse, PhotoAlbumCreate, PhotoAlbumUpdate

### Community 120 - "button rationale image"
Cohesion: 0.67
Nodes (4): Carousel Navigation Design Intent, Slider Buttons Asset, Next Slider Button, Previous Slider Button

### Community 121 - "storyreplyinput storyreplyinputprops useaddstoryreply"
Cohesion: 0.25
Nodes (4): clear_cache(), Shared fixtures for the backend test suite.  The suite runs against the configur, Warm the (potentially cold-starting) database connection once per run., warm_db()

### Community 122 - "env offline online"
Cohesion: 0.22
Nodes (6): configure_logging(), _json_enabled(), _JsonFormatter, Structured logging setup.  Call ``configure_logging()`` once at process start (a, Install a single structured handler on the root logger., LogRecord

### Community 195 - "StoryHighlight"
Cohesion: 0.43
Nodes (7): Analytics tests (Task 7): CTR, engagement series, creator event analytics., _seed_events(), test_content_and_creator_items_carry_ctr(), test_creator_detail_uses_filter(), test_creator_self_scoped_event_analytics(), test_engagement_series_has_event_day(), test_summary_includes_ctr()

### Community 199 - "feed_repository.py"
Cohesion: 0.43
Nodes (6): _profile(), Content-profile lifecycle tests (Task 1)., test_backfill_is_idempotent(), test_create_post_builds_profile(), test_delete_post_removes_profile(), test_update_post_bumps_profile_version()

### Community 201 - "UploadZone.tsx"
Cohesion: 0.50
Nodes (4): _add_interest(), Ranking + engagement-cache tests (Tasks 4 & 6)., test_feed_order_is_stable(), test_matching_interest_outranks_nonmatching()

### Community 205 - "merge"
Cohesion: 0.70
Nodes (4): useCreatePlaylist(), useDeletePlaylist(), useUserPlaylists(), PlaylistsPage()

### Community 209 - "StoryReaction"
Cohesion: 0.25
Nodes (6): fs, http, MIME_TYPES, path, reloadClients, rootDir

### Community 214 - "StoryReplyInput.tsx"
Cohesion: 0.39
Nodes (7): StoryArchiveView(), StoryArchiveViewProps, StoryViewerProps, useArchivedStories(), useDeleteStory(), useUnarchiveStory(), Story

### Community 232 - "@tiptap/extension-image"
Cohesion: 0.09
Nodes (31): CreatePostButton(), CreatePostButtonProps, ComposerType, CreatePostForm(), CreatePostFormProps, DURATION_MS, EmptyFeed(), EmptyFeedProps (+23 more)

### Community 246 - "StoryHighlights.tsx"
Cohesion: 0.48
Nodes (6): StoryHighlights(), StoryHighlightsProps, useCreateHighlight(), useDeleteHighlight(), useUserHighlights(), StoryHighlight

### Community 247 - "StoryReactions.tsx"
Cohesion: 0.47
Nodes (5): QUICK_REACTIONS, StoryReactions(), StoryReactionsProps, useAddStoryReaction(), useRemoveStoryReaction()

### Community 249 - "MusicStoryCreator.tsx"
Cohesion: 0.50
Nodes (4): MusicStoryCreator(), MusicStoryCreatorProps, SAMPLE_TRACKS, useCreateStory()

## Knowledge Gaps
- **314 isolated node(s):** `{ execFile, spawn }`, `path`, `fs`, `os`, `PREVIEW_HTML` (+309 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Session` connect `Video Playlists & History` to `Post Feed & Publishing`, `Direct Messaging`, `Groups & Events`, `Admin & User Management`, `App Configuration`, `Videos & Playlists`, `Live Streaming`, `Privacy & Close Friends`, `WebSocket Messaging`, `Media Albums`, `Event Planning`, `Comments Service`, `Group Membership & Polls`, `Auth & Tokens`, `Friend Requests`, `Search History`, `Profile & Username`, `Live Streams & Moderators`, `Close Friends & Follows`, `user users settings`, `user report flag`, `list friends request`, `toastcontainer confirmationdialog eventattendees`, `create init user`, `hashtags hashtag detail`, `notification notifications read`, `base poll db`, `invites event eventchatmessage`, `notificationbell notificationdropdown`, `generator`, `stream streams recording`, `comment commentreaction init`, `analytics engagement growth`, `hashtag post hashtags`, `rankingbreakdown 23 rules`, `friendsapi relationshipbuttonprops followlistprops`, `interests interestprofile 1461`, `init profilerepository`, `init ranking basemodel`, `users blockeduser user`, `videocategory categories init`, `videocard historypage playlistdetailpage`, `profiles contentprofile 1542`, `live livechatmessagecreate livechatmessagelistresponse`, `notification init read`, `metricsstate 1584`, `reel reels reelresponse`, `engine affinity item`, `notfoundpage googleloginform app`, `videocomments commentitem timeago`, `media mediaresponse response`, `setting systemsetting settings`, `LearningLoopRepository`, `reply storyreplyresponse replies`?**
  _High betweenness centrality (0.134) - this node is a cross-community bridge._
- **Why does `User` connect `init profilerepository` to `Direct Messaging`, `Admin & User Management`, `Videos & Playlists`, `Post Engagement Repositories`, `Live Streaming`, `Privacy & Close Friends`, `WebSocket Messaging`, `Comments Service`, `Group Membership & Polls`, `Friend Requests`, `Search History`, `Friendship Relationships`, `Close Friends & Follows`, `user report flag`, `list friends request`, `toastcontainer confirmationdialog eventattendees`, `create init user`, `notification notifications read`, `base poll db`, `notificationbell notificationdropdown`, `stream streams recording`, `comment commentreaction init`, `analytics engagement growth`, `friendsapi relationshipbuttonprops followlistprops`, `users blockeduser user`, `videocard historypage playlistdetailpage`, `notification init read`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Why does `MediaService` connect `Media Albums` to `reel reels reelresponse`, `Post Engagement Repositories`, `setting systemsetting settings`, `highlight storyhighlightresponse highlights`, `storyreactions reactions storyreactionsprops`, `highlight media albumphotoadd`, `storyreactionresponse reaction reactions`, `mediaupload file media`, `album story stories`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Session` (e.g. with `Base` and `DeviceRepository`) actually correct?**
  _`Session` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 26 inferred relationships involving `MediaService` (e.g. with `FeedRepository` and `MediaRepository`) actually correct?**
  _`MediaService` has 26 INFERRED edges - model-reasoned connections that need verification._
- **Are the 25 inferred relationships involving `RelationshipService` (e.g. with `BlockedUser` and `FollowRequest`) actually correct?**
  _`RelationshipService` has 25 INFERRED edges - model-reasoned connections that need verification._
- **Are the 20 inferred relationships involving `FeedService` (e.g. with `Poll` and `PrivacySetting`) actually correct?**
  _`FeedService` has 20 INFERRED edges - model-reasoned connections that need verification._