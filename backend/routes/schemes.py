from pydantic import BaseModel, Field, field_validator
from typing import List, Optional


class ArtworkBase(BaseModel):

    title: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=300
    )

    creation_year: Optional[int] = Field(
        default=None,
        ge=1000,
        le=2100
    )

    description: Optional[str] = Field(
        default=None,
        max_length=10000
    )

    height_cm: Optional[float] = Field(
        default=None,
        gt=0
    )

    width_cm: Optional[float] = Field(
        default=None,
        gt=0
    )

    medium_id: Optional[int] = Field(
        default=None,
        gt=0
    )

    surface_id: Optional[int] = Field(
        default=None,
        gt=0
    )

    status_id: Optional[int] = Field(
        default=None,
        gt=0
    )

    owner_id: Optional[int] = Field(
        default=None,
        gt=0
    )

    price: Optional[float] = Field(
        default=None,
        ge=0
    )

    currency: Optional[str] = Field(
        default=None,
        max_length=10
    )

    catalog_number: Optional[str] = Field(
        default=None,
        max_length=100
    )

    genre_ids: Optional[List[int]] = None

    is_copy: Optional[bool] = None


    @field_validator(
        "title",
        "description",
        "currency",
        "catalog_number",
        mode="before"
    )
    @classmethod
    def empty_string_to_none(cls, value):

        if isinstance(value, str):

            value = value.strip()

            if value == "":
                return None

        return value


class ArtworkCreate(ArtworkBase):

    title: str = Field(
        min_length=1,
        max_length=300
    )

    creation_year: int = Field(
        ge=1000,
        le=2100
    )

    genre_ids: List[int] = Field(
        default_factory=list,
        description="Список ID жанров"
    )

    is_copy: bool = False

    is_published: bool = False

class ArtworkUpdateFull(ArtworkBase):

    title: str = Field(
        min_length=1,
        max_length=300
    )

    creation_year: int = Field(
        ge=1000,
        le=2100
    )

    genre_ids: List[int] = Field(
        default_factory=list,
        description="Список ID жанров"
    )

    is_copy: bool = False

    is_published: bool = False


class ArtworkUpdate(ArtworkBase):

    genre_ids: Optional[List[int]] = None

    is_copy: Optional[bool] = None


class ImageUpdate(BaseModel):
    alt_text: Optional[str] = None
    sort_order: Optional[int] = None

class ArtworkPublicationUpdate(BaseModel):
    is_published: bool

class AdminLogin(BaseModel):
    username: str
    password: str