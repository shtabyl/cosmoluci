from fastapi import APIRouter
from pydantic import BaseModel
from owners import (get_owners, create_owner, update_owner, delete_owner)

class OwnerCreate(BaseModel):
    country: str
    owner_type: str

router = APIRouter(
    prefix="/api/admin/owners",
    tags=["owners"]
)

@router.get("")
def get_all_owners():
    return get_owners()

@router.post("")
def create_new_owner(data: OwnerCreate):
    return create_owner(country=data.country, owner_type=data.owner_type)

@router.put("/{owner_id}")
def update_owner_endpoint(owner_id: int, data: OwnerCreate):
    return update_owner(owner_id=owner_id, country=data.country, owner_type=data.owner_type)

@router.delete("/{owner_id}")
def delete_owner_endpoint(owner_id: int):
    delete_owner(owner_id=owner_id)
    return {"success": True}