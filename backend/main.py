from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import get_connection

app = FastAPI()

app.mount("/images", StaticFiles(directory="../storage"), name="images")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


def get_artwork_images(painting_id):
    query = """
        SELECT
            pi.id,
            pi.image_type,
            pi.is_main,
            pi.alt_text,
            pi.sort_order,
            iv.id AS variant_id,
            iv.width,
            iv.height,
            iv.format,
            iv.file_path

        FROM painting_images pi

        JOIN image_variants iv
            ON iv.image_id = pi.id

        WHERE pi.painting_id = %s

        ORDER BY
            pi.sort_order,
            iv.width DESC;
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (painting_id,))
            rows = cur.fetchall()

    images = {}

    for row in rows:
        image_id = row[0]

        if image_id not in images:
            images[image_id] = {
                "id": image_id,
                "type": row[1],
                "is_main": row[2],
                "alt": row[3],
                "sort_order": row[4],
                "variants": []
            }

        images[image_id]["variants"].append({
            "id": row[5],
            "width": row[6],
            "height": row[7],
            "format": row[8],
            "file_path": row[9]
        })

    return list(images.values())


# Gallery page
@app.get("/api/artworks")
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

    WHERE p.is_published = TRUE

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


# Picture page
@app.get("/api/artworks/{artwork_id}")
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


