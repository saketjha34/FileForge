import io
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from app.db import models
from app.db.database import get_db
from app.auth.jwt import get_current_user_id
from app.storage import minio_client
from zipfile import ZipFile
import os, tempfile
from app.schema.folders import FolderDetails, SubFolderInfo
from app.schema.files import FileInfo
from typing import Optional
from app.storage.minio_client import upload_file
import mimetypes


router = APIRouter()


@router.post(
    "/upload_files",
    tags=["Upload"],
    summary="Upload a file to the server",
)
def upload_files(
    file: UploadFile = File(...),
    folder_id: Optional[str] = Query(
        default=None,
        description="Optional folder ID to associate with the file"
    ),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Upload a single file to the server.

    - Stores the file in MinIO object storage.
    - Records file metadata (filename, MIME type, size, folder association) in the database.
    - Optionally associates the file with a folder using `folder_id`.
    
    Args:
        file (UploadFile): File to upload.
        folder_id (Optional[str]): Optional folder ID to place the file into.
        db (Session): SQLAlchemy session.
        user_id (int): Authenticated user ID.

    Returns:
        dict: File ID, MIME type, size, and folder ID (if any).
    """
    folder_id_int = None
    folder = None
    if folder_id not in (None, "", "null"):
        try:
            folder_id_int = int(folder_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid folder_id")

        # Check folder ownership
        folder = db.query(models.Folder).filter(
            models.Folder.id == folder_id_int,
            models.Folder.owner_id == user_id
        ).first()

        if not folder:
            raise HTTPException(status_code=400, detail="Folder not found or access denied")

    # Upload to MinIO
    file_id = str(uuid.uuid4())
    minio_client.upload_file(file.file, file_id)

    # Calculate size of uploaded file
    file.file.seek(0, io.SEEK_END)  # Move to end
    size = file.file.tell()
    file.file.seek(0)  # Reset pointer

    # Create file DB record
    db_file = models.File(
        id=file_id,
        filename=file.filename,
        mime_type=file.content_type,
        size=size,
        owner_id=user_id,
        folder_id=folder_id_int
    )
    db.add(db_file)

    # Update folder's date_modified if applicable
    if folder:
        folder.date_modified = datetime.utcnow()

    db.commit()
    db.refresh(db_file)

    return {
        "file_id": file_id,
        "mime_type": file.content_type,
        "size": size,
        "folder_id": folder_id_int
    }



@router.post(
    "/upload_zip_file",
    response_model=FolderDetails,
    tags=["Upload"],
    summary="Upload a ZIP file into an optional folder"
)
async def upload_zip_file(
    zip_file: UploadFile = File(...),
    folder_id: Optional[int] = Query(
        default=None,
        description="Optional ID of the parent folder to upload the ZIP contents into"
    ),
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
) -> FolderDetails:
    """
    Uploads a ZIP file and extracts its contents (files and folders) recursively.
    
    - If `folder_id` is provided, the ZIP contents will be uploaded into that folder.
    - The ZIP file structure is preserved, and nested folders/files are created accordingly in the database.
    - All files are uploaded to MinIO and associated metadata is stored in PostgreSQL.

    Args:
        zip_file (UploadFile): The ZIP file to upload.
        folder_id (Optional[int]): Optional ID of the folder to upload into.
        db (Session): SQLAlchemy database session.
        current_user_id (int): ID of the currently authenticated user.

    Returns:
        FolderDetails: A detailed schema of the root folder created from the ZIP, including all subfolders and files.
    """
    if not zip_file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only .zip files are supported.")

    parent_folder: Optional[models.Folder] = None
    if folder_id is not None:
        parent_folder = db.query(models.Folder).filter(
            models.Folder.id == folder_id,
            models.Folder.owner_id == current_user_id
        ).first()
        if not parent_folder:
            raise HTTPException(status_code=404, detail="Parent folder not found or access denied.")

    with tempfile.TemporaryDirectory() as temp_dir:
        zip_path = os.path.join(temp_dir, zip_file.filename)
        with open(zip_path, "wb") as f:
            f.write(await zip_file.read())

        with ZipFile(zip_path, "r") as zip_ref:
            zip_ref.extractall(temp_dir)

        # Create a root folder named after the ZIP
        zip_root_name = os.path.splitext(zip_file.filename)[0]
        db_root_folder = models.Folder(
            name=zip_root_name,
            owner_id=current_user_id,
            parent_id=parent_folder.id if parent_folder else None
        )
        db.add(db_root_folder)
        db.commit()
        db.refresh(db_root_folder)

        def process_entry(abs_path: str, rel_path: str, parent: Optional[models.Folder]):
            """
            Recursive function to process a file or directory inside the ZIP.
            """
            if os.path.isdir(abs_path):
                new_folder = models.Folder(
                    name=os.path.basename(abs_path),
                    owner_id=current_user_id,
                    parent_id=parent.id if parent else db_root_folder.id
                )
                db.add(new_folder)
                db.commit()
                db.refresh(new_folder)

                for item in os.listdir(abs_path):
                    child_abs = os.path.join(abs_path, item)
                    child_rel = os.path.join(rel_path, item)
                    process_entry(child_abs, child_rel, new_folder)
            else:
                file_id = str(uuid.uuid4())
                with open(abs_path, "rb") as f:
                    upload_file(f, file_id)

                size = os.path.getsize(abs_path)
                mime_type = mimetypes.guess_type(abs_path)[0] or "application/octet-stream"

                db_file = models.File(
                    id=file_id,
                    filename=os.path.basename(abs_path),
                    mime_type=mime_type,
                    size=size,
                    owner_id=current_user_id,
                    folder_id=parent.id if parent else db_root_folder.id
                )
                db.add(db_file)
                db.commit()

        # Traverse all items in the extracted temp_dir (excluding the zip file itself)
        for item in os.listdir(temp_dir):
            if item == zip_file.filename:
                continue
            item_abs = os.path.join(temp_dir, item)
            process_entry(item_abs, item, None)

    db.refresh(db_root_folder)

    return FolderDetails(
        id=db_root_folder.id,
        name=db_root_folder.name,
        owner_id=db_root_folder.owner_id,
        parent_id=db_root_folder.parent_id,
        created_at=db_root_folder.created_at,
        date_modified=db_root_folder.date_modified,
        files=[FileInfo.model_validate(f) for f in db_root_folder.files],
        subfolders=[SubFolderInfo.model_validate(sf) for sf in db_root_folder.subfolders],
        item_count=len(db_root_folder.files) + len(db_root_folder.subfolders)
    )