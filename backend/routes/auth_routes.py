from fastapi import APIRouter, HTTPException, Request, Response, status, Depends, Header
from routes.schemes import AdminLogin
from typing import Optional
import os

from auth import (
    get_admin_by_username,
    verify_password,
    create_session,
    get_session_by_token,
    is_session_expired,
    delete_session,
    verify_csrf_token
)

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

SECURE_COOKIES = ENVIRONMENT == "production"

router = APIRouter(
    prefix="/api/admin",
    tags=["auth"]
)


@router.post("/login")
def login(
    data: AdminLogin,
    response: Response
):

    admin = get_admin_by_username(
        data.username
    )


    if admin is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )


    password_is_valid = verify_password(
        data.password,
        admin["password_hash"]
    )


    if not password_is_valid:

        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )


    session = create_session(admin["id"])

    session_token = session["session_token"]
    csrf_token = session["csrf_token"]


    response.set_cookie(
        key="admin_session",
        value=session_token,
        httponly=True,
        secure=SECURE_COOKIES,
        samesite="lax",
        max_age=60 * 60 * 24 * 7
    )


    return {
        "message": "Login successful",
        "admin": {
            "id": admin["id"],
            "username": admin["username"]
        },
        "csrf_token": csrf_token
    }


def get_current_admin(
    request: Request
):

    session_token = request.cookies.get(
        "admin_session"
    )


    # =========================
    # COOKIE НЕ НАЙДЕНА
    # =========================

    if not session_token:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )


    # =========================
    # ИЩЕМ SESSION
    # =========================

    session = get_session_by_token(
        session_token
    )


    if session is None:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session"
        )


    # =========================
    # ПРОВЕРЯЕМ СРОК
    # =========================

    if is_session_expired(
        session["expires_at"]
    ):
        delete_session(
            session["session_id"]
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired"
        )


    return {
        "id": session["admin_id"],
        "username": session["username"],
        "csrf_token": session["csrf_token"]
    }

@router.get("/auth/me")
def admin_auth_me(
    current_admin: dict = Depends(get_current_admin)
):

    return {
        "id": current_admin["id"],
        "username": current_admin["username"],
        "csrf_token": current_admin["csrf_token"]
    }


@router.post("/logout")
def admin_logout(request: Request, response: Response):
    session_token = request.cookies.get("admin_session")

    if session_token:
        session = get_session_by_token(session_token)

        if session:
            delete_session(session["session_id"])

    response.delete_cookie(
        key="admin_session",
        httponly=True,
        secure=False,
        samesite="lax"
    )

    return {"message": "Logout successful"}


def require_csrf(
    request: Request,
    x_csrf_token: Optional[str] = Header(default=None)
):
    session_token = request.cookies.get("admin_session")

    if not session_token:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )

    session = get_session_by_token(session_token)

    if session is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid session"
        )

    if is_session_expired(session["expires_at"]):
        delete_session(session["session_id"])

        raise HTTPException(
            status_code=401,
            detail="Session expired"
        )

    if not verify_csrf_token(
        session,
        x_csrf_token
    ):
        raise HTTPException(
            status_code=403,
            detail="Invalid CSRF token"
        )

    return {
        "id": session["admin_id"],
        "username": session["username"]
    }