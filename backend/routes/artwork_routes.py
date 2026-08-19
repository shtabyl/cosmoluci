from fastapi import APIRouter
from artworks import get_artworks, get_artwork

router = APIRouter(prefix="/api/artworks", tags=["artworks"])

@router.get("/")
def list_artworks():
    return get_artworks()

@router.get("/{artwork_id}")
def retrieve_artwork(artwork_id: int):
    return get_artwork(artwork_id)