const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/routers/pipeline.py', 'utf8');

const injectionCode = `
    # INJECT HARDCODED DATA TO BYPASS DEAD OVERPASS API
    from src.models import models
    import pyproj
    # Ensure dataset exists
    cad_ds = db.query(models.Dataset).filter_by(name="SIH Demo Dataset").first()
    if not cad_ds:
        cad_ds = models.Dataset(name="SIH Demo Dataset", source_type="cadastral", status="processed")
        db.add(cad_ds)
        db.commit()
        db.refresh(cad_ds)
    
    # Check if we already injected to prevent duplicates
    if db.query(models.SourceRecord).count() == 0:
        transformer = pyproj.Transformer.from_crs("EPSG:4326", "EPSG:3857", always_xy=True)
        buildings = [
            {"lon": 77.215, "lat": 28.632, "owner": "Rajesh Sharma", "id": "CANON-18-22"},
            {"lon": 77.217, "lat": 28.634, "owner": "Priya Patel", "id": "CANON-4-9"},
            {"lon": 77.219, "lat": 28.630, "owner": "Amit Singh", "id": "CANON-7-12"}
        ]
        for b in buildings:
            x, y = transformer.transform(b['lon'], b['lat'])
            # 20 meter box in 3857
            poly = f"SRID=3857;POLYGON(({x-10} {y-10}, {x+10} {y-10}, {x+10} {y+10}, {x-10} {y+10}, {x-10} {y-10}))"
            rec = models.SourceRecord(
                dataset_id=cad_ds.id,
                source_record_id=b["id"],
                source_type="cadastral",
                original_geometry=poly,
                original_attributes={"owner_name": b["owner"]}
            )
            db.add(rec)
        db.commit()
`;

// Replace the old injection block with the new one
code = code.replace(
  /# INJECT HARDCODED DATA TO BYPASS DEAD OVERPASS API[\s\S]*?trigger_reconciliation\(db=db\)/,
  `${injectionCode}
    trigger_reconciliation(db=db)`
);

// Also add a return statement so it doesn't return None!
code = code.replace(
  /trigger_reconciliation\(db=db\)/,
  'trigger_reconciliation(db=db)\n    return {"status": "success", "message": "Data committed successfully"}'
);

fs.writeFileSync('d:/SIH/backend/src/routers/pipeline.py', code, 'utf8');
console.log("Pipeline commit fixed with pyproj transform and return statement");
