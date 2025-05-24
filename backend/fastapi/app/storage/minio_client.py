from minio import Minio
from minio.error import S3Error
from app.config import settings
import io
from fastapi import HTTPException
import logging

# Initialize the MinIO client
client = Minio(
    settings.minio.endpoint,
    access_key=settings.minio.access_key,
    secret_key=settings.minio.secret_key,
    secure=False  # Use True if HTTPS is enabled
)

def create_bucket():
    """
    Create the MinIO bucket if it doesn't exist.
    """
    try:
        if not client.bucket_exists(settings.minio.bucket_name):
            client.make_bucket(settings.minio.bucket_name)
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
            bucket_name=settings.minio.bucket_name,
            object_name=file_name,
            data=io.BytesIO(file_bytes),
            length=file_length,
            part_size=10 * 1024 * 1024  # 10 MB chunks
        )
    except S3Error as e:
        logging.error(f"Error uploading file: {e}")
        raise RuntimeError(f"File upload failed: {e}")


def download_file(file_name):
    """
    Download a file object from MinIO.

    :param file_name: The file's object name in the bucket
    :return: A file-like object (stream)
    """
    try:
        return client.get_object(settings.minio.bucket_name, file_name)
    except S3Error as e:
        logging.error(f"Error downloading file: {e}")
        raise HTTPException(status_code=404, detail="File not found in storage")


def delete_file(file_name: str) -> None:
    """
    Deletes a file from the configured MinIO bucket.
    """
    client.remove_object(settings.minio.bucket_name, file_name)