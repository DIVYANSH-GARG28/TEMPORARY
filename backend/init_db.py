import os
import time
from sqlalchemy import create_engine, text
from src.database import Base, engine
from src.models import models

def init_db():
    print("Waiting for database to be ready...")
    retries = 5
    while retries > 0:
        try:
            with engine.connect() as conn:
                # Ensure PostGIS extension is installed
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
                conn.commit()
            print("PostGIS extension ready.")
            break
        except Exception as e:
            print(f"Database not ready yet. Retrying in 5 seconds... ({e})")
            time.sleep(5)
            retries -= 1
            
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

if __name__ == "__main__":
    init_db()
