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


def create_session(
    admin_id: int
) -> str:

    session_token = generate_session_token()

    session_token_hash = hash_session_token(
        session_token
    )

    expires_at = (
        datetime.now()
        + timedelta(days=SESSION_DURATION_DAYS)
    )


    with get_connection() as conn:
        with conn.cursor() as cur:

            cur.execute(
                """
                INSERT INTO admin_sessions (
                    admin_id,
                    session_token_hash,
                    expires_at
                )
                VALUES (%s, %s, %s);
                """,
                (
                    admin_id,
                    session_token_hash,
                    expires_at
                )
            )

        conn.commit()


    # Возвращаем RAW TOKEN браузеру.
    # В БД он никогда не сохраняется.
    return session_token


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
                    admin_users.username
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
        "username": row[3]
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