from database import get_connection
from fastapi import HTTPException
from psycopg.errors import UniqueViolation


def get_owners() -> list[dict]:

    with get_connection() as conn:
        with conn.cursor() as cur:

            cur.execute(
                """
                SELECT
                    id,
                    country,
                    owner_type
                FROM owners
                ORDER BY country, owner_type;
                """
            )

            rows = cur.fetchall()

    return [
        {
            "id": row[0],
            "country": row[1],
            "owner_type": row[2]
        }
        for row in rows
    ]


def create_owner(
    country: str,
    owner_type: str
) -> dict:

    country = country.strip()
    owner_type = owner_type.strip()

    if not country:
        raise HTTPException(
            status_code=400,
            detail="Country cannot be empty"
        )

    if not owner_type:
        raise HTTPException(
            status_code=400,
            detail="Owner type cannot be empty"
        )

    with get_connection() as conn:
        with conn.cursor() as cur:

            cur.execute(
                """
                INSERT INTO owners (
                    country,
                    owner_type
                )
                VALUES (%s, %s)
                RETURNING
                    id,
                    country,
                    owner_type;
                """,
                (
                    country,
                    owner_type
                )
            )

            row = cur.fetchone()

        conn.commit()

    return {
        "id": row[0],
        "country": row[1],
        "owner_type": row[2]
    }


def update_owner(
    owner_id: int,
    country: str,
    owner_type: str
) -> dict:

    country = country.strip()
    owner_type = owner_type.strip()

    if not country:
        raise HTTPException(
            status_code=400,
            detail="Country cannot be empty"
        )

    if not owner_type:
        raise HTTPException(
            status_code=400,
            detail="Owner type cannot be empty"
        )

    try:

        with get_connection() as conn:
            with conn.cursor() as cur:

                cur.execute(
                    """
                    UPDATE owners
                    SET
                        country = %s,
                        owner_type = %s
                    WHERE id = %s
                    RETURNING
                        id,
                        country,
                        owner_type;
                    """,
                    (
                        country,
                        owner_type,
                        owner_id
                    )
                )

                row = cur.fetchone()

            conn.commit()

    except UniqueViolation:

        raise HTTPException(
            status_code=409,
            detail="Owner with this country and type already exists"
        )

    if row is None:
        raise HTTPException(
            status_code=404,
            detail="Owner not found"
        )

    return {
        "id": row[0],
        "country": row[1],
        "owner_type": row[2]
    }


def delete_owner(
    owner_id: int
) -> None:

    with get_connection() as conn:
        with conn.cursor() as cur:

            # Проверяем существование владельца

            cur.execute(
                """
                SELECT id
                FROM owners
                WHERE id = %s;
                """,
                (owner_id,)
            )

            owner = cur.fetchone()

            if owner is None:
                raise HTTPException(
                    status_code=404,
                    detail="Owner not found"
                )

            # Проверяем использование владельца

            cur.execute(
                """
                SELECT EXISTS (
                    SELECT 1
                    FROM paintings
                    WHERE owner_id = %s
                );
                """,
                (owner_id,)
            )

            is_used = cur.fetchone()[0]

            if is_used:
                raise HTTPException(
                    status_code=409,
                    detail=(
                        "Owner is used by artworks "
                        "and cannot be deleted"
                    )
                )

            # Удаляем владельца

            cur.execute(
                """
                DELETE FROM owners
                WHERE id = %s;
                """,
                (owner_id,)
            )

        conn.commit()