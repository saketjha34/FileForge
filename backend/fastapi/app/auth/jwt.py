from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from app.core.config import settings
from sqlalchemy.orm import Session
from app.db import database, models

# -------------------------------
# Password hashing configuration
# -------------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# -------------------------------
# OAuth2 token retrieval setup
# -------------------------------
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


# Create access token
def create_access_token(data: dict) -> str:
    """
    Creates a JWT access token with expiration time.

    Args:
        data (dict): The data to encode in the token (e.g., {"sub": username})

    Returns:
        str: Encoded JWT token string
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


# Verify password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain password against its hashed version.

    Args:
        plain_password (str): User-provided password
        hashed_password (str): Stored hashed password

    Returns:
        bool: True if the password matches, else False
    """
    return pwd_context.verify(plain_password, hashed_password)


# Hash password
def get_password_hash(password: str) -> str:
    """
    Hashes a plain password using bcrypt.

    Args:
        password (str): User's plain password

    Returns:
        str: Hashed password
    """
    return pwd_context.hash(password)


def get_current_user_id(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)) -> int:
    """
    Dependency to extract and validate the current user's ID from JWT token.

    Args:
        token (str): Bearer token from the Authorization header
        db (Session): SQLAlchemy DB session

    Returns:
        int: The user ID of the authenticated user

    Raises:
        HTTPException: If token is invalid or user doesn't exist
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user.id