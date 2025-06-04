from sqlalchemy import create_engine
import sqlalchemy
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create engine using the PostgreSQL URL from settings
engine = create_engine(settings.POSTGRES_URL)

# Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for ORM models
Base = sqlalchemy.orm.declarative_base()

# Dependency function to get a DB session
def get_db():
    """
    Dependency function to provide a SQLAlchemy database session.

    This function yields a database session that is automatically closed
    after the request is completed. Used with FastAPI's `Depends()`.

    Yields:
        Session: SQLAlchemy session object.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()