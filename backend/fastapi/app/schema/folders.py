from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from app.schema.files import FileInfo


class FolderInfo(BaseModel):
    """
    Basic folder metadata representation used in folder listings.
    """
    id: int = Field(..., description="Unique identifier for the folder")
    name: str = Field(..., description="Name of the folder")
    parent_id: Optional[int] = Field(None, description="ID of the parent folder, if nested")
    created_at: datetime = Field(..., description="Timestamp when the folder was created")
    date_modified: Optional[datetime] = Field(
        None, description="Timestamp when the folder was last modified"
    )
    item_count: int = Field(..., description="Number of immediate files and subfolders")

    class Config:
        from_attributes = True  # Enables ORM mode


class SubFolderInfo(BaseModel):
    """
    Metadata for a subfolder within a folder. Used for nested structures.
    """
    id: int = Field(..., description="Unique identifier for the subfolder")
    name: str = Field(..., description="Name of the subfolder")
    parent_id: Optional[int] = Field(None, description="ID of the parent folder")
    created_at: datetime = Field(..., description="Timestamp when the subfolder was created")
    date_modified: Optional[datetime] = Field(
        None, description="Timestamp when the subfolder was last modified"
    )

    class Config:
        from_attributes = True


class FolderDetails(BaseModel):
    """
    Complete representation of a folder including its files and subfolders.
    """
    id: int = Field(..., description="Unique identifier of the folder")
    name: str = Field(..., description="Name of the folder")
    owner_id: int = Field(..., description="ID of the user who owns the folder")
    parent_id: Optional[int] = Field(None, description="Parent folder ID, if nested")
    created_at: datetime = Field(..., description="Folder creation timestamp")
    date_modified: Optional[datetime] = Field(
        None, description="Last modified timestamp of the folder"
    )
    files: List[FileInfo] = Field(default_factory=list, description="List of files inside the folder")
    subfolders: List[SubFolderInfo] = Field(default_factory=list, description="List of immediate subfolders")
    item_count: int = Field(..., description="Number of direct files and subfolders inside this folder")
    class Config:
        from_attributes = True