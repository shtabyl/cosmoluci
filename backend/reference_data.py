from fastapi import HTTPException
from database import get_connection
from psycopg.errors import UniqueViolation

REFERENCE_TABLES = {
    "mediums": "mediums",
    "surfaces": "surfaces",
    "statuses": "statuses",
    "genres": "genres"
}
    

def get_reference_table(reference_type: str) -> str:

    table = REFERENCE_TABLES.get(reference_type)

    if table is None:
        raise HTTPException(
            status_code=404,
            detail="Reference type not found"
        )

    return table


def get_reference_items(
    reference_type: str
) -> list[dict]:

    table = get_reference_table(reference_type)

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


def create_reference_item(
    reference_type: str,
    name: str
) -> dict:

    table = get_reference_table(reference_type)

    name = name.strip()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Name cannot be empty"
        )

    with get_connection() as conn:
        with conn.cursor() as cur:

            cur.execute(
                f"""
                INSERT INTO {table} (name)
                VALUES (%s)
                RETURNING id, name;
                """,
                (name,)
            )

            row = cur.fetchone()

        conn.commit()

    return {
        "id": row[0],
        "name": row[1]
    }


def update_reference_item(
    reference_type: str,
    item_id: int,
    name: str
) -> dict:

    table = get_reference_table(reference_type)

    name = name.strip()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Name cannot be empty"
        )

    try:

        with get_connection() as conn:
            with conn.cursor() as cur:

                cur.execute(
                    f"""
                    UPDATE {table}
                    SET name = %s
                    WHERE id = %s
                    RETURNING id, name;
                    """,
                    (
                        name,
                        item_id
                    )
                )

                row = cur.fetchone()

            conn.commit()

    except UniqueViolation:

        raise HTTPException(
            status_code=409,
            detail="Item with this name already exists"
        )

    if row is None:
        raise HTTPException(
            status_code=404,
            detail="Reference item not found"
        )

    return {
        "id": row[0],
        "name": row[1]
    }


def get_years():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT DISTINCT creation_year
                FROM paintings
                WHERE is_published
                ORDER BY creation_year DESC;
                """
            )
            rows = cur.fetchall()
            print(rows)
    return [row[0] for row in rows]