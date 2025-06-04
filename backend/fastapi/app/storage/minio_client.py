from minio import Minio
from minio.error import S3Error
from app.core.config import settings
import io
from fastapi import HTTPException
import logging


# Initialize the MinIO client
client = Minio(
    settings.MINIO_ENDPOINT,
    access_key=settings.MINIO_ROOT_USER,
    secret_key=settings.MINIO_ROOT_PASSWORD,
    secure=False  # Use True if HTTPS is enabled
)


def create_bucket():
    """
    Create the MinIO bucket if it doesn't exist.
    """
    try:
        if not client.bucket_exists(settings.MINIO_BUCKET):
            client.make_bucket(settings.MINIO_BUCKET)
    except S3Error as e:
        logging.error(f"Error creating bucket: {e}")
        raise RuntimeError(f"MinIO bucket creation failed: {e}")


def upload_file(file_data, file_name):
    """
    Upload a file object to MinIO.

    :param file_data: A file-like object (e.g., UploadFile.file)
    :param file_name: Unique file name (usually a UUID or hash)
    """
    try:
        file_bytes = file_data.read()
        file_data.seek(0)  # Reset pointer in case needed again
        file_length = len(file_bytes)
        client.put_object(
            bucket_name=settings.MINIO_BUCKET,
            object_name=file_name,
            data=io.BytesIO(file_bytes),
            length=file_length,
            part_size=10 * 1024 * 1024  # 10 MB chunks
        )
    except S3Error as e:
        logging.error(f"Error uploading file: {e}")
        raise RuntimeError(f"File upload failed: {e}")


def download_file(file_id: str):
    """
    Download a file object from MinIO by its file ID (used as object name).

    :param file_id: The UUID or unique object name stored in MinIO
    :return: A file-like object (stream)
    """
    try:
        return client.get_object(settings.MINIO_BUCKET, file_id)
    except S3Error as e:
        logging.error(f"Error downloading file with ID {file_id}: {e}")
        raise HTTPException(status_code=404, detail="File not found in storage")


def delete_file(file_name: str) -> None:
    """
    Deletes a file from the configured MinIO bucket.
    """
    client.remove_object(settings.MINIO_BUCKET, file_name)