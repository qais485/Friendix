import json
from uuid import UUID
from datetime import datetime, timezone
from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.database.base import SessionLocal
from app.core.security import decode_token
from app.models import User
from app.repositories.messaging_repository import MessagingRepository


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_to_user(self, user_id: str, data: dict):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(data)
                except Exception:
                    pass

    async def broadcast_to_conversation(self, conversation_id: str, user_ids: list[str], data: dict, exclude_user: str | None = None):
        for uid in user_ids:
            if uid != exclude_user:
                await self.send_to_user(uid, data)

    def is_online(self, user_id: str) -> bool:
        return user_id in self.active_connections and len(self.active_connections[user_id]) > 0

    async def send_notification(self, user_id: str, notification_data: dict):
        await self.send_to_user(user_id, {
            "type": "notification",
            "notification": notification_data,
        })


manager = ConnectionManager()


def _serialize_message(msg) -> dict:
    return {
        "id": str(msg.id),
        "conversation_id": str(msg.conversation_id),
        "sender_id": str(msg.sender_id) if msg.sender_id else None,
        "content": msg.content,
        "message_type": msg.message_type,
        "media_url": msg.media_url,
        "media_id": str(msg.media_id) if msg.media_id else None,
        "thumbnail_url": msg.thumbnail_url,
        "file_name": msg.file_name,
        "file_size": msg.file_size,
        "mime_type": msg.mime_type,
        "duration": msg.duration,
        "reply_to_id": str(msg.reply_to_id) if msg.reply_to_id else None,
        "is_edited": msg.is_edited,
        "is_deleted": msg.is_deleted,
        "is_unsent": msg.is_unsent,
        "reactions_count": msg.reactions_count,
        "reply_count": msg.reply_count,
        "is_forwarded": msg.is_forwarded,
        "forwarded_from_id": str(msg.forwarded_from_id) if msg.forwarded_from_id else None,
        "metadata_json": msg.metadata_json,
        "created_at": msg.created_at.isoformat() if msg.created_at else None,
        "updated_at": msg.updated_at.isoformat() if msg.updated_at else None,
    }


async def messaging_websocket(websocket: WebSocket, token: str):
    db: Session = SessionLocal()
    try:
        payload = decode_token(token)
        if not payload or payload.get("type") != "access":
            await websocket.close(code=4001, reason="Invalid token")
            return

        user_id_str = payload.get("sub")
        if not user_id_str:
            await websocket.close(code=4001, reason="Invalid token payload")
            return

        user = db.query(User).filter(User.id == UUID(user_id_str)).first()
        if not user:
            await websocket.close(code=4001, reason="User not found")
            return

        user_id = user_id_str
        await manager.connect(websocket, user_id)

        repo = MessagingRepository(db)
        repo.update_online_status(UUID(user_id), True)

        await manager.broadcast_to_conversation(
            "global",
            list(manager.active_connections.keys()),
            {
                "type": "online_status",
                "user_id": user_id,
                "is_online": True,
            },
            exclude_user=user_id,
        )

        try:
            while True:
                data = await websocket.receive_json()
                msg_type = data.get("type")

                if msg_type == "message":
                    conversation_id = data.get("conversation_id")
                    if not conversation_id:
                        await websocket.send_json({"type": "error", "message": "conversation_id required"})
                        continue

                    conv_id = UUID(conversation_id)
                    if not repo.is_member(conv_id, UUID(user_id)):
                        await websocket.send_json({"type": "error", "message": "Not a member"})
                        continue

                    msg = repo.create_message(
                        conversation_id=conv_id,
                        sender_id=UUID(user_id),
                        content=data.get("content"),
                        message_type=data.get("message_type", "text"),
                        media_url=data.get("media_url"),
                        thumbnail_url=data.get("thumbnail_url"),
                        file_name=data.get("file_name"),
                        file_size=data.get("file_size"),
                        mime_type=data.get("mime_type"),
                        duration=data.get("duration"),
                        reply_to_id=UUID(data["reply_to_id"]) if data.get("reply_to_id") else None,
                    )

                    db.refresh(msg)
                    member_ids = [str(mid) for mid in repo.get_conversation_member_ids(conv_id)]
                    serialized = _serialize_message(msg)

                    sender = db.query(User).filter(User.id == UUID(user_id)).first()
                    serialized["sender_name"] = sender.full_name if sender else None
                    serialized["sender_avatar"] = sender.avatar_url if sender else None

                    for mid in member_ids:
                        await manager.send_to_user(mid, {
                            "type": "new_message",
                            "conversation_id": conversation_id,
                            "message": serialized,
                        })

                elif msg_type == "typing":
                    conversation_id = data.get("conversation_id")
                    is_typing = data.get("is_typing", True)
                    if conversation_id:
                        conv_id = UUID(conversation_id)
                        if repo.is_member(conv_id, UUID(user_id)):
                            repo.set_typing(conv_id, UUID(user_id), is_typing)
                            member_ids = [str(mid) for mid in repo.get_conversation_member_ids(conv_id)]
                            sender = db.query(User).filter(User.id == UUID(user_id)).first()
                            for mid in member_ids:
                                if mid != user_id:
                                    await manager.send_to_user(mid, {
                                        "type": "typing",
                                        "conversation_id": conversation_id,
                                        "user_id": user_id,
                                        "username": sender.username if sender else None,
                                        "is_typing": is_typing,
                                    })

                elif msg_type == "mark_read":
                    message_id = data.get("message_id")
                    if message_id:
                        msg_obj = repo.get_message_by_id(UUID(message_id))
                        if msg_obj:
                            repo.mark_as_read(UUID(message_id), UUID(user_id))
                            member_ids = [str(mid) for mid in repo.get_conversation_member_ids(msg_obj.conversation_id)]
                            for mid in member_ids:
                                if mid != user_id:
                                    await manager.send_to_user(mid, {
                                        "type": "message_read",
                                        "message_id": message_id,
                                        "user_id": user_id,
                                        "conversation_id": str(msg_obj.conversation_id),
                                    })

                elif msg_type == "reaction":
                    message_id = data.get("message_id")
                    emoji = data.get("emoji")
                    if message_id and emoji:
                        reaction = repo.add_reaction(UUID(message_id), UUID(user_id), emoji)
                        msg_obj = repo.get_message_by_id(UUID(message_id))
                        if msg_obj:
                            member_ids = [str(mid) for mid in repo.get_conversation_member_ids(msg_obj.conversation_id)]
                            for mid in member_ids:
                                await manager.send_to_user(mid, {
                                    "type": "reaction",
                                    "message_id": message_id,
                                    "user_id": user_id,
                                    "emoji": emoji,
                                    "conversation_id": str(msg_obj.conversation_id),
                                })

                elif msg_type == "remove_reaction":
                    message_id = data.get("message_id")
                    if message_id:
                        repo.remove_reaction(UUID(message_id), UUID(user_id))
                        msg_obj = repo.get_message_by_id(UUID(message_id))
                        if msg_obj:
                            member_ids = [str(mid) for mid in repo.get_conversation_member_ids(msg_obj.conversation_id)]
                            for mid in member_ids:
                                await manager.send_to_user(mid, {
                                    "type": "remove_reaction",
                                    "message_id": message_id,
                                    "user_id": user_id,
                                    "conversation_id": str(msg_obj.conversation_id),
                                })

                elif msg_type == "delete_message":
                    message_id = data.get("message_id")
                    if message_id:
                        msg_obj = repo.get_message_by_id(UUID(message_id))
                        if msg_obj and msg_obj.sender_id == UUID(user_id):
                            repo.delete_message(UUID(message_id))
                            member_ids = [str(mid) for mid in repo.get_conversation_member_ids(msg_obj.conversation_id)]
                            for mid in member_ids:
                                await manager.send_to_user(mid, {
                                    "type": "message_deleted",
                                    "message_id": message_id,
                                    "conversation_id": str(msg_obj.conversation_id),
                                })

                elif msg_type == "unsend_message":
                    message_id = data.get("message_id")
                    if message_id:
                        msg_obj = repo.get_message_by_id(UUID(message_id))
                        if msg_obj and msg_obj.sender_id == UUID(user_id):
                            repo.unsend_message(UUID(message_id))
                            member_ids = [str(mid) for mid in repo.get_conversation_member_ids(msg_obj.conversation_id)]
                            for mid in member_ids:
                                await manager.send_to_user(mid, {
                                    "type": "message_unsent",
                                    "message_id": message_id,
                                    "conversation_id": str(msg_obj.conversation_id),
                                })

                elif msg_type == "edit_message":
                    message_id = data.get("message_id")
                    new_content = data.get("content")
                    if message_id and new_content is not None:
                        msg_obj = repo.get_message_by_id(UUID(message_id))
                        if msg_obj and msg_obj.sender_id == UUID(user_id):
                            msg_obj = repo.update_message(
                                UUID(message_id),
                                content=new_content,
                                is_edited=True,
                            )
                            if msg_obj:
                                member_ids = [str(mid) for mid in repo.get_conversation_member_ids(msg_obj.conversation_id)]
                                serialized = _serialize_message(msg_obj)
                                sender = db.query(User).filter(User.id == UUID(user_id)).first()
                                serialized["sender_name"] = sender.full_name if sender else None
                                serialized["sender_avatar"] = sender.avatar_url if sender else None
                                for mid in member_ids:
                                    await manager.send_to_user(mid, {
                                        "type": "message_updated",
                                        "conversation_id": str(msg_obj.conversation_id),
                                        "message": serialized,
                                    })

                elif msg_type == "online_status":
                    is_online = data.get("is_online", True)
                    status_text = data.get("status_text")
                    repo.update_online_status(UUID(user_id), is_online, status_text)

        except WebSocketDisconnect:
            pass
        except Exception as e:
            print(f"WebSocket error: {e}")
        finally:
            manager.disconnect(websocket, user_id)
            repo.update_online_status(UUID(user_id), False)
            await manager.broadcast_to_conversation(
                "global",
                list(manager.active_connections.keys()),
                {
                    "type": "online_status",
                    "user_id": user_id,
                    "is_online": False,
                },
                exclude_user=user_id,
            )
            db.close()

    except Exception as e:
        print(f"WebSocket auth error: {e}")
        try:
            await websocket.close(code=4001, reason="Authentication failed")
        except Exception:
            pass
        finally:
            db.close()
