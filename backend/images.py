from database import get_connection
from PIL import Image
from io import BytesIO
from fastapi import HTTPException, UploadFile
from pathlib import Path

ALLOWED_FORMATS = { "JPEG", "PNG" }
STORAGE_PATH = Path("/storage/artworks")
WEBP_SIZES = [400, 800, 1200]

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


async def validate_image(image: UploadFile) -> dict:
    contents = await image.read()

    try:
        img = Image.open(BytesIO(contents))
        img.verify()

        # После verify() изображение нужно открыть заново
        img = Image.open(BytesIO(contents))

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid image file"
        )

    if img.format not in ALLOWED_FORMATS:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG and PNG images are supported"
        )

    return {
        "format": img.format,
        "width": img.width,
        "height": img.height,
        "contents": contents
    }

def save_artwork_image(
        contents: bytes,
        artwork_id: int,
        image_type: str,
        file_extension: str
) -> str:
    artwork_path = STORAGE_PATH / str(artwork_id) / "original"
    artwork_path.mkdir(parents=True, exist_ok=True)

    filename = f"{image_type}.{file_extension}"

    file_path = artwork_path / filename

    file_path.write_bytes(contents)

    return str(file_path)


def generate_webp_variants(
        contents: bytes,
        artwork_id: int,
        image_type: str
) -> list[dict]:

    # image_name = Path(image_name).stem

    output_dir = (
        STORAGE_PATH
        / str(artwork_id)
        / "web"
        / image_type
    )

    output_dir.mkdir(parents=True, exist_ok=True)

    img = Image.open(BytesIO(contents))

    variants = []

    for size in WEBP_SIZES:

        variant = img.copy()

        # Не увеличиваем маленькое изображение
        if variant.width > size:
            variant.thumbnail((size, size))

        output_path = output_dir / f"{size}.webp"

        variant.save(
            output_path,
            "WEBP",
            quality=85,
            method=6
        )

        variants.append({
            "width": variant.width,
            "height": variant.height,
            "format": "webp",
            "file_path": str(output_path),
            "file_size": output_path.stat().st_size
        })

    return variants


def save_image_metadata(
    artwork_id: int,
    image_type: str,
    variants: list[dict],
    original_path: str
) -> int:

    is_main = image_type == "main"

    with get_connection() as conn:
        with conn.cursor() as cur:

            # Создаём painting_images
            cur.execute(
                """
                INSERT INTO painting_images (
                    painting_id,
                    image_type,
                    is_main
                )
                VALUES (%s, %s, %s)
                RETURNING id;
                """,
                (
                    artwork_id,
                    image_type,
                    is_main
                )
            )

            image_id = cur.fetchone()[0]

            # Создаём image_variants
            for variant in variants:

                cur.execute(
                    """
                    INSERT INTO image_variants (
                        image_id,
                        width,
                        height,
                        format,
                        file_path,
                        file_size
                    )
                    VALUES (%s, %s, %s, %s, %s, %s);
                    """,
                    (
                        image_id,
                        variant["width"],
                        variant["height"],
                        variant["format"],
                        variant["file_path"],
                        variant["file_size"]
                    )
                )

        conn.commit()

    return image_id


def to_url_path(file_path: str) -> str:
    path = Path(file_path)

    relative = path.relative_to(STORAGE_PATH)

    return "/images/" + relative.as_posix()