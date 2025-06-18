from sqlalchemy.orm import Session
from app.db import models
from app.storage import minio_client  
from fastapi import HTTPException
import os, uuid
from datetime import datetime
from mimetypes import guess_type
from app.storage.minio_client import upload_file


def delete_folder_recursive(db: Session, folder_id: int, user_id: int):
    # Get all subfolders of this folder
    subfolders = db.query(models.Folder).filter(
        models.Folder.parent_id == folder_id,
        models.Folder.owner_id == user_id
    ).all()

    # Recursively delete all subfolders
    for subfolder in subfolders:
        delete_folder_recursive(db, subfolder.id, user_id)

    # Delete all files inside this folder
    files = db.query(models.File).filter(
        models.File.folder_id == folder_id,
        models.File.owner_id == user_id
    ).all()

    for file in files:
        # Delete from MinIO storage
        try:
            minio_client.delete_file(file.id)
        except Exception as e:
            # Optionally log the error but continue with deletion
            print(f"Failed to delete file {file.id} from MinIO: {e}")

        # Delete from DB
        db.delete(file)

    # Delete this folder itself
    folder = db.query(models.Folder).filter(
        models.Folder.id == folder_id,
        models.Folder.owner_id == user_id
    ).first()
    if folder:
        db.delete(folder)
        

def create_folder_recursive(
    base_path: str,
    rel_path: str,
    parent_folder: models.Folder | None,
    db: Session,
    owner_id: int
) -> models.Folder:
    """
    Recursively create folders/files in DB and upload files to MinIO.
    """
    abs_path = os.path.join(base_path, rel_path)

    folder = models.Folder(
        name=os.path.basename(rel_path),
        parent_id=parent_folder.id if parent_folder else None,
        owner_id=owner_id,
        created_at=datetime.utcnow(),
        date_modified=None
    )
    db.add(folder)
    db.commit()
    db.refresh(folder)

    for entry in os.listdir(abs_path):
        entry_path = os.path.join(abs_path, entry)
        entry_rel_path = os.path.join(rel_path, entry)

        if os.path.isdir(entry_path):
            create_folder_recursive(base_path, entry_rel_path, folder, db, owner_id)
        else:
            file_id = str(uuid.uuid4())
            with open(entry_path, "rb") as f:
                try:
                    upload_file(f, file_id)
                except Exception as e:
                    raise HTTPException(status_code=500, detail=f"Upload failed: {e}")

            file_size = os.path.getsize(entry_path)
            mime_type = guess_type(entry_path)[0] or "application/octet-stream"

            db_file = models.File(
                id=file_id,
                filename=entry,
                mime_type=mime_type,
                size=file_size,
                owner_id=owner_id,
                folder_id=folder.id,
                upload_time=datetime.utcnow(),
                date_modified=None
            )
            db.add(db_file)

    db.commit()
    return folder