from pwdlib import PasswordHash
from database import get_connection

from typing import Optional


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

