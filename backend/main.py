from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import get_connection

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
            st.name AS status

        FROM paintings p

        LEFT JOIN mediums m
            ON p.medium_id = m.id

        LEFT JOIN surfaces s
            ON p.surface_id = s.id

        JOIN statuses st
            ON p.status_id = st.id

        WHERE p.is_published = TRUE

        ORDER BY p.creation_year DESC, p.id DESC;
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
        }
        for row in rows
    ]

@app.get("/api/artworks/{artwork_id}")
def get_artwork(artwork_id: int):
    for artwork in artworks:
        if artwork["id"] == artwork_id:
            return artwork
    raise HTTPException(status_code=404, detail="Artwork not found")

@app.get("/api/db-test")
def db_test():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1;")
            result = cur.fetchone()

    return {"database": result[0]}
