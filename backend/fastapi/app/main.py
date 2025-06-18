import io
import uuid
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db import models, database
from app.db.database import get_db
from app.auth import jwt, users
from app.auth.jwt import get_current_user_id
from app.routes import files, folders, favorites
from app.storage import minio_client


app = FastAPI(
    title="FileForge - Distributed File Management API",
    description="A FastAPI-based backend service for managing users, nested folders, and file uploads using MinIO for object storage.",
    version="1.0.0"
)


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(files.router)
app.include_router(folders.router)
app.include_router(favorites.router)

# Initialize database schema
models.Base.metadata.create_all(bind=database.engine)

# Create MinIO bucket
minio_client.create_bucket()



@app.get("/health", tags=["Health Check"])
def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }



@app.post("/register", summary="Register a new user", tags=["Auth"])
def register(
    username: str = Form(..., description="Unique username to register"),
    password: str = Form(..., description="Password for the new user"),
    db: Session = Depends(get_db)
):
    """
    Register a new user with a unique username and password.

    Args:
        username (str): Desired username, must be unique.
        password (str): Password for the user account.
        db (Session): SQLAlchemy session dependency.

    Raises:
        HTTPException: If the username already exists.
    """
    # Check if username already exists
    db_user = users.get_user(db, username=username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Create new user
    users.create_user(db, username=username, password=password)
    return {"msg": "User created successfully"}



@app.post("/login", summary="Login and retrieve access token", tags=["Auth"])
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Authenticate user and issue a JWT access token.

    Args:
        form_data (OAuth2PasswordRequestForm): Form data containing `username` and `password`.
        db (Session): SQLAlchemy session dependency.

    Raises:
        HTTPException: If authentication fails.

    Returns:
        dict: Access token and token type.
    """
    # Retrieve user by username
    db_user = users.get_user(db, username=form_data.username)

    # Validate user credentials
    if not db_user or not jwt.verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generate JWT access token
    access_token = jwt.create_access_token(data={"sub": db_user.username})
    return {"access_token": access_token, "token_type": "bearer"}



@app.post("/upload_files")
def upload_files(
    file: UploadFile = File(...),
    folder_id: str | None = Query(default=None, description="Optional folder ID to associate with the file"),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    # Validate folder_id if provided
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