from sqlalchemy import create_engine
import sqlalchemy
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Create engine using the PostgreSQL URL from settings
engine = create_engine(settings.postgres.url)

# Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for ORM models
Base = sqlalchemy.orm.declarative_base()

# Dependency function to get a DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
