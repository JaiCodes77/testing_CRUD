from __future__ import annotations

from sqlmodel import Field, SQLModel


class ItemBase(SQLModel):
    name: str
    description: str | None = None
    price: float


class Item(ItemBase, table=True):
    id: int | None = Field(default=None, primary_key=True)


class ItemCreate(ItemBase):
    pass


class ItemUpdate(SQLModel):
    name: str | None = None
    description: str | None = None
    price: float | None = None
