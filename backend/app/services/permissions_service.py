from uuid import UUID
from sqlalchemy.orm import Session
from app.models import (
    PrivacySetting, BlockedUser, Follow, FollowRequest,
    Friendship, CloseFriend, Mute, Restrict, User
)


class PermissionsService:
    def __init__(self, db: Session):
        self.db = db

    def get_privacy_settings(self, user_id: UUID) -> PrivacySetting | None:
        return self.db.query(PrivacySetting).filter(
            PrivacySetting.user_id == user_id
        ).first()

    def _get_or_create_privacy(self, user_id: UUID) -> PrivacySetting:
        settings = self.get_privacy_settings(user_id)
        if not settings:
            settings = PrivacySetting(user_id=user_id)
            self.db.add(settings)
            self.db.commit()
            self.db.refresh(settings)
        return settings

    def are_blocked(self, user_id: UUID, other_user_id: UUID) -> bool:
        return self.db.query(BlockedUser).filter(
            BlockedUser.user_id == user_id,
            BlockedUser.blocked_user_id == other_user_id
        ).first() is not None

    def are_blocked_either_direction(self, user_a: UUID, user_b: UUID) -> bool:
        return self.db.query(BlockedUser).filter(
            (BlockedUser.user_id == user_a) & (BlockedUser.blocked_user_id == user_b) |
            (BlockedUser.user_id == user_b) & (BlockedUser.blocked_user_id == user_a)
        ).first() is not None

    def are_friends(self, user_a: UUID, user_b: UUID) -> bool:
        return self.db.query(Friendship).filter(
            Friendship.status == "accepted",
            ((Friendship.requester_id == user_a) & (Friendship.addressee_id == user_b)) |
            ((Friendship.requester_id == user_b) & (Friendship.addressee_id == user_a))
        ).first() is not None

    def are_close_friends(self, user_a: UUID, user_b: UUID) -> bool:
        return self.db.query(CloseFriend).filter(
            CloseFriend.user_id == user_a,
            CloseFriend.friend_id == user_b
        ).first() is not None

    def is_following(self, follower_id: UUID, following_id: UUID) -> bool:
        return self.db.query(Follow).filter(
            Follow.follower_id == follower_id,
            Follow.following_id == following_id
        ).first() is not None

    def is_muted(self, user_id: UUID, muted_user_id: UUID) -> Mute | None:
        return self.db.query(Mute).filter(
            Mute.user_id == user_id,
            Mute.muted_user_id == muted_user_id
        ).first()

    def is_restricted(self, user_id: UUID, restricted_user_id: UUID) -> bool:
        return self.db.query(Restrict).filter(
            Restrict.user_id == user_id,
            Restrict.restricted_user_id == restricted_user_id
        ).first() is not None

    def can_view_profile(self, viewer_id: UUID, profile_owner_id: UUID) -> bool:
        if viewer_id == profile_owner_id:
            return True
        if self.are_blocked_either_direction(viewer_id, profile_owner_id):
            return False
        settings = self._get_or_create_privacy(profile_owner_id)
        if settings.profile_visibility == "public":
            return True
        if settings.profile_visibility == "private":
            return False
        if settings.profile_visibility == "friends":
            return self.are_friends(viewer_id, profile_owner_id)
        return True

    def can_view_posts(self, viewer_id: UUID, post_owner_id: UUID, privacy: str) -> bool:
        if viewer_id == post_owner_id:
            return True
        if self.are_blocked_either_direction(viewer_id, post_owner_id):
            return False
        if privacy == "everyone":
            return True
        if privacy == "friends":
            return self.are_friends(viewer_id, post_owner_id)
        if privacy == "close_friends":
            return self.are_close_friends(post_owner_id, viewer_id)
        if privacy == "followers":
            return self.is_following(viewer_id, post_owner_id)
        if privacy == "friends_followers":
            return self.are_friends(viewer_id, post_owner_id) or self.is_following(viewer_id, post_owner_id)
        if privacy == "only_me":
            return False
        return True

    def can_view_stories(self, viewer_id: UUID, story_owner_id: UUID) -> bool:
        if viewer_id == story_owner_id:
            return True
        if self.are_blocked_either_direction(viewer_id, story_owner_id):
            return False
        settings = self._get_or_create_privacy(story_owner_id)
        if settings.story_privacy == "everyone":
            return True
        if settings.story_privacy == "friends":
            return self.are_friends(viewer_id, story_owner_id)
        if settings.story_privacy == "close_friends":
            return self.are_close_friends(story_owner_id, viewer_id)
        if settings.story_privacy == "followers":
            return self.is_following(viewer_id, story_owner_id)
        if settings.story_privacy == "only_me":
            return False
        return True

    def can_send_friend_request(self, requester_id: UUID, target_id: UUID) -> tuple[bool, str]:
        if requester_id == target_id:
            return False, "Cannot send friend request to yourself"
        if self.are_blocked_either_direction(requester_id, target_id):
            return False, "Cannot send friend request to this user"
        settings = self._get_or_create_privacy(target_id)
        if settings.friend_request_permissions == "none":
            return False, "This user does not accept friend requests"
        if settings.friend_request_permissions == "friends":
            if not self.are_friends(requester_id, target_id):
                return False, "This user only accepts friend requests from friends"
        return True, ""

    def can_send_follow_request(self, requester_id: UUID, target_id: UUID) -> tuple[bool, str]:
        if requester_id == target_id:
            return False, "Cannot follow yourself"
        if self.are_blocked_either_direction(requester_id, target_id):
            return False, "Cannot follow this user"
        settings = self._get_or_create_privacy(target_id)
        if settings.follow_permissions == "none":
            return False, "This user does not allow follows"
        if settings.follow_permissions == "friends":
            if not self.are_friends(requester_id, target_id):
                return False, "This user only allows friends to follow them"
        return True, ""

    def can_send_message(self, sender_id: UUID, recipient_id: UUID) -> tuple[bool, str]:
        if self.are_blocked_either_direction(sender_id, recipient_id):
            return False, "Cannot send message to this user"
        settings = self._get_or_create_privacy(recipient_id)
        if settings.message_permissions == "none":
            return False, "This user does not accept messages"
        if settings.message_permissions == "friends":
            if not self.are_friends(sender_id, recipient_id):
                return False, "This user only accepts messages from friends"
        return True, ""

    def can_mention(self, mentioner_id: UUID, target_id: UUID) -> tuple[bool, str]:
        if self.are_blocked_either_direction(mentioner_id, target_id):
            return False, "Cannot mention this user"
        settings = self._get_or_create_privacy(target_id)
        if settings.mention_permissions == "none":
            return False, "This user does not allow mentions"
        if settings.mention_permissions == "friends":
            if not self.are_friends(mentioner_id, target_id):
                return False, "This user only allows mentions from friends"
        return True, ""

    def can_tag(self, tagger_id: UUID, target_id: UUID) -> tuple[bool, str]:
        if self.are_blocked_either_direction(tagger_id, target_id):
            return False, "Cannot tag this user"
        settings = self._get_or_create_privacy(target_id)
        if settings.tag_review:
            return True, "Tag will require review"
        return True, ""

    def can_invite(self, inviter_id: UUID, invitee_id: UUID) -> tuple[bool, str]:
        if self.are_blocked_either_direction(inviter_id, invitee_id):
            return False, "Cannot invite this user"
        settings = self._get_or_create_privacy(invitee_id)
        if settings.invite_permissions == "none":
            return False, "This user does not accept invitations"
        if settings.invite_permissions == "friends":
            if not self.are_friends(inviter_id, invitee_id):
                return False, "This user only accepts invitations from friends"
        return True, ""

    def can_call(self, caller_id: UUID, receiver_id: UUID) -> tuple[bool, str]:
        if self.are_blocked_either_direction(caller_id, receiver_id):
            return False, "Cannot call this user"
        settings = self._get_or_create_privacy(receiver_id)
        if settings.call_permissions == "none":
            return False, "This user does not accept calls"
        if settings.call_permissions == "friends":
            if not self.are_friends(caller_id, receiver_id):
                return False, "This user only accepts calls from friends"
        return True, ""

    def can_comment(self, commenter_id: UUID, post_owner_id: UUID) -> tuple[bool, str]:
        if self.are_blocked_either_direction(commenter_id, post_owner_id):
            return False, "Cannot comment on this post"
        if self.is_restricted(post_owner_id, commenter_id):
            return True, "Your comment will be visible only to you"
        settings = self._get_or_create_privacy(post_owner_id)
        if settings.comment_privacy == "none":
            return False, "Comments are disabled"
        if settings.comment_privacy == "friends":
            if not self.are_friends(commenter_id, post_owner_id):
                return False, "Only friends can comment"
        return True, ""

    def can_react(self, reactor_id: UUID, post_owner_id: UUID) -> tuple[bool, str]:
        if self.are_blocked_either_direction(reactor_id, post_owner_id):
            return False, "Cannot react to this post"
        return True, ""

    def can_share(self, sharer_id: UUID, post_owner_id: UUID) -> tuple[bool, str]:
        if self.are_blocked_either_direction(sharer_id, post_owner_id):
            return False, "Cannot share this post"
        return True, ""

    def can_download_media(self, downloader_id: UUID, owner_id: UUID) -> tuple[bool, str]:
        if self.are_blocked_either_direction(downloader_id, owner_id):
            return False, "Cannot download this media"
        settings = self._get_or_create_privacy(owner_id)
        if settings.download_media_permissions == "none":
            return False, "Media download is disabled"
        if settings.download_media_permissions == "friends":
            if not self.are_friends(downloader_id, owner_id):
                return False, "Only friends can download media"
        return True, ""

    def can_view_friends_list(self, viewer_id: UUID, owner_id: UUID) -> bool:
        if viewer_id == owner_id:
            return True
        settings = self._get_or_create_privacy(owner_id)
        if settings.hide_friends_list:
            return self.are_friends(viewer_id, owner_id)
        return True

    def can_view_followers_list(self, viewer_id: UUID, owner_id: UUID) -> bool:
        if viewer_id == owner_id:
            return True
        settings = self._get_or_create_privacy(owner_id)
        if settings.hide_followers_list:
            return self.are_friends(viewer_id, owner_id)
        return True

    def can_view_following_list(self, viewer_id: UUID, owner_id: UUID) -> bool:
        if viewer_id == owner_id:
            return True
        settings = self._get_or_create_privacy(owner_id)
        if settings.hide_following_list:
            return self.are_friends(viewer_id, owner_id)
        return True

    def can_view_online_status(self, viewer_id: UUID, owner_id: UUID) -> bool:
        if viewer_id == owner_id:
            return True
        settings = self._get_or_create_privacy(owner_id)
        if settings.hide_online_status:
            return self.are_friends(viewer_id, owner_id)
        return True

    def can_view_last_seen(self, viewer_id: UUID, owner_id: UUID) -> bool:
        if viewer_id == owner_id:
            return True
        settings = self._get_or_create_privacy(owner_id)
        if settings.hide_last_seen:
            return self.are_friends(viewer_id, owner_id)
        return True

    def can_view_birthday(self, viewer_id: UUID, owner_id: UUID) -> bool:
        if viewer_id == owner_id:
            return True
        settings = self._get_or_create_privacy(owner_id)
        if settings.hide_birthday:
            return self.are_friends(viewer_id, owner_id)
        return True

    def get_relationship_summary(self, user_a: UUID, user_b: UUID) -> dict:
        return {
            "are_friends": self.are_friends(user_a, user_b),
            "is_close_friend": self.are_close_friends(user_a, user_b),
            "is_following": self.is_following(user_a, user_b),
            "is_followed_by": self.is_following(user_b, user_a),
            "are_blocked": self.are_blocked_either_direction(user_a, user_b),
            "is_muted": self.is_muted(user_a, user_b) is not None,
            "is_restricted": self.is_restricted(user_a, user_b),
        }
