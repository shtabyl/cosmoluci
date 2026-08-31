from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from artworks import get_admin_artwork, get_admin_artworks, get_artworks, get_artwork, create_artwork, update_artwork, get_reference_data
from pydantic import BaseModel, Field
from typing import List, Optional
from images import validate_image, save_artwork_image, generate_webp_variants, save_image_metadata

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


@router.get("/admin/artworks")
def get_admin_artworks_endpoint():
    return get_admin_artworks()


@router.get("/admin/artworks/{artwork_id}")
def get_admin_artwork_endpoint(artwork_id: int):
    artwork = get_admin_artwork(artwork_id)

    if artwork is None:
        raise HTTPException(
            status_code=404,
            detail="Artwork not found"
        )

    return artwork


@router.get("/admin/reference-data")
def get_reference_data_endpoint():
    return get_reference_data()


@router.post("/admin/artworks/{artwork_id}/images")
async def upload_artwork_image(
    artwork_id: int,
    image: UploadFile = File(...),
    image_type: str = Form(...)
):
    # 1. Проверяем существование картины
    artwork = get_admin_artwork(artwork_id)

    if artwork is None:
        raise HTTPException(
            status_code=404,
            detail="Artwork not found"
        )

    # 2. Проверяем изображение
    image_data = await validate_image(image)

    # Определяем расширение оригинала
    if image_data["format"] == "JPEG":
        file_extension = "jpeg"
    else:
        file_extension = "png"

    # 3. Сохраняем оригинал
    original_path = save_artwork_image(
        contents=image_data["contents"],
        artwork_id=artwork_id,
        image_type=image_type,
        file_extension=file_extension
    )

    # 4. Генерируем WebP
    variants = generate_webp_variants(
        contents=image_data["contents"],
        artwork_id=artwork_id,
        image_type=image_type
    )

    # 5. Записываем metadata в PostgreSQL
    image_id = save_image_metadata(
        artwork_id=artwork_id,
        image_type=image_type,
        variants=variants,
        original_path=original_path
    )

    return {
        "artwork_id": artwork_id,
        "image_id": image_id,
        "image_type": image_type,
        "original": {
            "format": image_data["format"],
            "width": image_data["width"],
            "height": image_data["height"],
            "file_path": original_path,
            "file_size": len(image_data["contents"])
        },
        "variants": variants
    }