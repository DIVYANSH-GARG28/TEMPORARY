from src.database import engine, Base
from src.models.models import *
from sqlalchemy import text

def drop_all():
    with engine.begin() as conn:
        conn.execute(text('DROP TABLE IF EXISTS audit_logs, review_tasks, matches, parcel_observations, source_records, entity_conflicts, land_entities, datasets CASCADE;'))
    Base.metadata.create_all(bind=engine)
    print("Database recreated successfully.")

if __name__ == "__main__":
    drop_all()
