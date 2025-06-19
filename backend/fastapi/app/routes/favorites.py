from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel, Field
from app.schema.favorites import FavoriteTarget, FavoriteInfo
from app.db import models
from app.db.database import get_db
from app.auth.jwt import get_current_user_id
from datetime import datetime
from app.schema.files import FileInfo
from app.schema.folders import FolderInfo


router = APIRouter()


@router.post(
    "/favorites",
    response_model=FavoriteInfo,
    tags=["Favorites"],
    summary="Add an item to favorites",
    description="Allows a user to mark a file or folder as a favorite. "
                "Only one of `file_id` or `folder_id` should be provided."
)
def add_to_favorites(
    fav_req: FavoriteTarget,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
) -> FavoriteInfo:
    """
    Add a file or folder to the user's favorites.

    - Validates that either `file_id` or `folder_id` is provided.
    - Checks ownership to prevent favoriting unauthorized resources.
    - Prevents duplicate favorite entries.
    - Returns the newly created favorite record.

    Args:
        fav_req (FavoriteCreate): Request body containing file_id or folder_id.
        db (Session): SQLAlchemy session.
        user_id (int): ID of the current authenticated user.

    Returns:
        FavoriteInfo: Details of the created favorite entry.
    """
    if not fav_req.file_id and not fav_req.folder_id:
        raise HTTPException(status_code=400, detail="file_id or folder_id is required")

    # Ownership validation
    if fav_req.file_id:
        file = db.query(models.File).filter(
            models.File.id == fav_req.file_id,
            models.File.owner_id == user_id
        ).first()
        if not file:
            raise HTTPException(status_code=404, detail="File not found")

    if fav_req.folder_id:
        folder = db.query(models.Folder).filter(
            models.Folder.id == fav_req.folder_id,
            models.Folder.owner_id == user_id
        ).first()
        if not folder:
            raise HTTPException(status_code=404, detail="Folder not found")

    # Duplicate check
    existing = db.query(models.Favorite).filter(
        models.Favorite.user_id == user_id,
        models.Favorite.file_id == fav_req.file_id if fav_req.file_id else models.Favorite.file_id.is_(None),
        models.Favorite.folder_id == fav_req.folder_id if fav_req.folder_id else models.Favorite.folder_id.is_(None)
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already in favorites")

    # Create and persist new favorite
    new_fav = models.Favorite(
        user_id=user_id,
        file_id=fav_req.file_id,
        folder_id=fav_req.folder_id,
        created_at=datetime.utcnow()
    )
    db.add(new_fav)
    db.commit()
    db.refresh(new_fav)
    return new_fav



class FavoriteRemoveResponse(BaseModel):
    """
    Response model returned after successfully removing an item from favorites.
    """
    detail: str = Field(..., example="Removed from favorites")

    class Config:
        from_attributes = True
        
@router.delete(
    "/favorites",
    response_model=FavoriteRemoveResponse,
    tags=["Favorites"],
    summary="Remove from favorites",
    description="Removes a file or folder from the authenticated user's favorites. "
                "At least one of `file_id` or `folder_id` must be provided."
)
def remove_from_favorites(
    fav_req: FavoriteTarget,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
) -> FavoriteRemoveResponse:
    """
    Remove a file or folder from the user's favorites.

    - Validates that either `file_id` or `folder_id` is provided.
    - Deletes the matching favorite record for the user if it exists.
    - Returns a success message on successful deletion.

    Args:
        fav_req (FavoriteCreate): Request body with either file_id or folder_id.
        db (Session): SQLAlchemy session.
        user_id (int): Authenticated user ID.

    Returns:
        FavoriteRemoveResponse: Message indicating deletion success.
    """
    if not fav_req.file_id and not fav_req.folder_id:
        raise HTTPException(status_code=400, detail="file_id or folder_id is required")

    query = db.query(models.Favorite).filter(models.Favorite.user_id == user_id)

    if fav_req.file_id:
        query = query.filter(models.Favorite.file_id == fav_req.file_id)
    if fav_req.folder_id:
        query = query.filter(models.Favorite.folder_id == fav_req.folder_id)

    favorite = query.first()

    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")

    db.delete(favorite)
    db.commit()
    return FavoriteRemoveResponse(detail="Removed from favorites")



class FavoriteResponse(BaseModel):
    """
    Response model for returning the user's favorite files and folders.
    """
    files: List[FileInfo]
    folders: List[FolderInfo]

    class Config:
        from_attributes = True

@router.get(
    "/favorites",
    response_model=FavoriteResponse,
    tags=["Favorites"],
    summary="Get all favorites",
    description="Retrieves all files and folders that the authenticated user has marked as favorites."
)
def get_favorites(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
) -> FavoriteResponse:
    """
    Retrieve all files and folders favorited by the authenticated user.

    - Fetches all favorite entries for the user.
    - Separates file and folder favorites.
    - Returns detailed file info and folder info with item count.

    Args:
        db (Session): SQLAlchemy session dependency.
        user_id (int): Authenticated user's ID from JWT.

    Returns:
        FavoriteResponse: A structured response containing:
            - `files`: List of FileInfo objects for favorited files.
            - `folders`: List of FolderInfo objects for favorited folders (with item counts).
    """
    # Query all favorites for the user
    favorites = db.query(models.Favorite).filter(
        models.Favorite.user_id == user_id
    ).all()

    # Split into file and folder IDs
    file_ids = [fav.file_id for fav in favorites if fav.file_id]
    folder_ids = [fav.folder_id for fav in favorites if fav.folder_id]

    # Fetch and convert files
    files: List[FileInfo] = []
    if file_ids:
        db_files = db.query(models.File).filter(models.File.id.in_(file_ids)).all()
        files = [
            FileInfo(
                id=file.id,
                filename=file.filename,
                upload_time=file.upload_time,
                mime_type=file.mime_type,
                size=file.size,
                folder_id=file.folder_id,
                date_modified=file.date_modified,
            )
            for file in db_files
        ]

    # Fetch and convert folders with item_count
    folders: List[FolderInfo] = []
    if folder_ids:
        db_folders = db.query(models.Folder).filter(models.Folder.id.in_(folder_ids)).all()
        for folder in db_folders:
            file_count = db.query(models.File).filter(models.File.folder_id == folder.id).count()
            subfolder_count = db.query(models.Folder).filter(models.Folder.parent_id == folder.id).count()
            folders.append(
                FolderInfo(
                    id=folder.id,
                    name=folder.name,
                    parent_id=folder.parent_id,
                    created_at=folder.created_at,
                    date_modified=folder.date_modified,
                    item_count=file_count + subfolder_count,
                )
            )

    # Return structured response
    return FavoriteResponse(files=files, folders=folders)