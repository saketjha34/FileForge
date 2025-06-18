from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class FavoriteTarget(BaseModel):
    """
    Schema representing a favorite target — either a file or a folder (not both).
    Used for adding or removing favorites.
    """
    file_id: Optional[str] = Field(default=None, description="UUID of the file to favorite")
    folder_id: Optional[int] = Field(default=None, description="ID of the folder to favorite")


class FavoriteInfo(BaseModel):
    """
    Schema representing detailed information about a favorite entry.
    Used in API responses to describe a user's favorite file or folder.
    """
    id: int = Field(..., description="Unique identifier for the favorite entry")
    user_id: int = Field(..., description="ID of the user who favorited the item")
    file_id: Optional[str] = Field(
        default=None,
        description="UUID of the favorited file (if applicable)"
    )
    folder_id: Optional[int] = Field(
        default=None,
        description="ID of the favorited folder (if applicable)"
    )
    created_at: datetime = Field(..., description="Timestamp when the favorite was created")

    class Config:
        from_attributes = True  