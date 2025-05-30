# Response schema
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

    class Config:
        from_attributes = True  
        

class FolderInfo(BaseModel):
    id: int
    name: str
    parent_id: Optional[int]

    class Config:
        from_attributes = True


class FileInFolder(BaseModel):
    id: str
    filename: str
    upload_time: datetime
    mime_type: str
    size: int

    class Config:
        from_attributes = True


class SubFolderInfo(BaseModel):
    id: int
    name: str
    parent_id: Optional[int]

    class Config:
        from_attributes = True


class FolderDetails(BaseModel):
    id: int
    name: str
    owner_id: int
    parent_id: Optional[int]
    files: List[FileInfo]
    subfolders: List[SubFolderInfo]