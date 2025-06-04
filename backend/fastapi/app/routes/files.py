import io
from typing import List
from app.db import models
from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.storage import minio_client
from app.schema.files import FileInfo
from pydantic import BaseModel, Field
from app.auth.jwt import get_current_user_id
from fastapi.responses import StreamingResponse
from fastapi import APIRouter, Depends, HTTPException


router = APIRouter()


@router.get(
    "/myfiles",
    tags=["Files"],
    response_model=List[FileInfo],
    summary="List all root-level files uploaded by the user",
    description=(
        "Returns a list of all files uploaded by the currently authenticated user "
        "that are not stored within any folder (i.e., files at the root level)."
    )
)
def get_my_files(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
) -> List[FileInfo]:
    """
    Retrieve all root-level files for the authenticated user.

    This endpoint fetches and returns only the files that are:
    - Owned by the logged-in user
    - Not associated with any folder (folder_id is NULL)

    Returns:
        List[FileInfo]: List of metadata for files located in the root directory.
    """
    # Query all files owned by the user where folder_id is None (i.e., root)
    files = db.query(models.File).filter(
        models.File.owner_id == user_id,
        models.File.folder_id == None  # Only root-level files
    ).all()
    
    return files


@router.get(
    "/myfiles/{file_id}", 
    response_model=FileInfo, 
    summary="Fetch a specific file by its ID",
    description="Returns the metadata of a single file if it belongs to the currently authenticated user.",
    tags=["Files"]
)
def get_my_file_by_id(
    file_id: str,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
) -> FileInfo:
    """
    Retrieve a single file's metadata by its unique ID.
    
    Args:
        file_id (str): UUID or unique identifier of the file.
        db (Session): SQLAlchemy session, injected by FastAPI.
        user_id (int): ID of the currently authenticated user, retrieved from the JWT token.

    Returns:
        FileInfo: Metadata of the requested file.
    """
    # Query the file ensuring it belongs to the current user
    file = db.query(models.File).filter(
        models.File.id == file_id,
        models.File.owner_id == user_id
    ).first()

    # Raise a 404 if the file isn't found or doesn't belong to the user
    if not file:
        raise HTTPException(status_code=404, detail="File not found or access denied")

    return file



class FileDeleteResponse(BaseModel):
    """
    Response model returned after successful file deletion.
    """
    message: str

@router.delete(
    "/myfiles/delete/{file_id}",
    summary="Delete a file by ID",
    description="Deletes a file owned by the authenticated user from both MinIO storage and the database.",
    tags=["Files"]
)
def delete_file(
    file_id: str,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
) -> FileDeleteResponse:
    """
    Deletes a file given its ID if it belongs to the authenticated user.

    Args:
        file_id (str): The unique identifier of the file to delete.
        db (Session): Database session (injected).
        user_id (int): ID of the authenticated user (injected).

    Returns:
        FileDeleteResponse: Confirmation message upon successful deletion.

    Raises:
        HTTPException(404): If the file is not found or the user is unauthorized.
        HTTPException(500): If deletion from MinIO fails.
    """
    # Query file and ensure ownership
    db_file = db.query(models.File).filter(
        models.File.id == file_id,
        models.File.owner_id == user_id
    ).first()

    if not db_file:
        raise HTTPException(status_code=404, detail="File not found or unauthorized")

    # If the file belongs to a folder, update the folder's last modified timestamp
    if db_file.folder_id:
        folder = db.query(models.Folder).filter(
            models.Folder.id == db_file.folder_id,
            models.Folder.owner_id == user_id
        ).first()
        if folder:
            folder.date_modified = datetime.utcnow()

    # Attempt to delete the file from MinIO storage
    try:
        minio_client.delete_file(file_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MinIO deletion failed: {str(e)}")

    # Delete the file record from the database
    db.delete(db_file)
    db.commit()

    return {"message": f"File '{db_file.filename}' deleted successfully"}



@router.get(
    "/myfiles/download/{file_id}", 
    summary="Download your file using ID",
    description="Streams the file content from MinIO if the file belongs to the authenticated user.",
    tags=["Files"]
)
def download_file(
    file_id: str,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Download a file by its ID for the authenticated user.

    This endpoint verifies ownership of the file, fetches it from MinIO storage,
    and streams it back to the client with the correct MIME type and filename.

    Args:
        file_id (str): The unique identifier of the file to download.
        db (Session): Database session (injected dependency).
        user_id (int): The ID of the authenticated user (injected dependency).

    Returns:
        StreamingResponse: Streaming the file content with appropriate headers.

    Raises:
        HTTPException(404): If the file is not found or does not belong to the user.
        HTTPException(500): If there is an error retrieving the file from MinIO.
    """
    # Fetch the file from the database and confirm ownership
    db_file = db.query(models.File).filter(
        models.File.id == file_id,
        models.File.owner_id == user_id
    ).first()

    if not db_file:
        raise HTTPException(status_code=404, detail="File not found or access denied")

    try:
        # Download the file stream from MinIO using file ID (object name)
        file_stream = minio_client.download_file(file_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve file: {e}")

    # Return a StreamingResponse to send the file contents to the client
    return StreamingResponse(
        content=io.BytesIO(file_stream.read()),
        media_type=db_file.mime_type or "application/octet-stream",
        headers={
            "Content-Disposition": f"attachment; filename={db_file.filename}"
        }
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
    "/myfiles/rename", 
    response_model=RenameFileResponse, 
    tags=["Files"],
    summary="Rename a file by ID",
    description="Renames a file's name if it belongs to the authenticated user and updates the modification date."
)
def rename_file(
    payload: RenameFileRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
) -> RenameFileResponse:
    """
    Rename a file owned by the authenticated user.

    This endpoint verifies the file ownership, updates the filename,
    updates the modification timestamp, commits changes to the database,
    and returns the updated file metadata.

    Args:
        payload (RenameFileRequest): Contains the file ID and the new filename.
        db (Session): Database session injected by FastAPI.
        user_id (int): Current authenticated user's ID.

    Returns:
        RenameFileResponse: The updated file metadata.

    Raises:
        HTTPException(404): If the file does not exist or user does not own it.
    """
    # Fetch file ensuring ownership
    db_file = db.query(models.File).filter(
        models.File.id == payload.file_id,
        models.File.owner_id == user_id
    ).first()

    if not db_file:
        raise HTTPException(status_code=404, detail="File not found or access denied")

    # Rename the file and update modification time
    db_file.filename = payload.new_name
    db_file.date_modified = datetime.utcnow()

    # Persist changes
    db.commit()
    db.refresh(db_file)

    return db_file