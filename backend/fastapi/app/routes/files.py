from fastapi import APIRouter, Depends ,HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.auth.jwt import get_current_user_id
from app.db import models
from typing import List
from app.storage import minio_client
from app.routes.schema import FileInfo

router = APIRouter()



@router.get("/myfiles", tags=["Files"],response_model=List[FileInfo],summary="Get all files uploaded by the logged-in user",description="Returns a list of all files uploaded by the currently authenticated user.")
def get_my_files(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
    )->List[FileInfo]:
    
    files = db.query(models.File).filter(models.File.owner_id == user_id).all()
    return files


@router.get("/myfiles/{file_id}", response_model =FileInfo, summary="Get a single file by ID", tags=["Files"])
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



@router.delete("/delete/{file_id}", summary="Delete a file by ID", tags=["Files"])
def delete_file(
    file_id: str,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Delete a file if it belongs to the authenticated user.
    Removes file from MinIO and the database.
    """
    db_file = db.query(models.File).filter(models.File.id == file_id, models.File.owner_id == user_id).first()

    if not db_file:
        raise HTTPException(status_code=404, detail="File not found or unauthorized")

    # Delete from MinIO
    try:
        minio_client.delete_file(file_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MinIO deletion failed: {str(e)}")

    # Delete from database
    db.delete(db_file)
    db.commit()

    return {"message": f"File '{db_file.filename}' deleted successfully"}