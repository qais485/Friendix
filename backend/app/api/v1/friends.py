from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.security import get_current_user_id
from app.database.base import get_db
from app.schemas.friends import (
    FriendRequestCreate, FriendshipResponse, FriendDetail, FollowResponse,
    FollowUserDetail, FriendshipStatusResponse, CloseFriendResponse,
    CloseFriendDetail, FavoriteUpdate, FollowRequestResponse,
    FollowRequestDetail, MuteUpdate, MuteResponse, MuteDetail,
    RestrictResponse, RestrictDetail, BlockResponse, BlockDetail,
    UserCounts, RelationshipSummary,
)
from app.services.relationship_service import RelationshipService

router = APIRouter()


def get_service(db: Session = Depends(get_db)) -> RelationshipService:
    return RelationshipService(db)


@router.post("/request", response_model=FriendshipResponse)
def send_friend_request(data: FriendRequestCreate, user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    return service.send_friend_request(user_id, UUID(data.addressee_id))


@router.post("/accept/{friendship_id}", response_model=FriendshipResponse)
def accept_friend_request(friendship_id: str, user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    return service.accept_friend_request(user_id, UUID(friendship_id))


@router.delete("/reject/{friendship_id}")
def reject_friend_request(friendship_id: str, user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    service.reject_friend_request(user_id, UUID(friendship_id))
    return {"message": "Friend request rejected"}


@router.delete("/cancel/{friendship_id}")
def cancel_friend_request(friendship_id: str, user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    service.cancel_friend_request(user_id, UUID(friendship_id))
    return {"message": "Friend request cancelled"}


@router.delete("/remove/{friend_id}")
def remove_friend(friend_id: str, user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    service.remove_friend(user_id, UUID(friend_id))
    return {"message": "Friend removed"}


@router.get("/list", response_model=list[FriendDetail])
def get_friends(target_user_id: str | None = None, user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    target = UUID(target_user_id) if target_user_id else None
    return service.get_friends(user_id, target)


@router.get("/pending/sent", response_model=list[FriendDetail])
def get_pending_sent(user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    return service.get_pending_sent(user_id)


@router.get("/pending/received", response_model=list[FriendDetail])
def get_pending_received(user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    return service.get_pending_received(user_id)


@router.get("/suggestions", response_model=list[FriendDetail])
def get_friend_suggestions(user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    return service.get_friend_suggestions(user_id)


@router.get("/mutual/{other_user_id}", response_model=list[FriendDetail])
def get_mutual_friends(other_user_id: str, user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    return service.get_mutual_friends(user_id, UUID(other_user_id))


@router.get("/status/{other_user_id}", response_model=FriendshipStatusResponse)
def get_friendship_status(other_user_id: str, user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    return service.get_friendship_status(user_id, UUID(other_user_id))


@router.put("/favorite/{friend_id}", response_model=FriendshipResponse)
def update_favorite(friend_id: str, data: FavoriteUpdate, user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    return service.update_favorite(user_id, UUID(friend_id), data.is_favorite)


@router.get("/favorites", response_model=list[FriendDetail])
def get_favorite_friends(user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    return service.get_favorite_friends(user_id)


@router.post("/close/{friend_id}", response_model=CloseFriendResponse)
def add_close_friend(friend_id: str, user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    return service.add_close_friend(user_id, UUID(friend_id))


@router.delete("/close/{friend_id}")
def remove_close_friend(friend_id: str, user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    service.remove_close_friend(user_id, UUID(friend_id))
    return {"message": "Removed from close friends"}


@router.get("/close", response_model=list[CloseFriendDetail])
def get_close_friends(user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    return service.get_close_friends(user_id)


@router.post("/follow/{following_id}", response_model=FollowResponse)
def follow_user(following_id: str, user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    return service.follow_user(user_id, UUID(following_id))


@router.delete("/unfollow/{following_id}")
def unfollow_user(following_id: str, user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    service.unfollow_user(user_id, UUID(following_id))
    return {"message": "Unfollowed"}


@router.delete("/remove-follower/{follower_id}")
def remove_follower(follower_id: str, user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    service.remove_follower(user_id, UUID(follower_id))
    return {"message": "Follower removed"}


@router.get("/followers", response_model=list[FollowUserDetail])
def get_followers(user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    return service.get_followers(user_id)


@router.get("/following", response_model=list[FollowUserDetail])
def get_following(user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    return service.get_following(user_id)


@router.post("/follow-request/{target_id}", response_model=FollowRequestResponse)
def send_follow_request(target_id: str, user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    return service.send_follow_request(user_id, UUID(target_id))


@router.post("/follow-request/accept/{request_id}", response_model=FollowResponse)
def accept_follow_request(request_id: str, user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    return service.accept_follow_request(user_id, UUID(request_id))


@router.delete("/follow-request/reject/{request_id}")
def reject_follow_request(request_id: str, user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    service.reject_follow_request(user_id, UUID(request_id))
    return {"message": "Follow request rejected"}


@router.delete("/follow-request/cancel/{request_id}")
def cancel_follow_request(request_id: str, user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    service.cancel_follow_request(user_id, UUID(request_id))
    return {"message": "Follow request cancelled"}


@router.get("/follow-requests/sent", response_model=list[FollowRequestDetail])
def get_pending_follow_sent(user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    return service.get_pending_follow_sent(user_id)


@router.get("/follow-requests/received", response_model=list[FollowRequestDetail])
def get_pending_follow_received(user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    return service.get_pending_follow_received(user_id)


@router.post("/block/{blocked_user_id}", response_model=BlockResponse)
def block_user(blocked_user_id: str, user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    return service.block_user(user_id, UUID(blocked_user_id))


@router.delete("/block/{blocked_user_id}")
def unblock_user(blocked_user_id: str, user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    service.unblock_user(user_id, UUID(blocked_user_id))
    return {"message": "User unblocked"}


@router.get("/blocked", response_model=list[BlockDetail])
def get_blocked_users(user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    return service.get_blocked_users(user_id)


@router.post("/mute/{muted_user_id}", response_model=MuteResponse)
def mute_user(muted_user_id: str, data: MuteUpdate = MuteUpdate(), user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    return service.mute_user(user_id, UUID(muted_user_id), **data.model_dump())


@router.delete("/mute/{muted_user_id}")
def unmute_user(muted_user_id: str, user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    service.unmute_user(user_id, UUID(muted_user_id))
    return {"message": "User unmuted"}


@router.get("/muted", response_model=list[MuteDetail])
def get_muted_users(user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    return service.get_muted_users(user_id)


@router.post("/restrict/{restricted_user_id}", response_model=RestrictResponse)
def restrict_user(restricted_user_id: str, user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    return service.restrict_user(user_id, UUID(restricted_user_id))


@router.delete("/restrict/{restricted_user_id}")
def unrestrict_user(restricted_user_id: str, user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    service.unrestrict_user(user_id, UUID(restricted_user_id))
    return {"message": "User unrestricted"}


@router.get("/restricted", response_model=list[RestrictDetail])
def get_restricted_users(user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    return service.get_restricted_users(user_id)


@router.get("/count", response_model=UserCounts)
def get_user_counts(user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    return service.get_user_counts(user_id)


@router.get("/summary/{other_user_id}", response_model=RelationshipSummary)
def get_relationship_summary(other_user_id: str, user_id: UUID = Depends(get_current_user_id), service: RelationshipService = Depends(get_service)):
    return service.get_relationship_summary(user_id, UUID(other_user_id))
