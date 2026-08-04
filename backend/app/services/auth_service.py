import secrets
import re
from uuid import UUID
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import httpx
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.core.config import get_settings
from app.repositories import (
    UserRepository,
    SessionRepository,
    DeviceRepository,
    LoginHistoryRepository,
)
from app.schemas import GoogleOAuthRequest, TokenResponse, UserResponse

settings = get_settings()

GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"


def _parse_user_agent(user_agent: str) -> dict:
    result = {"browser": "Unknown", "os": "Unknown", "device_type": "desktop"}
    if not user_agent:
        return result

    ua = user_agent.lower()

    if "mobile" in ua or "android" in ua or "iphone" in ua:
        result["device_type"] = "mobile"
    elif "tablet" in ua or "ipad" in ua:
        result["device_type"] = "tablet"

    if "edg/" in ua:
        result["browser"] = "Edge"
    elif "opr/" in ua or "opera" in ua:
        result["browser"] = "Opera"
    elif "chrome" in ua and "safari" in ua:
        result["browser"] = "Chrome"
    elif "firefox" in ua:
        result["browser"] = "Firefox"
    elif "safari" in ua:
        result["browser"] = "Safari"
    elif "msie" in ua or "trident" in ua:
        result["browser"] = "IE"

    if "windows" in ua:
        result["os"] = "Windows"
    elif "mac os" in ua or "macintosh" in ua:
        result["os"] = "macOS"
    elif "linux" in ua and "android" not in ua:
        result["os"] = "Linux"
    elif "android" in ua:
        result["os"] = "Android"
    elif "iphone" in ua or "ipad" in ua:
        result["os"] = "iOS"

    return result


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.session_repo = SessionRepository(db)
        self.device_repo = DeviceRepository(db)
        self.login_history_repo = LoginHistoryRepository(db)

    def google_login(self, data: GoogleOAuthRequest, ip_address: str = None, user_agent: str = None) -> TokenResponse:
        google_user = self._verify_google_token(data.credential)
        if not google_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google token",
            )

        google_id = google_user.get("id")
        email = google_user.get("email")
        full_name = google_user.get("name")
        avatar_url = google_user.get("picture")

        if not google_id or not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not retrieve user information from Google",
            )

        user = self.user_repo.get_by_google_id(google_id)

        if not user:
            user = self.user_repo.get_by_email(email)
            if user:
                if user.is_deactivated:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Account is deactivated",
                    )
                user = self.user_repo.update(user, google_id=google_id, avatar_url=avatar_url)
            else:
                user = self.user_repo.create(
                    google_id=google_id,
                    email=email,
                    full_name=full_name,
                    avatar_url=avatar_url,
                    is_active=True,
                )
                from app.models import PrivacySetting
                privacy = PrivacySetting(user_id=user.id)
                self.db.add(privacy)
                self.db.commit()

        if user.is_deactivated:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated",
            )

        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})

        expires_at = datetime.now(timezone.utc) + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
        self.session_repo.create(
            user_id=user.id,
            access_token=access_token,
            refresh_token=refresh_token,
            expires_at=expires_at,
            ip_address=ip_address,
            device_info=user_agent,
        )

        self.login_history_repo.create(
            user_id=user.id,
            ip_address=ip_address,
            user_agent=user_agent,
            is_successful=True,
        )

        if user_agent:
            ua_info = _parse_user_agent(user_agent)
            self.device_repo.update_or_create(
                user_id=user.id,
                device_name=ua_info["browser"],
                device_type=ua_info["device_type"],
                browser=ua_info["browser"],
                os=ua_info["os"],
                ip_address=ip_address,
            )

        return TokenResponse(access_token=access_token, refresh_token=refresh_token)

    def refresh_token(self, refresh_token: str) -> TokenResponse:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        session = self.session_repo.get_by_token(refresh_token)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token not found or revoked",
            )

        self.session_repo.deactivate(session)

        access_token = create_access_token(data={"sub": payload["sub"]})
        new_refresh_token = create_refresh_token(data={"sub": payload["sub"]})

        expires_at = datetime.now(timezone.utc) + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
        self.session_repo.create(
            user_id=UUID(payload["sub"]),
            access_token=access_token,
            refresh_token=new_refresh_token,
            expires_at=expires_at,
        )

        return TokenResponse(access_token=access_token, refresh_token=new_refresh_token)

    def logout(self, refresh_token: str) -> None:
        session = self.session_repo.get_by_token(refresh_token)
        if session:
            self.session_repo.deactivate(session)

    def logout_all(self, user_id: UUID) -> None:
        self.session_repo.deactivate_all_for_user(user_id)

    def get_devices(self, user_id: UUID) -> list:
        return self.device_repo.get_all_for_user(user_id)

    def revoke_device(self, user_id: UUID, device_id: UUID) -> None:
        devices = self.device_repo.get_all_for_user(user_id)
        device = next((d for d in devices if d.id == device_id), None)
        if device:
            self.device_repo.deactivate(device_id)

    def get_login_history(self, user_id: UUID, limit: int = 50) -> list:
        return self.login_history_repo.get_all_for_user(user_id, limit)

    def delete_account(self, user_id: UUID) -> None:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        self.user_repo.delete(user)

    def get_current_user(self, user_id: UUID) -> UserResponse:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return UserResponse.model_validate(user)

    def _verify_google_token(self, credential: str) -> dict | None:
        try:
            response = httpx.get(
                GOOGLE_TOKEN_INFO_URL,
                params={"id_token": credential},
                timeout=10.0,
            )
            if response.status_code == 200:
                payload = response.json()
                return {
                    "id": payload.get("sub"),
                    "email": payload.get("email"),
                    "name": payload.get("name"),
                    "picture": payload.get("picture"),
                }
            return None
        except Exception:
            return None
