from fastapi import HTTPException
from database import get_connection
from psycopg.errors import UniqueViolation

REFERENCE_CONFIG = {
    "mediums": {
        "table": "mediums",
        "usage_table": "paintings",
        "foreign_key": "medium_id"
    },

    "surfaces": {
        "table": "surfaces",
        "usage_table": "paintings",
        "foreign_key": "surface_id"
    },

    "statuses": {
        "table": "statuses",
        "usage_table": "paintings",
        "foreign_key": "status_id"
    },

    "genres": {
        "table": "genres",
        "usage_table": "painting_genres",
        "foreign_key": "genre_id"
    }
}

def get_reference_config(
    reference_type: str
) -> dict:

    config = REFERENCE_CONFIG.get(reference_type)

    if config is None:
        raise HTTPException(
            status_code=404,
            detail="Reference type not found"
        )

    return config


def is_reference_item_used(
    reference_type: str,
    item_id: int
) -> bool:

    config = get_reference_config(reference_type)

    usage_table = config["usage_table"]
    foreign_key = config["foreign_key"]

    with get_connection() as conn:
        with conn.cursor() as cur:

            cur.execute(
                f"""
                SELECT EXISTS (
                    SELECT 1
                    FROM {usage_table}
                    WHERE {foreign_key} = %s
                );
                """,
                (item_id,)
            )

            return cur.fetchone()[0]


def delete_reference_item(
    reference_type: str,
    item_id: int
) -> None:

    config = get_reference_config(reference_type)

    table = config["table"]
    usage_table = config["usage_table"]
    foreign_key = config["foreign_key"]

    with get_connection() as conn:
        with conn.cursor() as cur:

            # Проверяем существование

            cur.execute(
                f"""
                SELECT id
                FROM {table}
                WHERE id = %s;
                """,
                (item_id,)
            )

            item = cur.fetchone()

            if item is None:

                raise HTTPException(
                    status_code=404,
                    detail="Reference item not found"
                )

            # Проверяем использование

            cur.execute(
                f"""
                SELECT EXISTS (
                    SELECT 1
                    FROM {usage_table}
                    WHERE {foreign_key} = %s
                );
                """,
                (item_id,)
            )

            is_used = cur.fetchone()[0]

            if is_used:

                raise HTTPException(
                    status_code=409,
                    detail=(
                        "Reference item is used by artworks "
                        "and cannot be deleted"
                    )
                )

            # Удаляем

            cur.execute(
                f"""
                DELETE FROM {table}
                WHERE id = %s;
                """,
                (item_id,)
            )

        conn.commit()


def get_reference_items(
    reference_type: str
) -> list[dict]:

    config = get_reference_config(reference_type)
    table = config["table"]

    with get_connection() as conn:
        with conn.cursor() as cur:

            cur.execute(
                f"""
                SELECT id, name
                FROM {table}
                ORDER BY name;
                """
            )

            rows = cur.fetchall()

    return [
        {
            "id": row[0],
            "name": row[1]
        }
        for row in rows
    ]