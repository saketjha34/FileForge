from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, Union, List
from app.db import models
from app.db.database import get_db
from app.auth.jwt import get_current_user_id
from pydantic import BaseModel
from app.routes.schema import FolderInfo
from app.routes.schema import FolderDetails
from pydantic import BaseModel, Field
from app.utils.folders_utils import delete_folder_recursive
from datetime import datetime


router = APIRouter()


class FolderCreateRequest(BaseModel):
    name: str
    parent_id: Optional[Union[int, str]] = Field(default=None, description="Optional parent folder ID, defaults to None")

@router.post(
    "/folders", 
    response_model=FolderInfo, 
    tags=["Folders"],
    summary="Create a new folder (optionally nested inside another folder)"
)
def create_folder(
    folder_req: FolderCreateRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
) -> FolderInfo:
    # Normalize parent_id to int or None
    parent_id = folder_req.parent_id
    if parent_id in (None, "", "null"):
        parent_id = None
    else:
        try:
            parent_id = int(parent_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid parent_id")

    # If parent_id is set, verify the folder exists and belongs to the user
    parent_folder = None
    if parent_id:
        parent_folder = db.query(models.Folder).filter(
            models.Folder.id == parent_id,
            models.Folder.owner_id == user_id
        ).first()
        if not parent_folder:
            raise HTTPException(status_code=400, detail="Parent folder not found or access denied")

    new_folder = models.Folder(
        name=folder_req.name,
        owner_id=user_id,
        parent_id=parent_id,
        created_at=datetime.utcnow(),         
        date_modified=None                     
    )

    db.add(new_folder)
    db.commit()
    db.refresh(new_folder)

    #  Update parent's date_modified if parent exists
    if parent_folder:
        parent_folder.date_modified = datetime.utcnow()
        db.commit()

    return new_folder



@router.get("/folders", 
            response_model=List[FolderInfo],
            tags=["Folders"],
            summary="Get top-level folders owned by the user"
)
def get_my_folders(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
) -> List[FolderInfo]:
    folders = db.query(models.Folder).filter(
        models.Folder.owner_id == user_id,
        models.Folder.parent_id.is_(None)
    ).all()
    return folders



@router.get(
    "/folders/{folder_id}/details", 
    response_model=FolderDetails,
    tags=["Folders"]
)
def get_folder_details(
    folder_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
) -> FolderDetails:
    folder = db.query(models.Folder).filter(
        models.Folder.id == folder_id,
        models.Folder.owner_id == user_id
    ).first()

    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    files = db.query(models.File).filter(
        models.File.folder_id == folder_id,
        models.File.owner_id == user_id
    ).all()

    subfolders = db.query(models.Folder).filter(
        models.Folder.parent_id == folder_id,
        models.Folder.owner_id == user_id
    ).all()

    return FolderDetails(
        id=folder.id,
        name=folder.name,
        owner_id=folder.owner_id,
        parent_id=folder.parent_id,
        created_at=folder.created_at,
        date_modified=folder.date_modified,
        files=files,
        subfolders=subfolders
    )



@router.delete(
    "/folders/{folder_id}", 
    tags=["Folders"],
    summary="Recursively delete folder and its contents"
)
def delete_folder(
    folder_id: int, 
    db: Session = Depends(get_db), 
    user_id: int = Depends(get_current_user_id)
):
    folder = db.query(models.Folder).filter(
        models.Folder.id == folder_id,
        models.Folder.owner_id == user_id
    ).first()

    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found or access denied")

    #  Capture parent_id before deletion
    parent_id = folder.parent_id
    folder_name = folder.name

    # Perform recursive deletion
    delete_folder_recursive(db, folder_id, user_id)

    #  Update parent's date_modified if it exists
    if parent_id:
        parent_folder = db.query(models.Folder).filter(
            models.Folder.id == parent_id,
            models.Folder.owner_id == user_id
        ).first()
        if parent_folder:
            parent_folder.date_modified = datetime.utcnow()

    db.commit()

    return {"message": f"Folder '{folder_name}' and all its contents have been deleted."}



class RenameFolderRequest(BaseModel):
    folder_id: int = Field(..., description="ID of the folder to rename")
    new_name: str = Field(..., description="New name for the folder", min_length=1)
    
class RenameFolderResponse(BaseModel):
    message: str = Field(..., example="Folder renamed successfully")
    folder_id: int
    new_name: str

@router.post(
    "/folders/rename", 
    tags=["Folders"],
    summary="Rename a folder"
)
def rename_folder(
    payload: RenameFolderRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
) -> RenameFolderResponse:
    folder = db.query(models.Folder).filter(
        models.Folder.id == payload.folder_id,
        models.Folder.owner_id == user_id
    ).first()

    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    # Rename folder and update its date_modified
    folder.name = payload.new_name
    folder.date_modified = datetime.utcnow()

    # Also update parent folder's date_modified if parent exists
    if folder.parent_id:
        parent_folder = db.query(models.Folder).filter(
            models.Folder.id == folder.parent_id,
            models.Folder.owner_id == user_id
        ).first()
        if parent_folder:
            parent_folder.date_modified = datetime.utcnow()
            db.add(parent_folder)  # mark as dirty

    db.commit()
    db.refresh(folder)

    return {"message": "Folder renamed successfully", "folder_id": folder.id, "new_name": folder.name}