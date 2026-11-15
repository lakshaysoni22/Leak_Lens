"""Pydantic schemas — shared / common types."""
from __future__ import annotations
from typing import Generic, Optional, TypeVar, Any
from pydantic import BaseModel

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "OK"
    data: Optional[T] = None


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    per_page: int
    total_pages: int


class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    detail: Optional[Any] = None
