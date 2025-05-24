import io
import uuid
from fastapi import Form
from fastapi import status
from app.routes import files 
from app.auth import jwt, users
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models, database
from app.storage import minio_client
from app.auth.jwt import get_current_user_id
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(files.router)
models.Base.metadata.create_all(bind=database.engine)
minio_client.create_bucket()


@app.post("/register")
def register(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    db_user = users.get_user(db, username=username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    users.create_user(db, username=username, password=password)
    return {"msg": "User created successfully"}



@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    db_user = users.get_user(db, username=form_data.username)
    if not db_user or not jwt.verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = jwt.create_access_token(data={"sub": db_user.username})
    return {"access_token": access_token, "token_type": "bearer"}



@app.post("/upload")
def upload(file: UploadFile = File(...), db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    file_id = str(uuid.uuid4())
    minio_client.upload_file(file.file, file_id)

    # Reset pointer for size reading
    file.file.seek(0, 2)  # Seek to end
    size = file.file.tell()
    file.file.seek(0)     # Reset to beginning

    db_file = models.File(
        id=file_id,
        filename=file.filename,
        mime_type=file.content_type,
        size=size,
        owner_id=user_id,
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return {"file_id": file_id, "mime_type": file.content_type, "size": size}



@app.get("/download/{file_id}", summary="Download your file Using ID", tags=["Files"])
def download_file(
    file_id: str,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Download a file only if it belongs to the authenticated user.
    Ensures secure access to personal files.
    """
    # Ensure the file belongs to the current user
    db_file = db.query(models.File).filter(
        models.File.id == file_id,
        models.File.owner_id == user_id
    ).first()

    if not db_file:
        raise HTTPException(status_code=404, detail="File not found or access denied")

    try:
        file_data = minio_client.download_file(file_id)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to retrieve file from storage")

    return StreamingResponse(
        io.BytesIO(file_data.read()),
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename={db_file.filename}"}
    )