# app/db.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base # Dùng declarative_base từ orm ở bản mới

# Cấu trúc: postgresql://[user]:[password]@[host]:[port]/[database_name]
DATABASE_URL = "postgresql://postgres:1511@localhost:5432/FastAPI"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()