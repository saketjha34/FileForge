# Response schema
from pydantic import BaseModel 
from datetime import datetime


class FileInfo(BaseModel):
    id: str
    filename: str
    upload_time: datetime
    mime_type: str
    size: int

    class Config:
        from_attributes = True  # Use in Pydantic v2