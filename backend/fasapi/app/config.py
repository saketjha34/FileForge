# config.py
import os
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

class MinioSettings(BaseModel):
    endpoint: str = Field(default=os.getenv("MINIO_ENDPOINT", "minio:9000"))
    access_key: str = Field(default=os.getenv("MINIO_ACCESS_KEY", "minioadmin"))
    secret_key: str = Field(default=os.getenv("MINIO_SECRET_KEY", "minioadmin"))
    bucket_name: str = Field(default=os.getenv("MINIO_BUCKET", "chunks"))

class PostgresSettings(BaseModel):
    url: str = Field(default=os.getenv("POSTGRES_URL", "postgresql://postgres:postgres@db:5432/postgres"))

class JWTSettings(BaseModel):
    secret_key: str = Field(default=os.getenv("JWT_SECRET_KEY", "your_jwt_secret"))
    algorithm: str = Field(default=os.getenv("JWT_ALGORITHM", "HS256"))
    expiration_minutes: int = Field(default=int(os.getenv("JWT_EXPIRATION_MINUTES", 30)))

class Settings(BaseModel):
    minio: MinioSettings = Field(default_factory=MinioSettings)
    postgres: PostgresSettings = Field(default_factory=PostgresSettings)
    jwt: JWTSettings = Field(default_factory=JWTSettings)

settings = Settings()