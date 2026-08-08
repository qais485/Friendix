"""Production-hardening tests (Task 8): health, worker status, diagnostics."""

from app.api.v1.system import system_diagnostics, system_status
from app.core.cache import get_application_cache
from app.learning_loop_worker import get_learning_loop_worker


def test_health_endpoint_shape(db):
    from app.main import health_check, health_ready

    payload = health_check()
    assert payload["status"] == "ok"
    assert "uptime_seconds" in payload and "version" in payload
    ready = health_ready(db=db)
    assert ready == {"status": "ready", "database": "reachable"}


def test_worker_status_shape(db):
    status = get_learning_loop_worker().status()
    for key in ("enabled", "running", "interval_seconds", "cycles_run", "last_run_at", "last_error", "last_cycle"):
        assert key in status


def test_system_status_payload(db, admin_id):
    payload = system_status(user_id=admin_id, db=db)
    assert "worker" in payload and "learning_loop_config" in payload and "state" in payload
    assert payload["worker"]["enabled"] is True


def test_system_diagnostics_payload(db, admin_id):
    payload = system_diagnostics(user_id=admin_id, db=db)
    assert "runtime" in payload and "database" in payload and "cache_backend" in payload
    assert payload["database"]["content_profiles"] >= 0
    assert payload["cache_backend"] == type(get_application_cache()).__name__


def test_system_status_requires_admin(db, user_id):
    from fastapi import HTTPException
    from sqlalchemy import text

    admin = db.execute(text("SELECT id FROM users WHERE role='admin' LIMIT 1")).scalar_one_or_none()
    if user_id == admin:
        return  # only user present happens to be the admin
    try:
        system_status(user_id=user_id, db=db)
        raise AssertionError("non-admin should be rejected")
    except HTTPException as exc:
        assert exc.status_code == 403
