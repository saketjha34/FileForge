from fastapi import APIRouter, Depends ,HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.auth.jwt import get_current_user_id
from app.db import models
from typing import List
from app.storage import minio_client
from fastapi.responses import StreamingResponse
from app.routes.schema import FileInfo
from pydantic import BaseModel, Field
from typing import Optional
import io
from datetime import datetime


router = APIRouter()


@router.get(
    "/myfiles",
    tags=["Files"],
    response_model=List[FileInfo],
    summary="Get all files uploaded by the logged-in user Present in the Root Directory",
    description="Returns a list of all files uploaded by the currently authenticated user that are not in any folder (i.e., root-level files)."
)
def get_my_files(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
) -> List[FileInfo]:
    
    files = db.query(models.File).filter(
        models.File.owner_id == user_id,
        models.File.folder_id == None  # Only root-level files
    ).all()
    
    return files


@router.get(
    "/myfiles/{file_id}", 
    response_model =FileInfo, 
    summary="Get a single file by ID", 
    tags=["Files"]
)
def get_my_file_by_id(
    file_id: str,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
) -> FileInfo:
    """
    Retrieve a single file's metadata by ID, only if the file belongs to the current user.
    """
    file = db.query(models.File).filter(
        models.File.id == file_id,
        models.File.owner_id == user_id
    ).first()

    if not file:
        raise HTTPException(status_code=404, detail="File not found or access denied")

    return file


class FileDeleteResponse(BaseModel):
    message: str

@router.delete(
    "/delete/{file_id}", 
    summary="Delete a file by ID", 
    tags=["Files"]
)
def delete_file(
    file_id: str,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
) -> FileDeleteResponse:
    """
    Delete a file if it belongs to the authenticated user.
    Removes file from MinIO and the database.
    """
    db_file = db.query(models.File).filter(
        models.File.id == file_id,
        models.File.owner_id == user_id
    ).first()

    if not db_file:
        raise HTTPException(status_code=404, detail="File not found or unauthorized")

    #  If file is in a folder, update folder's date_modified
    if db_file.folder_id:
        folder = db.query(models.Folder).filter(
            models.Folder.id == db_file.folder_id,
            models.Folder.owner_id == user_id
        ).first()
        if folder:
            folder.date_modified = datetime.utcnow()

    # Delete from MinIO
    try:
        minio_client.delete_file(file_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MinIO deletion failed: {str(e)}")

    # Delete from database
    db.delete(db_file)
    db.commit()

    return {"message": f"File '{db_file.filename}' deleted successfully"}


@router.get(
    "/download/{file_id}", 
    summary="Download your file Using ID",
    tags=["Files"]
)
def download_file(
    file_id: str,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Download a file only if it belongs to the authenticated user.
    Ensures secure access to personal files.
    """
    # Ensure the file belongs to the current user
    db_file = db.query(models.File).filter(
        models.File.id == file_id,
        models.File.owner_id == user_id
    ).first()

    if not db_file:
        raise HTTPException(status_code=404, detail="File not found or access denied")

    try:
        file_data = minio_client.download_file(file_id)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to retrieve file from storage")

    return StreamingResponse(
        io.BytesIO(file_data.read()),
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename={db_file.filename}"}
    )


class RenameFileRequest(BaseModel):
    file_id: str = Field(..., description="UUID of the file to rename")
    new_name: str = Field(..., min_length=1, description="New filename")


class RenameFileResponse(BaseModel):
    id: str
    filename: str
    upload_time: datetime
    mime_type: str
    size: int
    folder_id: Optional[int] = None
    date_modified: Optional[datetime] = None

    class Config:
        from_attributes = True


@router.post(
    "/rename-file", 
    response_model=RenameFileResponse, 
    tags=["Files"]
)
def rename_file(
    payload: RenameFileRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    # Fetch file ensuring ownership
    db_file = db.query(models.File).filter(
        models.File.id == payload.file_id,
        models.File.owner_id == user_id
    ).first()

    if not db_file:
        raise HTTPException(status_code=404, detail="File not found or access denied")

    # Rename and update date_modified
    db_file.filename = payload.new_name
    db_file.date_modified = datetime.utcnow()

    db.commit()
    db.refresh(db_file)

    return db_file