# Graph Report - Friendix Social Platform  (2026-08-06)

## Corpus Check
- 468 files · ~194,377 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4239 nodes · 11014 edges · 236 communities (208 shown, 28 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 1257 edges (avg confidence: 0.65)
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
- storyhighlights storyhighlightsprops usecreatehighlight
- config basesettings rankingconfig
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
- settings 12
- d importmeta importmetaenv
- clsx
- dompurify
- motion
- react
- avatar
- label
- slot
- dom
- merge
- animate
- color
- highlight
- rule
- link
- placeholder
- underline
- kit
- dompurify
- zustand
- react
- @tiptap/extension-font-family
- @tiptap/extension-image
- @tiptap/extension-strike
- @tiptap/extension-text-align
- @tiptap/pm

## God Nodes (most connected - your core abstractions)
1. `Session` - 132 edges
2. `MediaService` - 129 edges
3. `cn()` - 107 edges
4. `RelationshipService` - 104 edges
5. `Base` - 92 edges
6. `TimestampMixin` - 91 edges
7. `FeedRepository` - 89 edges
8. `LiveService` - 89 edges
9. `FeedService` - 87 edges
10. `Button` - 87 edges

## Surprising Connections (you probably didn't know these)
- `refresh_metrics()` --calls--> `ContentMetricsService`  [INFERRED]
  backend/app/api/v1/content_profiles.py → backend/app/services/content_metrics_service.py
- `process_all_users()` --calls--> `is_admin()`  [INFERRED]
  backend/app/api/v1/interests.py → backend/app/core/permissions.py
- `_require_admin()` --calls--> `is_admin()`  [INFERRED]
  backend/app/api/v1/learning.py → backend/app/core/permissions.py
- `proxy_media()` --indirect_call--> `BlockedUser`  [INFERRED]
  backend/app/api/v1/media.py → backend/app/models/models.py
- `proxy_media()` --indirect_call--> `Friendship`  [INFERRED]
  backend/app/api/v1/media.py → backend/app/models/models.py

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **FastAPI Runtime Stack** — backend_requirements_fastapi, backend_requirements_starlette, backend_requirements_pydantic, backend_requirements_uvicorn, backend_requirements_anyio [INFERRED 0.85]
- **SPA Bootstrap Flow** — frontend_index, frontend_index_root, frontend_index_main_tsx [INFERRED 0.85]

## Communities (236 total, 28 thin omitted)

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
Nodes (58): App(), BOTTOM_NAV_ITEMS, MobileBottomNav(), ToastContainer(), Card, CardContent, CardDescription, CardFooter (+50 more)

### Community 4 - "Admin & User Management"
Cohesion: 0.07
Nodes (51): AdminUserListResponse, AuditLogListResponse, ban_user(), create_feature_flag(), create_system_setting(), delete_feature_flag(), delete_system_setting(), get_admin_service() (+43 more)

### Community 5 - "App Configuration"
Cohesion: 0.07
Nodes (51): get_rules_config(), BaseSettings, Configurable recommendation rules (Phase 4.5).  A business rules layer that ru, RulesConfig, Candidate, is_fresh(), datetime, UUID (+43 more)

### Community 6 - "Chat & Call UI"
Cohesion: 0.14
Nodes (22): Avatar, ChatList(), ChatListProps, ConversationItem(), formatTime(), ChatWindowProps, ConversationSearch(), ConversationSearchProps (+14 more)

### Community 7 - "Content Rendering & Filters"
Cohesion: 0.07
Nodes (33): dompurify, dompurify, LiquidGlassFilter(), ParsedContent(), ParsedContentProps, LazyVideo(), LazyVideoProps, barAppearanceClasses() (+25 more)

### Community 8 - "Videos & Playlists"
Cohesion: 0.07
Nodes (16): Playlist, PlaylistVideo, Video, VideoComment, VideoLike, WatchHistory, WatchLater, AnalyticsRepository (+8 more)

### Community 9 - "Post Engagement Repositories"
Cohesion: 0.05
Nodes (32): FeedPosition, Hashtag, HashtagFollow, Post, PostHashtag, PostHide, PostLike, PostSave (+24 more)

### Community 10 - "Stories & Reels"
Cohesion: 0.07
Nodes (18): AlbumPhoto, PhotoAlbum, Reel, Story, StoryHighlightItem, StoryReaction, MediaRepository, datetime (+10 more)

### Community 11 - "Live Streaming"
Cohesion: 0.12
Nodes (12): LiveChatMessage, LiveModerator, LiveStream, LiveViewer, LiveRepository, LiveStream, UUID, LiveChatMessage (+4 more)

### Community 12 - "Go Live & Live Chat"
Cohesion: 0.06
Nodes (46): GoLiveButton(), LiveChat(), LiveChatProps, LiveDonations(), LiveDonationsProps, EMOJI_OPTIONS, LiveReactions(), LiveReactionsProps (+38 more)

### Community 13 - "Privacy & Close Friends"
Cohesion: 0.07
Nodes (12): FollowRequest, Mute, Restrict, BlockedUser, CloseFriend, Friendship, Mute, User (+4 more)

### Community 14 - "WebSocket Messaging"
Cohesion: 0.14
Nodes (11): Conversation, ConversationMember, Message, MessageReaction, MessageTyping, MessagingRepository, UUID, Conversation (+3 more)

### Community 15 - "Media Albums"
Cohesion: 0.08
Nodes (61): add_photo_to_album(), add_reaction(), add_reply(), add_story_to_highlight(), archive_story(), create_album(), create_highlight(), create_reel() (+53 more)

### Community 16 - "Event Planning"
Cohesion: 0.08
Nodes (35): cancel_event(), create_event(), delete_chat_message(), delete_event(), get_attendees(), get_chat_messages(), get_event(), get_event_invites() (+27 more)

### Community 17 - "Group Creation UI"
Cohesion: 0.06
Nodes (63): CreateGroupModal(), CreateGroupModalProps, PRIVACY_OPTIONS, GroupAnnouncements(), GroupAnnouncementsProps, GroupChat(), GroupChatProps, GroupEvents() (+55 more)

### Community 18 - "App Layout"
Cohesion: 0.11
Nodes (21): ProtectedRoute(), PublicRoute(), SetupUsernameRoute(), AppLayout(), AppLayoutProps, LayoutContext, LayoutContextType, useLayout() (+13 more)

### Community 19 - "Comments Service"
Cohesion: 0.09
Nodes (35): create_comment(), delete_comment(), get_comment_replies(), get_comment_service(), get_post_comments(), hide_comment(), pin_comment(), CommentCreate (+27 more)

### Community 20 - "Skeleton Loaders & Analytics"
Cohesion: 0.06
Nodes (32): AnalyticsCardSkeleton(), PostSkeleton(), Skeleton(), AnalyticsPage(), periodOptions, ProfileViewsTab(), Tab, tabs (+24 more)

### Community 21 - "Form UI Primitives"
Cohesion: 0.07
Nodes (34): RelationshipButton(), NotFoundPage(), Button, ButtonProps, buttonVariants, ConfirmationDialog(), ConfirmationDialogProps, Textarea (+26 more)

### Community 22 - "User Action Menu"
Cohesion: 0.15
Nodes (37): UserActionMenu(), UserActionMenuProps, FriendsPage(), useAcceptFollowRequest(), useAddCloseFriend(), useBlockedUsers(), useCancelFollowRequest(), useCancelFriendRequest() (+29 more)

### Community 23 - "Input Dialogs"
Cohesion: 0.16
Nodes (38): InputDialog(), InputDialogProps, errorMessage(), HomePage(), updatePostInInfiniteCache(), useArchivedPosts(), useArchivePost(), useCreatePost() (+30 more)

### Community 24 - "Group Membership & Polls"
Cohesion: 0.10
Nodes (18): Group, GroupAnnouncement, GroupEvent, GroupEventAttendee, GroupJoinRequest, GroupMember, GroupPoll, GroupPollVote (+10 more)

### Community 25 - "Composer Pickers"
Cohesion: 0.07
Nodes (29): Label, labelVariants, Switch, SwitchProps, BackgroundPicker(), BackgroundPickerProps, POST_BACKGROUNDS, POST_BG_TEMPLATES (+21 more)

### Community 26 - "Image Editor"
Cohesion: 0.07
Nodes (46): MediaPanel(), MediaPanelProps, CreateReel(), CreateReelProps, Privacy, PRIVACY_OPTIONS, DEFAULT_STATE, EditState (+38 more)

### Community 27 - "Auth & Tokens"
Cohesion: 0.09
Nodes (32): delete_account(), get_auth_service(), get_current_user(), get_devices(), get_login_history(), google_login(), logout(), logout_all() (+24 more)

### Community 28 - "Search Filters & Results"
Cohesion: 0.09
Nodes (36): useSearchHashtags(), AdvancedFilters(), AdvancedFiltersProps, POST_TYPES, CommentSearchResults(), CommentSearchResultsProps, LiveSearchResults(), LiveSearchResultsProps (+28 more)

### Community 29 - "Video Service & Playlists"
Cohesion: 0.09
Nodes (11): VideoCommentResponse, VideoResponse, UUID, VideoCommentCreate, VideoCreate, VideoUpdate, RecommendationListResponse, VideoCommentListResponse (+3 more)

### Community 30 - "Friend Requests"
Cohesion: 0.13
Nodes (43): accept_follow_request(), accept_friend_request(), add_close_friend(), block_user(), cancel_follow_request(), cancel_friend_request(), follow_user(), get_blocked_users() (+35 more)

### Community 31 - "Search History"
Cohesion: 0.12
Nodes (22): BaseModel, SavedSearchCreate, SavedSearchListResponse, SavedSearchResponse, SearchHistoryListResponse, SearchHistoryResponse, SearchResultComment, SearchResultLive (+14 more)

### Community 32 - "Profile & Username"
Cohesion: 0.10
Nodes (31): check_username(), get_explore_profiles(), get_my_profile(), get_profile_service(), get_public_profile(), AvatarUpdate, CoverPhotoUpdate, ProfileUpdate (+23 more)

### Community 33 - "Friendship Relationships"
Cohesion: 0.06
Nodes (9): FriendshipResponse, CloseFriendDetail, FriendDetail, UUID, BlockDetail, FollowRequestDetail, MuteDetail, RelationshipSummary (+1 more)

### Community 34 - "Event Cards & Chat"
Cohesion: 0.09
Nodes (35): EventCard(), EventCardProps, EventChat(), EventChatProps, InviteModal(), InviteModalProps, CreateEventPage(), EventDetailPage() (+27 more)

### Community 35 - "Live Streams & Moderators"
Cohesion: 0.12
Nodes (39): accept_guest_invite(), add_moderator(), create_stream(), delete_stream(), end_stream(), get_active_streams(), get_chat_messages(), get_donations() (+31 more)

### Community 36 - "Close Friends & Follows"
Cohesion: 0.13
Nodes (8): CloseFriend, Follow, Friendship, FriendsRepository, CloseFriend, Friendship, User, UUID

### Community 37 - "Dependencies & Migrations"
Cohesion: 0.08
Nodes (40): backend/requirements.txt, alembic, annotated-types, anyio, certifi, cffi, click, colorama (+32 more)

### Community 38 - "Media Panel & Adaptive Image"
Cohesion: 0.11
Nodes (24): AdaptiveImage(), AdaptiveImageProps, FollowList(), GroupCard(), GroupCardProps, PRIVACY_ICONS, HashtagPostCard(), HashtagPostCardProps (+16 more)

### Community 39 - "Video Playlists & History"
Cohesion: 0.15
Nodes (35): add_video_to_playlist(), clear_watch_history(), create_comment(), create_playlist(), create_video(), delete_comment(), delete_playlist(), delete_video() (+27 more)

### Community 40 - "user users settings"
Cohesion: 0.13
Nodes (24): block_user(), get_blocked_users(), get_muted_users(), get_privacy_service(), get_privacy_settings(), get_restricted_users(), mute_user(), PrivacySettingUpdate (+16 more)

### Community 41 - "commentform commentitem commentreactions"
Cohesion: 0.13
Nodes (29): CommentForm(), CommentFormProps, CommentItem(), CommentItemProps, CommentReplies(), CommentReactions(), CommentReactionsProps, EMOJI_OPTIONS (+21 more)

### Community 42 - "user report flag"
Cohesion: 0.10
Nodes (14): AuditLog, FeatureFlag, Report, SystemSetting, User, AdminRepository, datetime, User (+6 more)

### Community 43 - "list friends request"
Cohesion: 0.20
Nodes (4): PermissionsService, Mute, PrivacySetting, UUID

### Community 44 - "toastcontainer confirmationdialog eventattendees"
Cohesion: 0.16
Nodes (17): RightSidebar(), EventAttendeeItem(), EventAttendees(), EventAttendeesProps, useEventAttendees(), useRelationshipSummary(), useSendFriendRequest(), GroupMemberItem() (+9 more)

### Community 45 - "create init user"
Cohesion: 0.11
Nodes (10): Device, DeviceRepository, LoginHistoryRepository, User, UUID, SessionRepository, UserRepository, Device (+2 more)

### Community 46 - "request friend count"
Cohesion: 0.12
Nodes (6): FollowUserDetail, FriendsService, CloseFriendDetail, FollowResponse, FriendDetail, UUID

### Community 47 - "followbutton hashtagcard trendingtags"
Cohesion: 0.13
Nodes (22): FollowButton(), FollowButtonProps, HashtagCard(), HashtagCardProps, TrendingTags(), HashtagDetailPage(), HashtagExplorePage(), useFollowHashtag() (+14 more)

### Community 48 - "hashtags hashtag detail"
Cohesion: 0.13
Nodes (21): create_hashtag(), follow_hashtag(), get_followed_hashtags(), get_hashtag_detail(), get_hashtag_posts(), get_hashtag_service(), get_trending_hashtags(), search_hashtags() (+13 more)

### Community 49 - "notification notifications read"
Cohesion: 0.11
Nodes (19): delete_notification(), get_notification_service(), get_notifications(), get_unread_count(), mark_as_read(), UUID, NotificationActor, NotificationCountResponse (+11 more)

### Community 50 - "photoalbumview hooks useactivestories"
Cohesion: 0.11
Nodes (20): useActiveStories(), useAddPhotoToAlbum(), useAlbum(), useCloudinarySignature(), useCreateAlbum(), useCreateReel(), useDeleteMedia(), useDeleteReel() (+12 more)

### Community 51 - "base poll db"
Cohesion: 0.15
Nodes (29): Base, AlbumPhoto, AuditLog, BannedUser, CommentReport, ContentEvent, GroupMessage, InterestEventSignal (+21 more)

### Community 52 - "highlight media albumphotoadd"
Cohesion: 0.11
Nodes (24): AlbumPhotoAdd, AlbumPhotoResponse, CloudinarySignRequest, CloudinarySignResponse, MediaUpdate, MediaUpload, MediaUserResponse, PhotoAlbumCreate (+16 more)

### Community 53 - "tracking events"
Cohesion: 0.08
Nodes (18): UUID, Receive up to 200 engagement events in one call.      Events are bulk-inserted, track_events(), EventTrackingRepository, Return the subset of client ids already persisted (for dedup)., Bulk insert raw events in a single statement., Upsert one view session, accumulating counters in place., Write-optimized persistence for the content event tracking pipeline.      The (+10 more)

### Community 54 - "invites event eventchatmessage"
Cohesion: 0.18
Nodes (10): Event, EventChatMessage, EventInvite, EventRSVP, EventRepository, UUID, Event, EventChatMessage (+2 more)

### Community 55 - "album story stories"
Cohesion: 0.11
Nodes (6): MediaResponse, StoryResponse, MediaUpdate, MediaUpload, StoryCreate, UUID

### Community 56 - "liquidglassactiveindicator liquidglassfilter"
Cohesion: 0.16
Nodes (24): clamp(), Geometry, LiquidGlassActiveIndicator(), LiquidGlassActiveIndicatorProps, SPRING, getValueOrMotion(), LiquidGlassFilter(), LiquidGlassFilterProps (+16 more)

### Community 57 - "notificationbell notificationdropdown"
Cohesion: 0.15
Nodes (22): useAcceptFriendRequest(), useRejectFriendRequest(), NotificationBell(), NotificationDropdown(), NotificationDropdownProps, getNotificationRoute(), getNotificationText(), NOTIFICATION_COLORS (+14 more)

### Community 58 - "privacysettingspage privacyapi"
Cohesion: 0.18
Nodes (23): BlockMuteListProps, useBlockedUsers(), useBlockUser(), useMutedUsers(), useMuteUser(), usePrivacySettings(), useRestrictedUsers(), useRestrictUser() (+15 more)

### Community 59 - "generator"
Cohesion: 0.10
Nodes (20): get_feed_generator(), get_recommended_feed(), UUID, Return a page of the personalized feed for the authenticated user.      Candid, FeedConfig, get_feed_config(), BaseSettings, Configurable Feed Generator (Phase 5).  The feed generator composes the alread (+12 more)

### Community 60 - "profile contentmetricsrefreshresponse"
Cohesion: 0.16
Nodes (15): ContentMetricsRefreshResponse, ContentProfileListResponse, ContentProfileResponse, ContentProfileUpdate, BaseModel, compute_freshness(), compute_quality(), Compute the 0..1 quality score as a weighted blend of attributes. (+7 more)

### Community 61 - "react autoprefixer eslint"
Cohesion: 0.08
Nodes (25): autoprefixer, eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, autoprefixer, eslint, eslint-plugin-react-hooks (+17 more)

### Community 62 - "react axios authority"
Cohesion: 0.09
Nodes (23): axios, class-variance-authority, framer-motion, dependencies, axios, class-variance-authority, framer-motion, @radix-ui/react-avatar (+15 more)

### Community 63 - "stream streams recording"
Cohesion: 0.19
Nodes (6): LiveStreamResponse, LiveScheduleRequest, LiveStreamCreate, LiveStreamUpdate, UUID, LiveStreamListResponse

### Community 64 - "comment commentreaction init"
Cohesion: 0.24
Nodes (7): Comment, CommentReaction, CommentRepository, Comment, UUID, CommentReaction, CommentReport

### Community 65 - "tsconfig compileroptions allowimportingtsextensions"
Cohesion: 0.08
Nodes (23): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleDetection (+15 more)

### Community 66 - "analytics engagement growth"
Cohesion: 0.20
Nodes (11): get_engagement(), get_followers_growth(), get_overview(), get_post_analytics(), get_profile_views(), get_reel_analytics(), get_story_analytics(), get_video_analytics() (+3 more)

### Community 67 - "profile"
Cohesion: 0.10
Nodes (25): get_interest_service(), get_my_profile(), get_profile_by_type(), process_all_users(), UUID, Return the authenticated user's interest profile., Return only one interest dimension (category / tag / creator / topic)., Consume the user's pending raw events into their interest profile. (+17 more)

### Community 68 - "hashtag post hashtags"
Cohesion: 0.14
Nodes (19): PostModalProps, ProfileHeader(), InfoItemProps, ProfileInfo(), ProfileInfoProps, PostCardHandlers, ProfilePostList(), ProfilePostListProps (+11 more)

### Community 69 - "rankingbreakdown 23 rules"
Cohesion: 0.17
Nodes (18): RankingBreakdown, Per-signal normalized values (0..1) and the weights used to blend them., BaseModel, One decision made by a rule for a single candidate., A candidate that survived the rules pipeline, ready for feed ordering., Run Ranking Engine -> Rules Engine over a candidate pool.      Personalized to, Active rules + their parameter sets (transparency/ops endpoint)., RecommendationRequest (+10 more)

### Community 70 - "friendsapi relationshipbuttonprops followlistprops"
Cohesion: 0.11
Nodes (29): RelationshipButtonProps, FollowListProps, cn(), FriendList(), FriendListProps, FriendRequestCard(), FriendRequestCardProps, FriendSuggestions() (+21 more)

### Community 71 - "interests interestprofile 1461"
Cohesion: 0.16
Nodes (11): InterestProfile, Per-user aggregate holding the incremental-processing watermark.      ``last_o, One row per (user, interest dimension) with a decaying strength score., UserInterest, InterestRepository, UUID, Insert derived signals, skipping any (event, dimension) already seen., Apply decaying strength updates to user interests. Returns count. (+3 more)

### Community 72 - "mediaapi media albumphoto"
Cohesion: 0.13
Nodes (23): UploadZoneProps, mediaApi, AlbumPhoto, CloudinarySignature, MediaStats, MediaTab, MediaType, MediaUpdate (+15 more)

### Community 73 - "init profilerepository"
Cohesion: 0.14
Nodes (3): ProfileRepository, User, UUID

### Community 74 - "videos playlistcreate playlistdetailresponse"
Cohesion: 0.12
Nodes (22): PlaylistCreate, PlaylistDetailResponse, PlaylistListResponse, PlaylistResponse, PlaylistUpdate, BaseModel, RecommendationListResponse, VideoCategoryBrief (+14 more)

### Community 75 - "profiles profile"
Cohesion: 0.19
Nodes (18): _check_type(), get_content_profile_service(), get_profile(), list_profiles(), UUID, Admin-only: rebuild profiles for the newest content of every type., Admin-only: incrementally update popularity/freshness from new events., Admin-only: rebuild profiles for the newest content of one type. (+10 more)

### Community 76 - "friends blockdetail blockresponse"
Cohesion: 0.19
Nodes (19): BlockDetail, BlockResponse, CloseFriendDetail, CloseFriendResponse, FavoriteUpdate, FollowRequestDetail, FollowRequestResponse, FollowResponse (+11 more)

### Community 77 - "init ranking basemodel"
Cohesion: 0.17
Nodes (13): BaseModel, RankedItem, RankingExplainResponse, RankingPreviewRequest, RankingPreviewResponse, Score a pool of content profiles and return them sorted by rank.      ``user_i, RankingEngine, Computes a rank score + component breakdown for a single content item. (+5 more)

### Community 78 - "videoapi videos playlist"
Cohesion: 0.05
Nodes (63): CategoryFilter(), CategoryFilterProps, formatDuration(), formatViews(), timeAgo(), VideoCard(), VideoCardProps, CommentItem() (+55 more)

### Community 79 - "users blockeduser user"
Cohesion: 0.27
Nodes (5): BlockedUser, PrivacyRepository, BlockedUser, PrivacySetting, UUID

### Community 80 - "videocategory categories init"
Cohesion: 0.12
Nodes (19): ImagePreset, OptimizedImage, OptimizedImageProps, PRESET_DEFAULTS, CallModal(), CallModalProps, CallState, ChatHeaderProps (+11 more)

### Community 81 - "videocard historypage playlistdetailpage"
Cohesion: 0.14
Nodes (9): SavedSearch, SearchHistory, Comment, LiveStream, Post, Reel, User, UUID (+1 more)

### Community 82 - "groupapi groups groupannouncement"
Cohesion: 0.20
Nodes (20): ChatHeader(), ChatWindow(), useAddReaction(), useArchivedConversations(), useConversation(), useConversations(), useDeleteConversation(), useDeleteMessage() (+12 more)

### Community 83 - "profiles contentprofile 1542"
Cohesion: 0.23
Nodes (5): ContentProfile, Machine-readable profile for any content item.      One row per (content_type,, ContentProfileRepository, UUID, Persistence + source extraction for content profiles.

### Community 84 - "live livechatmessagecreate livechatmessagelistresponse"
Cohesion: 0.23
Nodes (15): LiveChatMessageCreate, LiveChatMessageListResponse, LiveDonationCreate, LiveDonationListResponse, LiveDonationResponse, LiveGuestCreate, LiveModeratorCreate, LiveReactionCreate (+7 more)

### Community 85 - "notification init read"
Cohesion: 0.30
Nodes (4): Notification, NotificationRepository, UUID, Notification

### Community 86 - "followlist friendlist friendrequestcard"
Cohesion: 0.18
Nodes (11): get_learning_service(), get_loop_status(), UUID, Report the learning loop's progress telemetry (read-only)., Admin-only: execute one learning cycle on demand.      Runs the interest update,, _require_admin(), run_loop_cycle(), LearningLoopService (+3 more)

### Community 87 - "metricsstate 1584"
Cohesion: 0.15
Nodes (8): MetricsState, Single-row watermark for the incremental content metrics job., ContentMetricsRepository, UUID, Write-optimized persistence for the incremental content metrics pass., Bulk refresh freshness_score for every profile (single UPDATE)., ContentMetricsService, Incrementally updates computed metrics on ContentProfile.      Popularity is m

### Community 88 - "features"
Cohesion: 0.19
Nodes (7): profile_features(), UUID, RankingRepository, Return (interest_type, interest_key, strength) for a user's interests., Flatten a ContentProfile ORM row into the dict shape the engine expects., Read surfaces for the ranking engine.      Candidates come from ``content_prof, Aggregate view + engagement counters per content id (no N+1).

### Community 89 - "playlistspage hooks usecreateplaylist"
Cohesion: 0.14
Nodes (8): get_learning_config(), LearningConfig, BaseSettings, Configurable Learning Loop (Phase 6).  The learning loop continuously closes the, Background worker that continuously runs the Phase 6 Learning Loop.  Runs ``Lear, WebSocket, _start_learning_loop(), websocket_endpoint()

### Community 90 - "watchpage useaddvideotoplaylist userecommendations"
Cohesion: 0.20
Nodes (12): messagingApi, ConversationCreate, ConversationMember, ConversationUpdate, MessageCreate, MessageReaction, MessageRead, MessageSearchResult (+4 more)

### Community 91 - "createreel createreelprops privacy"
Cohesion: 0.06
Nodes (40): getPostBackgroundStyle(), CreatePostButton(), CreatePostButtonProps, ComposerType, CreatePostForm(), CreatePostFormProps, DURATION_MS, EmptyFeed() (+32 more)

### Community 92 - "datetime"
Cohesion: 0.27
Nodes (5): datetime, UUID, Context queries for the rules engine (follows, history, reports, features)., Load content profiles for a list of (content_type, content_id) keys., RulesRepository

### Community 93 - "package name private"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, dev, lint, preview, typecheck (+2 more)

### Community 94 - "categoryfilter videospage categoryfilterprops"
Cohesion: 0.22
Nodes (5): LearningLoopState, Single-row control + telemetry for the Phase 6 Learning Loop.      Tracks when, LearningLoopRepository, Persistence for the Phase 6 learning loop.      Owns the single-row ``learning_l, Decay stale interests in bulk, then prune noise.          Returns ``(rows_decaye

### Community 95 - "config init metricsconfig"
Cohesion: 0.40
Nodes (4): get_metrics_config(), MetricsConfig, BaseSettings, Configurable formulas for content profile metrics.  All weights and timescales

### Community 96 - "donation reaction livereactionresponse"
Cohesion: 0.22
Nodes (4): LiveReactionResponse, LiveDonationCreate, LiveReactionCreate, LiveDonationListResponse

### Community 97 - "reel reels reelresponse"
Cohesion: 0.33
Nodes (3): ReelResponse, ReelCreate, ReelUpdate

### Community 98 - "engine affinity item"
Cohesion: 0.24
Nodes (7): interest_affinity(), _rate(), Modular ranking engine (Phase 4).  Each signal is an independent 0..1 scoring, 1 - exp(-rate*gain): saturating 0..1 normalization of a positive rate., Personalization signal in [-1, 1].      Matches the content's category / tags, Normalized per-signal values from content features + engagement dict., _sat()

### Community 99 - "notfoundpage googleloginform app"
Cohesion: 0.30
Nodes (4): ConnectionManager, messaging_websocket(), WebSocket, _serialize_message()

### Community 100 - "videocomments commentitem timeago"
Cohesion: 0.27
Nodes (4): AbstractContextManager, LearningLoopWorker, A stoppable background thread that repeatedly runs learning cycles., Run a single cycle against a fresh session.

### Community 101 - "interest interestbatchprocessresponse interestitem"
Cohesion: 0.36
Nodes (9): DecayPassOut, DecayTelemetry, InterestPassOut, InterestTelemetry, LearningCycleResult, LearningStatusResponse, MetricsPassOut, MetricsTelemetry (+1 more)

### Community 102 - "ranking type"
Cohesion: 0.39
Nodes (7): _check_type(), explain_ranking(), get_ranking_service(), preview_ranking(), UUID, Score a pool of content profiles and return them sorted by rank.      Personal, Return the rank score and per-signal breakdown for a single item.

### Community 104 - "media mediaresponse response"
Cohesion: 0.24
Nodes (7): AVATAR_SIZE_PX, AvatarGroup, AvatarProps, avatarVariants, Badge(), BadgeProps, badgeVariants

### Community 105 - "storyarchiveview storyarchiveviewprops storyviewerprops"
Cohesion: 0.19
Nodes (16): useBlockUser(), StoryArchiveView(), StoryArchiveViewProps, StoryReplyInput(), StoryReplyInputProps, StoryViewer(), StoryViewerProps, timeAgo() (+8 more)

### Community 106 - "recommendations rules"
Cohesion: 0.38
Nodes (6): get_active_rules(), get_recommendation_service(), get_recommendations(), UUID, Rank candidates then apply the recommendation rules.      The result is the ru, Return the active rules and their parameter sets (ops transparency).

### Community 107 - "setting systemsetting settings"
Cohesion: 0.39
Nodes (8): clear_search_history(), delete_saved_search(), get_saved_searches(), get_search_history(), get_search_service(), UUID, save_search(), search()

### Community 108 - "cloudinary font"
Cohesion: 0.33
Nodes (7): frontend/index.html, Cloudinary Service, Inter Google Font, src/main.tsx Entry Script, root Mount Element, Friendix Title, vite.svg Favicon

### Community 109 - "storyhighlights storyhighlightsprops usecreatehighlight"
Cohesion: 0.48
Nodes (6): StoryHighlights(), StoryHighlightsProps, useCreateHighlight(), useDeleteHighlight(), useUserHighlights(), StoryHighlight

### Community 110 - "config basesettings rankingconfig"
Cohesion: 0.47
Nodes (4): get_ranking_config(), BaseSettings, RankingConfig, Configurable formulas for the ranking engine (Phase 4).  Every signal the rank

### Community 111 - "message livechatmessageresponse messages"
Cohesion: 0.40
Nodes (3): LiveChatMessageResponse, LiveChatMessageCreate, LiveChatMessageListResponse

### Community 112 - "highlight storyhighlightresponse highlights"
Cohesion: 0.33
Nodes (3): StoryHighlightResponse, StoryHighlightCreate, StoryHighlightUpdate

### Community 114 - "features language"
Cohesion: 0.33
Nodes (5): detect_language(), Lightweight text feature helpers shared by content and interest profiling.  Th, Split free text into normalized topic tokens (lowercased, deduped)., Heuristic language detection based on dominant Unicode script.      Returns a, topic_tokens()

### Community 115 - "storyreactions reactions storyreactionsprops"
Cohesion: 0.47
Nodes (5): QUICK_REACTIONS, StoryReactions(), StoryReactionsProps, useAddStoryReaction(), useRemoveStoryReaction()

### Community 116 - "app compileroptions composite"
Cohesion: 0.33
Nodes (5): compilerOptions, composite, tsBuildInfoFile, include, src

### Community 118 - "mediaupload file media"
Cohesion: 0.67
Nodes (4): MediaUpload, upload_file(), upload_media(), UploadFile

### Community 120 - "button rationale image"
Cohesion: 0.67
Nodes (4): Carousel Navigation Design Intent, Slider Buttons Asset, Next Slider Button, Previous Slider Button

### Community 121 - "storyreplyinput storyreplyinputprops useaddstoryreply"
Cohesion: 0.28
Nodes (4): MusicStoryCreator(), MusicStoryCreatorProps, SAMPLE_TRACKS, useCreateStory()

### Community 198 - "dompurify"
Cohesion: 0.33
Nodes (8): PhotoAlbumView(), PhotoAlbumViewProps, PRIVACY_ICONS, PRIVACY_LABELS, useAlbumPhotos(), useDeleteAlbum(), useUpdateAlbum(), PhotoAlbum

### Community 199 - "motion"
Cohesion: 0.39
Nodes (3): PhotoAlbumResponse, PhotoAlbumCreate, PhotoAlbumUpdate

### Community 214 - "dompurify"
Cohesion: 0.83
Nodes (3): readStored(), useScrollRestoration(), writeStored()

## Knowledge Gaps
- **285 isolated node(s):** `Config`, `name`, `private`, `version`, `type` (+280 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Session` connect `Video Playlists & History` to `Post Feed & Publishing`, `Direct Messaging`, `Groups & Events`, `Admin & User Management`, `Videos & Playlists`, `Post Engagement Repositories`, `Live Streaming`, `Privacy & Close Friends`, `WebSocket Messaging`, `Media Albums`, `Event Planning`, `Comments Service`, `Group Membership & Polls`, `Auth & Tokens`, `Friend Requests`, `Profile & Username`, `Live Streams & Moderators`, `Close Friends & Follows`, `user users settings`, `user report flag`, `list friends request`, `create init user`, `hashtags hashtag detail`, `notification notifications read`, `base poll db`, `tracking events`, `invites event eventchatmessage`, `generator`, `comment commentreaction init`, `analytics engagement growth`, `profile`, `settings 12`, `interests interestprofile 1461`, `init profilerepository`, `profiles profile`, `init ranking basemodel`, `users blockeduser user`, `videocard historypage playlistdetailpage`, `profiles contentprofile 1542`, `notification init read`, `followlist friendlist friendrequestcard`, `metricsstate 1584`, `features`, `playlistspage hooks usecreateplaylist`, `datetime`, `categoryfilter videospage categoryfilterprops`, `config init metricsconfig`, `ranking type`, `recommendations rules`, `setting systemsetting settings`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Why does `User` connect `user report flag` to `Direct Messaging`, `Admin & User Management`, `Videos & Playlists`, `Post Engagement Repositories`, `Live Streaming`, `Privacy & Close Friends`, `WebSocket Messaging`, `Comments Service`, `Group Membership & Polls`, `Friend Requests`, `Friendship Relationships`, `Close Friends & Follows`, `list friends request`, `create init user`, `notification notifications read`, `base poll db`, `invites event eventchatmessage`, `comment commentreaction init`, `init profilerepository`, `profiles profile`, `users blockeduser user`, `videocard historypage playlistdetailpage`, `notification init read`, `notfoundpage googleloginform app`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Why does `ProfileRepository` connect `init profilerepository` to `Post Feed & Publishing`, `Profile & Username`, `Groups & Events`, `Live Streams & Moderators`, `Video Playlists & History`, `user users settings`, `user report flag`, `request friend count`, `Event Planning`, `hashtags hashtag detail`, `videocard historypage playlistdetailpage`, `Friend Requests`, `Search History`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Session` (e.g. with `Base` and `DeviceRepository`) actually correct?**
  _`Session` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 26 inferred relationships involving `MediaService` (e.g. with `FeedRepository` and `MediaRepository`) actually correct?**
  _`MediaService` has 26 INFERRED edges - model-reasoned connections that need verification._
- **Are the 25 inferred relationships involving `RelationshipService` (e.g. with `BlockedUser` and `FollowRequest`) actually correct?**
  _`RelationshipService` has 25 INFERRED edges - model-reasoned connections that need verification._
- **Are the 90 inferred relationships involving `Base` (e.g. with `AlbumPhoto` and `AuditLog`) actually correct?**
  _`Base` has 90 INFERRED edges - model-reasoned connections that need verification._