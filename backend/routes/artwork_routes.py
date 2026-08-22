from fastapi import APIRouter, HTTPException
from artworks import get_artworks, get_artwork, create_artwork, update_artwork
from pydantic import BaseModel, Field
from typing import List, Optional

router = APIRouter(prefix="/api", tags=["artworks"])

class ArtworkCreate(BaseModel):
    title: str
    slug: str
    creation_year: int
    description: Optional[str] = None

    height_cm: float
    width_cm: float

    medium_id: int
    surface_id: int
    status_id: int

    owner_id: Optional[int] = None
    price: Optional[float] = None
    currency: Optional[str] = None

    catalog_number: Optional[str] = None

    genre_ids: List[int] = Field(default_factory=list, description="Список ID жанров")

    is_copy: bool = False
    is_published: bool = False

class ArtworkUpdate(BaseModel):
    title: str
    slug: str
    creation_year: int
    description: Optional[str] = None

    height_cm: float
    width_cm: float

    medium_id: int
    surface_id: int
    status_id: int

    owner_id: Optional[int] = None
    price: Optional[float] = None
    currency: Optional[str] = None

    catalog_number: Optional[str] = None

    genre_ids: List[int] = Field(default_factory=list, description="Список ID жанров")

    is_copy: bool = False
    is_published: bool = False



@router.get("/artworks")
def list_artworks():
    return get_artworks()

@router.get("/artworks/{artwork_id}")
def retrieve_artwork(artwork_id: int):
    return get_artwork(artwork_id)

@router.post("/admin/artworks")
def create_artwork_endpoint(data: ArtworkCreate):
    artwork_id = create_artwork(data)

    return {
        "id": artwork_id,
        "is_published": False
    }


@router.put("/admin/artworks/{artwork_id}")
def update_artwork_endpoint(artwork_id: int, data: ArtworkUpdate):
    updated_id = update_artwork(artwork_id, data)

    if updated_id is None:
        raise HTTPException(status_code=404, detail="Artwork not found")

    return {
        "id": updated_id
    }