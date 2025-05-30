from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class FileInfo(BaseModel):
    id: str
    filename: str
    upload_time: datetime
    mime_type: str
    size: int
    folder_id: Optional[int] = None
    date_modified: Optional[datetime] = None

    class Config:
        from_attributes = True


class FolderInfo(BaseModel):
    id: int
    name: str
    parent_id: Optional[int]
    created_at: datetime
    date_modified: Optional[datetime] = None

    class Config:
        from_attributes = True


class FileInFolder(BaseModel):
    id: str
    filename: str
    upload_time: datetime
    mime_type: str
    size: int
    date_modified: Optional[datetime] = None  

    class Config:
        from_attributes = True


class SubFolderInfo(BaseModel):
    id: int
    name: str
    parent_id: Optional[int]
    created_at: datetime
    date_modified: Optional[datetime] = None

    class Config:
        from_attributes = True


class FolderDetails(BaseModel):
    id: int
    name: str
    owner_id: int
    parent_id: Optional[int]
    created_at: datetime
    date_modified: Optional[datetime] = None
    files: List[FileInfo]
    subfolders: List[SubFolderInfo]

    class Config:
        from_attributes = True