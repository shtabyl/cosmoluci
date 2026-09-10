from fastapi import APIRouter
from pydantic import BaseModel
from reference_data import (get_reference_items, create_reference_item, update_reference_item)
from reference_data_delete import delete_reference_item

class ReferenceItemCreate(BaseModel):
    name: str

router = APIRouter(
    prefix="/api/admin/reference-data",
    tags=["reference-data"]
)

@router.get("/{reference_type}")
def get_reference_data(reference_type: str):
    return get_reference_items(reference_type)

@router.post("/{reference_type}")
def create_reference_data(reference_type: str, data: ReferenceItemCreate):
    return create_reference_item(reference_type=reference_type, name=data.name)

@router.put("/{reference_type}/{item_id}")
def update_reference_date(
    reference_type: str,
    item_id: int,
    data: ReferenceItemCreate
):
    return  update_reference_item(
        reference_type=reference_type,
        item_id=item_id,
        name=data.name
    )

@router.delete("/{reference_type}/{item_id}")
def delete_reference_data(
    reference_type: str,
    item_id: int
):

    delete_reference_item(
        reference_type=reference_type,
        item_id=item_id
    )

    return {
        "success": True
    }