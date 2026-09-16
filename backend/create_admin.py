from auth import hash_password
from database import get_connection


username = input("Username: ")

password = input("Password: ")


hashed_password = hash_password(password)


with get_connection() as conn:

    with conn.cursor() as cur:

        cur.execute(
            """
            INSERT INTO admin_users (
                username,
                password_hash
            )
            VALUES (%s, %s)
            RETURNING id;
            """,
            (
                username,
                hashed_password
            )
        )

        admin_id = cur.fetchone()[0]

        conn.commit()
