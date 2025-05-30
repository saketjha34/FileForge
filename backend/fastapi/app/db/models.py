from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base  

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    date_modified = Column(DateTime, nullable=True)

    files = relationship("File", back_populates="user")


class File(Base):
    __tablename__ = "files"

    id = Column(String, primary_key=True, index=True)
    filename = Column(String)
    mime_type = Column(String)    
    size = Column(Integer)
    owner_id = Column(Integer, ForeignKey("users.id"))
    upload_time = Column(DateTime, default=datetime.utcnow)
    date_modified = Column(DateTime, nullable=True)

    folder_id = Column(Integer, ForeignKey("folders.id"), nullable=True)

    user = relationship("User", back_populates="files")
    folder = relationship("Folder", back_populates="files")


class Folder(Base):
    __tablename__ = "folders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("folders.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    date_modified = Column(DateTime, nullable=True)

    owner = relationship("User", backref="folders")
    parent = relationship("Folder", remote_side=[id], backref="subfolders")
    files = relationship("File", back_populates="folder")