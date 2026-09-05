from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from artworks import get_admin_artwork, get_admin_artworks, get_artworks, get_artwork, create_artwork, update_artwork_full, get_reference_data, update_artwork_fields
from pydantic import BaseModel, Field
from typing import List, Optional
from database import get_connection
from images import validate_image, save_artwork_image, generate_webp_variants, save_image_metadata, get_image_for_delete, delete_image_files

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

class ArtworkUpdateFull(BaseModel):
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
    title: Optional[str] = None
    creation_year: Optional[int] = None
    description: Optional[str] = None

    height_cm: Optional[float] = None
    width_cm: Optional[float] = None

    medium_id: Optional[int] = None
    surface_id: Optional[int] = None
    status_id: Optional[int] = None

    is_copy: Optional[bool] = None
    is_published: Optional[bool] = None

    owner_id: Optional[int] = None

    genres: Optional[List[int]] = None

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
def update_artwork_endpoint(artwork_id: int, data: ArtworkUpdateFull):
    updated_id = update_artwork_full(artwork_id, data)

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
    artwork = get_admin_artwork(artwork_id)

    if artwork is None:
        raise HTTPException(
            status_code=404,
            detail="Artwork not found"
        )

    image_data = await validate_image(image)

    if image_data["format"] == "JPEG":
        file_extension = "jpeg"
    else:
        file_extension = "png"

    # Сохраняем оригинал
    original_path, image_name = save_artwork_image(
        contents=image_data["contents"],
        artwork_id=artwork_id,
        image_type=image_type,
        file_extension=file_extension
    )

    # Генерируем WebP
    variants = generate_webp_variants(
        contents=image_data["contents"],
        artwork_id=artwork_id,
        image_name=image_name
    )

    # Сохраняем metadata
    image_id = save_image_metadata(
        artwork_id=artwork_id,
        image_type=image_name,
        variants=variants,
        original_path=original_path
    )

    return {
        "artwork_id": artwork_id,
        "image_id": image_id,
        "image_type": image_name,
        "original": {
            "format": image_data["format"],
            "width": image_data["width"],
            "height": image_data["height"],
            "file_path": original_path,
            "file_size": len(image_data["contents"])
        },
        "variants": variants
    }

@router.delete("/admin/images/{image_id}")
def delete_artwork_image(image_id: int):

    image = get_image_for_delete(image_id)

    if image is None:
        raise HTTPException(
            status_code=404,
            detail="Image not found"
        )

    # Нельзя удалить main,
    # если это единственное главное изображение.
    # Пока просто запрещаем.
    if image["image_type"] == "main":

        raise HTTPException(
            status_code=400,
            detail="Main image cannot be deleted"
        )

    delete_image_files(
        painting_id=image["painting_id"],
        image_type=image["image_type"],
        variant_paths=image["files"]
    )

    with get_connection() as conn:
        with conn.cursor() as cur:

            cur.execute(
                """
                DELETE FROM painting_images
                WHERE id = %s;
                """,
                (image_id,)
            )

        conn.commit()

    return {
        "success": True,
        "image_id": image_id
    }


@router.patch("/admin/artworks/{artwork_id}")
def patch_artwork(
    artwork_id: int,
    artwork: ArtworkUpdate
):
    updated_artwork = update_artwork_fields(
        artwork_id,
        artwork.model_dump(exclude_unset=True)
    )

    if updated_artwork is None:
        raise HTTPException(
            status_code=404,
            detail="Artwork not found"
        )

    return updated_artwork