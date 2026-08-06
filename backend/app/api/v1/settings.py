from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.base import get_db
from app.repositories.admin_repository import AdminRepository

router = APIRouter()


@router.get("/settings", response_model=dict[str, str])
def get_public_settings(db: Session = Depends(get_db)):
    """Public appearance settings consumed by the client app (category "appearance")."""
    repository = AdminRepository(db)
    settings = repository.get_system_settings(category="appearance")
    return {s.key: s.value for s in settings}
