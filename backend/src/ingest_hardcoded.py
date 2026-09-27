from src.database import engine, Base, SessionLocal
from src.models import models
import json

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Hardcoded properties in Connaught Place to bypass dead Overpass API
cad_ds = models.Dataset(name="Real Cadastral India", source_type="cadastral", status="processed")
db.add(cad_ds)
db.commit()
db.refresh(cad_ds)

# 3 Hardcoded buildings in Connaught Place
buildings = [
    {"lon": 77.215, "lat": 28.632, "owner": "Rajesh Sharma", "id": "CP-1"},
    {"lon": 77.217, "lat": 28.634, "owner": "Priya Patel", "id": "CP-2"},
    {"lon": 77.219, "lat": 28.630, "owner": "Amit Singh", "id": "CP-3"}
]

for b in buildings:
    poly = f'{{"type": "Polygon", "coordinates": [[[{b["lon"]-0.0001}, {b["lat"]-0.0001}], [{b["lon"]+0.0001}, {b["lat"]-0.0001}], [{b["lon"]+0.0001}, {b["lat"]+0.0001}], [{b["lon"]-0.0001}, {b["lat"]+0.0001}], [{b["lon"]-0.0001}, {b["lat"]-0.0001}]]]}}'
    rec = models.SourceRecord(
        dataset_id=cad_ds.id,
        source_record_id=b["id"],
        source_type="cadastral",
        geometry_geojson=poly,
        attributes={"owner_name": b["owner"]}
    )
    db.add(rec)
db.commit()

from src.routers.reconciliation import trigger_reconciliation
trigger_reconciliation(db)
print("Hardcoded mock data inserted and reconciled.")
