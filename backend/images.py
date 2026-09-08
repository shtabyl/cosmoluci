from typing import Optional

from database import get_connection
from PIL import Image
from io import BytesIO
from fastapi import HTTPException, UploadFile
from pathlib import Path

ALLOWED_FORMATS = {"JPEG", "PNG"}
BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE_PATH = BASE_DIR / "storage" / "artworks"
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


def get_next_detail_number(artwork_id: int) -> int:
    original_dir = (
        STORAGE_PATH
        / str(artwork_id)
        / "original"
    )

    original_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    number = 1

    while True:
        jpeg_path = original_dir / f"detail-{number:02d}.jpeg"
        png_path = original_dir / f"detail-{number:02d}.png"

        if not jpeg_path.exists() and not png_path.exists():
            return number

        number += 1


def storage_url(path: Path) -> str:
    relative_path = path.relative_to(BASE_DIR)
    return "/" + relative_path.as_posix()

def storage_path(url_path: str) -> Path:
    return BASE_DIR / url_path.lstrip("/")


def save_artwork_image(
    contents: bytes,
    artwork_id: int,
    image_type: str,
    file_extension: str
) -> tuple[str, str]:

    artwork_path = (
        STORAGE_PATH
        / str(artwork_id)
        / "original"
    )

    artwork_path.mkdir(
        parents=True,
        exist_ok=True
    )

    if image_type == "main":
        filename = f"main.{file_extension}"

    elif image_type == "detail":
        detail_number = get_next_detail_number(artwork_id)
        filename = f"detail-{detail_number:02d}.{file_extension}"

    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid image_type"
        )

    file_path = artwork_path / filename

    file_path.write_bytes(contents)

    db_path = storage_url(file_path)

    return db_path, Path(filename).stem


def generate_webp_variants(
    contents: bytes,
    artwork_id: int,
    image_name: str
) -> list[dict]:

    output_dir = (
        STORAGE_PATH
        / str(artwork_id)
        / "web"
        / image_name
    )

    output_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    img = Image.open(BytesIO(contents))

    original_width = img.width

    actual_sizes = []

    for size in WEBP_SIZES:

        actual_size = min(size, original_width)

        if actual_size not in actual_sizes:
            actual_sizes.append(actual_size)

    variants = []

    for size in actual_sizes:

        variant = img.copy()

        if variant.width > size:
            variant.thumbnail((size, size))

        output_path = (
            output_dir / f"{variant.width}.webp"
        )

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
            "file_path": storage_url(output_path),
            "file_size": output_path.stat().st_size
        })

    return variants
def save_image_metadata(
    artwork_id: int,
    image_type: str,
    original: dict,
    variants: list[dict]
) -> int:

    is_main = image_type == "main"

    with get_connection() as conn:
        with conn.cursor() as cur:

            # 1. Создаём логическое изображение

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

            # 2. Собираем все физические файлы

            all_variants = [
                original,
                *variants
            ]

            # 3. Сохраняем original + WebP

            for variant in all_variants:

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


def get_image(image_id: int) -> Optional[dict]:

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    id,
                    painting_id,
                    image_type,
                    is_main,
                    alt_text,
                    sort_order
                FROM painting_images
                WHERE id = %s;
                """,
                (image_id,)
            )

            row = cur.fetchone()

    if row is None:
        return None

    return {
        "id": row[0],
        "painting_id": row[1],
        "image_type": row[2],
        "is_main": row[3],
        "alt_text": row[4],
        "sort_order": row[5]
    }

def get_image_for_delete(image_id: int) -> Optional[dict]:

    with get_connection() as conn:
        with conn.cursor() as cur:

            cur.execute(
                """
                SELECT
                    pi.id,
                    pi.painting_id,
                    pi.image_type,
                    iv.file_path
                FROM painting_images pi
                LEFT JOIN image_variants iv
                    ON iv.image_id = pi.id
                WHERE pi.id = %s;
                """,
                (image_id,)
            )

            rows = cur.fetchall()

    if not rows:
        return None

    return {
        "image_id": rows[0][0],
        "painting_id": rows[0][1],
        "image_type": rows[0][2],
        "file_paths": [
            row[3]
            for row in rows
            if row[3]
        ]
    }


def delete_image_files(
    file_paths: list[str]
) -> None:

    failed_paths = []

    for file_path in file_paths:

        path = storage_path(file_path)

        try:

            if path.exists() and path.is_file():
                path.unlink()

        except OSError as error:

            failed_paths.append(
                f"{path}: {error}"
            )

    if failed_paths:

        raise RuntimeError(
            "Failed to delete image files: "
            + "; ".join(failed_paths)
        )


def cleanup_image_directories(
    painting_id: int,
    image_type: str
) -> None:

    web_dir = (
        STORAGE_PATH
        / str(painting_id)
        / "web"
        / image_type
    )

    if web_dir.exists() and not any(web_dir.iterdir()):
        web_dir.rmdir()


def delete_image_record(image_id: int) -> None:

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


def update_image(
        image_id: int,
        data: dict
) -> Optional[dict]:

    allowed_fields = {
        "alt_text",
        "sort_order",
    }

    update_data = {
        key: value
        for key, value in data.items()
        if key in allowed_fields
    }

    if not update_data:
        return None

    fields = []
    values = []

    for field, value in update_data.items():
        fields.append(f"{field} = %s")
        values.append(value)

    values.append(image_id)

    query = f"""
        UPDATE painting_images
        SET {", ".join(fields)}
        WHERE id = %s
        RETURNING id;
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, values)

            row = cur.fetchone()

            if row is None:
                return None

        conn.commit()

    return get_image(image_id)

    