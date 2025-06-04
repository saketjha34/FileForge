# app/crud/users.py
from sqlalchemy.orm import Session
from app.db import models
from app.auth import jwt


def get_user(db: Session, username: str):
    """
    Retrieve a user from the database by username.

    Args:
        db (Session): SQLAlchemy database session.
        username (str): Username of the user to retrieve.

    Returns:
        User | None: The User object if found, otherwise None.
    """
    return db.query(models.User).filter(models.User.username == username).first()


def create_user(db: Session, username: str, password: str):
    """
    Create a new user with a hashed password and store in the database.

    Args:
        db (Session): SQLAlchemy database session.
        username (str): Username for the new user.
        password (str): Plain-text password for the new user.

    Returns:
        User: The newly created User object.
    """
    # Hash the user's password for secure storage
    hashed_password = jwt.get_password_hash(password)

    # Create a new user model instance
    db_user = models.User(username=username, hashed_password=hashed_password)

    # Persist to the database
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user