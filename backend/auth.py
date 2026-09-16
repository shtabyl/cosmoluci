from fastapi import HTTPException, Request
from pwdlib import PasswordHash
from database import get_connection
from typing import Optional
from datetime import datetime, timedelta
import secrets
import hashlib


SESSION_DURATION_DAYS = 7

password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:

    return password_hash.hash(password)


def verify_password(
    password: str,
    hashed_password: str
) -> bool:

    return password_hash.verify(
        password,
        hashed_password
    )


def get_admin_by_username(
    username: str
) -> Optional[dict]:

    with get_connection() as conn:
        with conn.cursor() as cur:

            cur.execute(
                """
                SELECT
                    id,
                    username,
                    password_hash
                FROM admin_users
                WHERE username = %s;
                """,
                (username,)
            )

            row = cur.fetchone()


    if row is None:
        return None


    return {
        "id": row[0],
        "username": row[1],
        "password_hash": row[2]
    }


def generate_session_token() -> str:

    return secrets.token_urlsafe(32)


def generate_csrf_token() -> str:
    return secrets.token_urlsafe(32)


def create_session(admin_id: int) -> dict:
    session_token = generate_session_token()
    session_token_hash = hash_session_token(session_token)

    csrf_token = generate_csrf_token()

    expires_at = datetime.now() + timedelta(days=SESSION_DURATION_DAYS)

    conn = get_connection()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO admin_sessions (
                    admin_id,
                    session_token_hash,
                    csrf_token,
                    expires_at
                )
                VALUES (%s, %s, %s, %s)
                """,
                (
                    admin_id,
                    session_token_hash,
                    csrf_token,
                    expires_at
                )
            )

        conn.commit()

    finally:
        conn.close()

    return {
        "session_token": session_token,
        "csrf_token": csrf_token
    }


def hash_session_token(
    session_token: str
) -> str:

    return hashlib.sha256(
        session_token.encode()
    ).hexdigest()


def get_session_by_token(
    session_token: str
) -> Optional[dict]:

    session_token_hash = hash_session_token(
        session_token
    )

    with get_connection() as conn:
        with conn.cursor() as cur:

            cur.execute(
                """
                SELECT
                    admin_sessions.id,
                    admin_sessions.admin_id,
                    admin_sessions.expires_at,
                    admin_users.username,
                    admin_sessions.csrf_token
                FROM admin_sessions
                JOIN admin_users
                    ON admin_users.id = admin_sessions.admin_id
                WHERE admin_sessions.session_token_hash = %s;
                """,
                (session_token_hash,)
            )

            row = cur.fetchone()


    if row is None:
        return None


    return {
        "session_id": row[0],
        "admin_id": row[1],
        "expires_at": row[2],
        "username": row[3],
        "csrf_token": row[4]
    }


def is_session_expired(
    expires_at
) -> bool:

    return expires_at <= datetime.now()


def delete_session(
    session_id: int
) -> None:

    with get_connection() as conn:
        with conn.cursor() as cur:

            cur.execute(
                """
                DELETE FROM admin_sessions
                WHERE id = %s;
                """,
                (session_id,)
            )

        conn.commit()


def verify_csrf_token(
    session: dict,
    csrf_token: str
) -> bool:

    if not csrf_token:
        return False

    token_hash = hash_session_token(csrf_token)

    return secrets.compare_digest(
        token_hash,
        session["csrf_token_hash"]
    )


def verify_csrf_token(
    session: dict,
    csrf_token: str
) -> bool:

    if not csrf_token:
        return False

    return secrets.compare_digest(
        csrf_token,
        session["csrf_token"]
    )