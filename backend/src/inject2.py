
from src.database import engine, Base, SessionLocal
from src.models import models
from src.routers.reconciliation import trigger_reconciliation

db = SessionLocal()
cad = models.Dataset(name="Test", source_type="cadastral", status="processed")
db.add(cad)
db.commit()
db.refresh(cad)

b = models.SourceRecord(
    dataset_id=cad.id,
    source_record_id="CP-1",
    source_type="cadastral",
    original_geometry="SRID=4326;POLYGON((77.215 28.632, 77.216 28.632, 77.216 28.633, 77.215 28.633, 77.215 28.632))",
    attributes={"owner_name": "Rajesh Sharma"}
)
db.add(b)
db.commit()

trigger_reconciliation(db)
print("Done inserting via Node.")
