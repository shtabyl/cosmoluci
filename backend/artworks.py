from fastapi import HTTPException
from database import get_connection
from images import get_artwork_images
from pathlib import Path

STORAGE_PATH = Path("../storage/artworks")

def get_artwork(artwork_id: int):
    query = """
        SELECT
            p.id,
            p.title,
            p.creation_year,
            p.description,
            p.height_cm,
            p.width_cm,
            p.is_copy,
            p.is_published,
            m.name AS medium,
            s.name AS surface,
            st.name AS status
        FROM paintings p
        LEFT JOIN mediums m
            ON p.medium_id = m.id
        LEFT JOIN surfaces s
            ON p.surface_id = s.id
        JOIN statuses st
            ON p.status_id = st.id
        WHERE p.id = %s
            AND p.is_published = TRUE;
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (artwork_id,))
            row = cur.fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail="Artwork not found")

    images = get_artwork_images(artwork_id)
    genres = get_artwork_genres(artwork_id)

    return {
        "id": row[0],
        "title": row[1],
        "creation_year": row[2],
        "description": row[3],
        "height_cm": float(row[4]) if row[4] is not None else None,
        "width_cm": float(row[5]) if row[5] is not None else None,
        "is_copy": row[6],
        "is_published": row[7],
        "medium": row[8],
        "surface": row[9],
        "status": row[10],
        "genres": genres,
        "images": images
    }



def get_artwork_genres(painting_id):
    query = """
        SELECT
            g.name
        FROM genres g
        JOIN painting_genres pg
            ON pg.genre_id = g.id
        WHERE pg.painting_id = %s
        ORDER BY g.name;
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (painting_id,))
            rows = cur.fetchall()
    return [row[0] for row in rows]


def get_artworks():
    query = """
        SELECT
    p.id,
    p.title,
    p.creation_year,
    p.description,
    p.height_cm,
    p.width_cm,
    p.is_copy,
    p.is_published,

    m.name AS medium,
    s.name AS surface,
    st.name AS status,

    COALESCE(
        ARRAY_AGG(DISTINCT g.name ORDER BY g.name)
        FILTER (WHERE g.name IS NOT NULL),
        '{}'
    ) AS genres

    FROM paintings p

    LEFT JOIN mediums m
        ON p.medium_id = m.id

    LEFT JOIN surfaces s
        ON p.surface_id = s.id

    JOIN statuses st
        ON p.status_id = st.id

    LEFT JOIN painting_genres pg
        ON pg.painting_id = p.id

    LEFT JOIN genres g
        ON g.id = pg.genre_id

    LEFT JOIN painting_images pi
        ON pi.painting_id = p.id

    WHERE p.is_published = TRUE AND pi.is_main = TRUE

    GROUP BY
        p.id,
        p.title,
        p.creation_year,
        p.description,
        p.height_cm,
        p.width_cm,
        p.is_copy,
        p.is_published,
        m.name,
        s.name,
        st.name

    ORDER BY
        p.creation_year DESC,
        p.id DESC;
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query)
            rows = cur.fetchall()

    return [
        {
            "id": row[0],
            "title": row[1],
            "creation_year": row[2],
            "description": row[3],
            "height_cm": float(row[4]) if row[4] is not None else None,
            "width_cm": float(row[5]) if row[5] is not None else None,
            "is_copy": row[6],
            "is_published": row[7],
            "medium": row[8],
            "surface": row[9],
            "status": row[10],
            "genres": row[11],
            "images": get_artwork_images(row[0])
        }
        for row in rows
    ]


def create_artwork(data):
    query_painting = """
        INSERT INTO paintings (
            title,
            slug,
            creation_year,
            description,
            height_cm,
            width_cm,
            medium_id,
            surface_id,
            status_id,
            owner_id,
            price,
            currency,
            catalog_number,
            is_copy,
            is_published
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, FALSE)
        RETURNING id;
    """

    query_genres = """
        INSERT INTO painting_genres (painting_id, genre_id)
        VALUES (%s, %s);
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query_painting, (
                data.title,
                data.slug,
                data.creation_year,
                data.description,
                data.height_cm,
                data.width_cm,
                data.medium_id,
                data.surface_id,
                data.status_id,
                data.owner_id,
                data.price,
                data.currency,
                data.catalog_number,
                data.is_copy
            ))
            artwork_id = cur.fetchone()[0]

            if hasattr(data, 'genre_ids') and data.genre_ids:
                genre_data = [(artwork_id, genre_id) for genre_id in data.genre_ids]
                cur.executemany(query_genres, genre_data)

            conn.commit()

    artwork_path = STORAGE_PATH / str(artwork_id)

    (artwork_path / "original").mkdir(parents=True, exist_ok=True)
    (artwork_path / "web").mkdir(parents=True, exist_ok=True)

    return artwork_id


def update_artwork(artwork_id: int, data):
    query_painting = """
        UPDATE paintings
        SET
            title = %s,
            slug = %s,
            creation_year = %s,
            description = %s,
            height_cm = %s,
            width_cm = %s,
            medium_id = %s,
            surface_id = %s,
            status_id = %s,
            owner_id = %s,
            price = %s,
            currency = %s,
            catalog_number = %s,
            is_copy = %s,
            is_published = %s
        WHERE id = %s
        RETURNING id;
    """

    query_delete_genres = "DELETE FROM painting_genres WHERE painting_id = %s;"
    query_insert_genre = "INSERT INTO painting_genres (painting_id, genre_id) VALUES (%s, %s);"

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                query_painting,
                (
                    data.title,
                    data.slug,
                    data.creation_year,
                    data.description,
                    data.height_cm,
                    data.width_cm,
                    data.medium_id,
                    data.surface_id,
                    data.status_id,
                    data.owner_id,
                    data.price,
                    data.currency,
                    data.catalog_number,
                    data.is_copy,
                    data.is_published,
                    artwork_id,
                )
            )

            result = cur.fetchone()

            if not result:
                return None

            # Шаг 2: Удаляем старые привязки жанров
            cur.execute(query_delete_genres, (artwork_id,))

            # Шаг 3: Записываем новые жанры (если они переданы в data.genre_ids)
            if hasattr(data, 'genre_ids') and data.genre_ids:
                genre_data = [(artwork_id, genre_id) for genre_id in data.genre_ids]
                cur.executemany(query_insert_genre, genre_data)

        conn.commit()

    return result[0]