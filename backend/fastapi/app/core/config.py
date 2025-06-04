from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    MINIO_ENDPOINT: str = Field(..., description="MinIO server endpoint URL, e.g. 'minio:9000'")
    MINIO_ROOT_USER: str = Field(..., description="MinIO root user access key")
    MINIO_ROOT_PASSWORD: str = Field(..., description="MinIO root user secret key")
    MINIO_BUCKET: str = Field(..., description="MinIO bucket name for storing files")

    POSTGRES_URL: str = Field(..., description="PostgreSQL database URL connection string")

    JWT_SECRET_KEY: str = Field(..., description="Secret key used to sign JWT tokens")
    JWT_ALGORITHM: str = Field(..., description="Algorithm used for JWT signing, e.g. 'HS256'")
    JWT_EXPIRATION_MINUTES: int = Field(..., description="JWT token expiration time in minutes")

    class Config:
        env_file = ".env"


settings = Settings()