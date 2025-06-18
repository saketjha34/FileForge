from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, Union, List
from app.db import models
from app.db.database import get_db
from app.auth.jwt import get_current_user_id
from pydantic import BaseModel
from app.schema.folders import FolderInfo, FolderDetails
from pydantic import BaseModel, Field
from app.utils.folders_utils import delete_folder_recursive
from datetime import datetime


router = APIRouter()


class FolderCreateRequest(BaseModel):
    """
    Request model for creating a new folder.

    Attributes:
        name (str): The name of the new folder.
        parent_id (Optional[Union[int, str]]): Optional ID of the parent folder.
            Can be int, str, or None. Defaults to None meaning root-level folder.
    """
    name: str
    parent_id: Optional[Union[int, str]] = Field(default=None, description="Optional parent folder ID, defaults to None")

@router.post(
    "/folders", 
    response_model=FolderInfo, 
    tags=["Folders"],
    summary="Create a new folder (optionally nested inside another folder)",
    description="Creates a folder owned by the authenticated user. "
                "If `parent_id` is provided, verifies that the parent folder exists and belongs to the user."
)
def create_folder(
    folder_req: FolderCreateRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
) -> FolderInfo:
    """
    Create a new folder for the authenticated user.
    """
    parent_id = folder_req.parent_id
    if parent_id in (None, "", "null"):
        parent_id = None
    else:
        try:
            parent_id = int(parent_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid parent_id")

    parent_folder = None
    if parent_id:
        parent_folder = db.query(models.Folder).filter(
            models.Folder.id == parent_id,
            models.Folder.owner_id == user_id
        ).first()
        if not parent_folder:
            raise HTTPException(status_code=400, detail="Parent folder not found or access denied")

    # Create new folder
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

    # Update parent folder's modified time
    if parent_folder:
        parent_folder.date_modified = datetime.utcnow()
        db.commit()

    # Return with item_count = 0
    return FolderInfo(
        id=new_folder.id,
        name=new_folder.name,
        parent_id=new_folder.parent_id,
        created_at=new_folder.created_at,
        date_modified=new_folder.date_modified,
        item_count=0
    )



@router.get(
    "/folders", 
    response_model=List[FolderInfo],
    tags=["Folders"],
    summary="Get top-level folders owned by the user",
    description="Retrieve a list of all folders owned by the authenticated user that do not have a parent folder (i.e., top-level folders)."
)
def get_my_folders(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
) -> List[FolderInfo]:
    """
    Fetch all top-level folders for the current authenticated user,
    along with the count of direct files and subfolders they contain.
    """
    top_folders = db.query(models.Folder).filter(
        models.Folder.owner_id == user_id,
        models.Folder.parent_id.is_(None)
    ).all()

    result = []
    for folder in top_folders:
        file_count = db.query(models.File).filter(
            models.File.folder_id == folder.id,
            models.File.owner_id == user_id
        ).count()
        
        subfolder_count = db.query(models.Folder).filter(
            models.Folder.parent_id == folder.id,
            models.Folder.owner_id == user_id
        ).count()

        result.append(FolderInfo(
            id=folder.id,
            name=folder.name,
            parent_id=folder.parent_id,
            created_at=folder.created_at,
            date_modified=folder.date_modified,
            item_count=file_count + subfolder_count
        ))

    return result



@router.get(
    "/folders/{folder_id}/details",
    response_model=FolderDetails,
    tags=["Folders"],
    summary="Get detailed info for a folder, including files and subfolders",
    description="Retrieve metadata of a folder by ID with all its files and immediate subfolders, accessible only to the folder owner."
)
def get_folder_details(
    folder_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
) -> FolderDetails:
    """
    Retrieve detailed information about a specific folder owned by the user,
    including its metadata, the list of files it contains, and its direct subfolders.

    Returns:
        FolderDetails: Folder metadata along with lists of files and subfolders.
    """
    folder = db.query(models.Folder).filter(
        models.Folder.id == folder_id,
        models.Folder.owner_id == user_id
    ).first()

    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    # Fetch files and subfolders
    files = db.query(models.File).filter(
        models.File.folder_id == folder_id,
        models.File.owner_id == user_id
    ).all()

    subfolders = db.query(models.Folder).filter(
        models.Folder.parent_id == folder_id,
        models.Folder.owner_id == user_id
    ).all()

    # Count = total of files + subfolders
    item_count = len(files) + len(subfolders)

    return FolderDetails(
        id=folder.id,
        name=folder.name,
        owner_id=folder.owner_id,
        parent_id=folder.parent_id,
        created_at=folder.created_at,
        date_modified=folder.date_modified,
        files=files,
        subfolders=subfolders,
        item_count=item_count
    )



@router.delete(
    "/folders/{folder_id}",
    tags=["Folders"],
    summary="Recursively delete folder and its contents",
    description=(
        "Deletes the specified folder and all its contents, including all nested subfolders "
        "and files, if owned by the authenticated user. Also updates the parent's "
        "date_modified timestamp if applicable."
    )
)
def delete_folder(
    folder_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Recursively delete a folder along with all nested files and subfolders.

    Args:
        folder_id (int): ID of the folder to delete.
        db (Session): Database session.
        user_id (int): ID of the authenticated user.

    Raises:
        HTTPException 404: If the folder is not found or access is denied.
    """
    # Query folder by ID and ensure ownership
    folder = db.query(models.Folder).filter(
        models.Folder.id == folder_id,
        models.Folder.owner_id == user_id
    ).first()

    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found or access denied")

    # Capture parent folder ID and folder name for update and response
    parent_id = folder.parent_id
    folder_name = folder.name

    # Call recursive deletion helper function
    delete_folder_recursive(db, folder_id, user_id)

    # Update parent's date_modified timestamp if parent exists
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
    """
    Request schema for renaming a folder.

    Attributes:
        folder_id (int): ID of the folder to rename.
        new_name (str): New name for the folder. Must be at least 1 character long.
    """
    folder_id: int = Field(..., description="ID of the folder to rename")
    new_name: str = Field(..., description="New name for the folder", min_length=1)
    
class RenameFolderResponse(BaseModel):
    """
    Response schema returned after successfully renaming a folder.

    Attributes:
        message (str): Confirmation message.
        folder_id (int): ID of the renamed folder.
        new_name (str): The new name of the folder.
    """
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
    """
    Rename a folder owned by the authenticated user.

    Args:
        payload (RenameFolderRequest): Request payload containing folder_id and new_name.
        db (Session): Database session.
        user_id (int): ID of the authenticated user.

    Raises:
        HTTPException 404: If the folder does not exist or is not owned by the user.

    Returns:
        RenameFolderResponse: Confirmation message and updated folder info.
    """
    # Query folder by ID and ensure ownership
    folder = db.query(models.Folder).filter(
        models.Folder.id == payload.folder_id,
        models.Folder.owner_id == user_id
    ).first()

    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    # Rename the folder and update date_modified timestamp
    folder.name = payload.new_name
    folder.date_modified = datetime.utcnow()

    # If folder has a parent, update parent's date_modified timestamp as well
    if folder.parent_id:
        parent_folder = db.query(models.Folder).filter(
            models.Folder.id == folder.parent_id,
            models.Folder.owner_id == user_id
        ).first()
        if parent_folder:
            parent_folder.date_modified = datetime.utcnow()
            db.add(parent_folder)  # Mark as dirty for update

    db.commit()
    db.refresh(folder)

    return {"message": "Folder renamed successfully", "folder_id": folder.id, "new_name": folder.name}