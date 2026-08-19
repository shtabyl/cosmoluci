from fastapi import HTTPException
from database import get_connection
from images import get_artwork_images

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