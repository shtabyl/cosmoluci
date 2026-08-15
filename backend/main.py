from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from data import artworks

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello, API!"}

@app.get("/api/artworks")
def get_artworks():
    return artworks

@app.get("/api/artworks/{artwork_id}")
def get_artwork(artwork_id: int):
    for artwork in artworks:
        if artwork["id"] == artwork_id:
            return artwork
    raise HTTPException(status_code=404, detail="Artwork not found")