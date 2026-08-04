from uuid import UUID

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user_id
from app.database.base import get_db
from app.schemas import (
    GoogleOAuthRequest,
    UserResponse,
    TokenResponse,
    DeviceResponse,
    LoginHistoryResponse,
    AccountDelete,
)
from app.services.auth_service import AuthService

router = APIRouter()


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    return AuthService(db)


@router.post("/google", response_model=TokenResponse)
def google_login(
    data: GoogleOAuthRequest,
    request: Request,
    service: AuthService = Depends(get_auth_service),
):
    return service.google_login(
        data,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(
    refresh_token: str,
    service: AuthService = Depends(get_auth_service),
):
    return service.refresh_token(refresh_token)


@router.post("/logout")
def logout(
    refresh_token: str,
    service: AuthService = Depends(get_auth_service),
):
    service.logout(refresh_token)
    return {"message": "Logged out successfully"}


@router.post("/logout-all")
def logout_all(
    user_id: UUID = Depends(get_current_user_id),
    service: AuthService = Depends(get_auth_service),
):
    service.logout_all(user_id)
    return {"message": "All sessions revoked"}


@router.get("/devices", response_model=list[DeviceResponse])
def get_devices(
    user_id: UUID = Depends(get_current_user_id),
    service: AuthService = Depends(get_auth_service),
):
    return service.get_devices(user_id)


@router.delete("/devices/{device_id}")
def revoke_device(
    device_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: AuthService = Depends(get_auth_service),
):
    service.revoke_device(user_id, UUID(device_id))
    return {"message": "Device revoked"}


@router.get("/login-history", response_model=list[LoginHistoryResponse])
def get_login_history(
    limit: int = 50,
    user_id: UUID = Depends(get_current_user_id),
    service: AuthService = Depends(get_auth_service),
):
    return service.get_login_history(user_id, limit)


@router.delete("/delete")
def delete_account(
    data: AccountDelete,
    user_id: UUID = Depends(get_current_user_id),
    service: AuthService = Depends(get_auth_service),
):
    service.delete_account(user_id)
    return {"message": "Account deleted"}


@router.get("/me", response_model=UserResponse)
def get_current_user(
    user_id: UUID = Depends(get_current_user_id),
    service: AuthService = Depends(get_auth_service),
):
    return service.get_current_user(user_id)
