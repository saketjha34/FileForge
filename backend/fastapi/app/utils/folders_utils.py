from sqlalchemy.orm import Session
from app.db import models
from app.storage import minio_client  


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