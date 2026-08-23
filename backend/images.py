from database import get_connection
from PIL import Image
from io import BytesIO
from fastapi import HTTPException, UploadFile

ALLOWED_FORMATS = { "JPEG", "PNG" }

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
        "filename": image.filename,
        "format": img.format,
        "width": img.width,
        "height": img.height
    }