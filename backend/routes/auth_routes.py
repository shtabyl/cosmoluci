from fastapi import APIRouter, HTTPException, Response
from routes.schemes import AdminLogin

from auth import (
    get_admin_by_username,
    verify_password,
    create_session
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