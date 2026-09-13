from fastapi import APIRouter, HTTPException
from routes.schemes import AdminLogin

from auth import (
    get_admin_by_username,
    verify_password
)

router = APIRouter(
    prefix="/api/admin",
    tags=["auth"]
)


@router.post("/login")
def login(
    data: AdminLogin
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


    return {
        "message": "Login successful",
        "admin": {
            "id": admin["id"],
            "username": admin["username"]
        }
    }