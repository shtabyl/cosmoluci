from fastapi import APIRouter, HTTPException, Request, Response, status, Depends
from routes.schemes import AdminLogin

from auth import (
    get_admin_by_username,
    verify_password,
    create_session,
    get_session_by_token,
    is_session_expired,
    delete_session
)

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


    session_token = create_session(
        admin["id"]
    )


    response.set_cookie(
        key="admin_session",
        value=session_token,

        httponly=True,

        secure=False,

        samesite="lax",

        max_age=60 * 60 * 24 * 7
    )


    return {
        "message": "Login successful",
        "admin": {
            "id": admin["id"],
            "username": admin["username"]
        }
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
        "username": session["username"]
    }

@router.get("/auth/me")
def get_current_admin_info(
    current_admin: dict = Depends(get_current_admin)
):

    return {
        "id": current_admin["id"],
        "username": current_admin["username"]
    }