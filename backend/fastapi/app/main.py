from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db import models, database
from app.db.database import get_db
from app.auth import jwt, users
from app.routes import files, folders, favorites, upload
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
app.include_router(upload.router)

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