from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class FileInfo(BaseModel):
    """
    Schema representing detailed information about a file stored in the system.
    Used for returning metadata in API responses.
    """
    id: str = Field(..., description="Unique identifier (UUID) for the file")
    filename: str = Field(..., description="Original name of the uploaded file")
    upload_time: datetime = Field(..., description="Timestamp when the file was uploaded")
    mime_type: str = Field(..., description="MIME type of the file (e.g., 'image/png')")
    size: int = Field(..., description="Size of the file in bytes")
    folder_id: Optional[int] = Field(None, description="ID of the parent folder, if any")
    date_modified: Optional[datetime] = Field(
        None, description="Timestamp of the last file modification"
    )

    class Config:
        from_attributes = True  # Allows conversion from ORM objects


class FileInFolder(BaseModel):
    """
    Schema for representing files listed inside a folder.
    This is a simplified version without the folder_id field.
    """
    id: str = Field(..., description="Unique identifier (UUID) for the file")
    filename: str = Field(..., description="Name of the file")
    upload_time: datetime = Field(..., description="Timestamp when the file was uploaded")
    mime_type: str = Field(..., description="MIME type of the file")
    size: int = Field(..., description="Size of the file in bytes")
    date_modified: Optional[datetime] = Field(
        None, description="Timestamp when the file was last modified"
    )

    class Config:
        from_attributes = True