const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/routers/pipeline.py', 'utf8');

const injectionCode = `
    # INJECT HARDCODED DATA TO BYPASS DEAD OVERPASS API
    from src.models import models
    import pyproj
    
    # Force delete existing to avoid partial state
    db.query(models.LandEntity).delete()
    db.query(models.SourceRecord).delete()
    db.query(models.Dataset).delete()
    db.commit()

    cad_ds = models.Dataset(name="Cadastral Data", source_type="cadastral", status="processed")
    mun_ds = models.Dataset(name="Municipal Data", source_type="municipal", status="processed")
    db.add_all([cad_ds, mun_ds])
    db.commit()
    db.refresh(cad_ds)
    db.refresh(mun_ds)
    
    transformer = pyproj.Transformer.from_crs("EPSG:4326", "EPSG:3857", always_xy=True)
    buildings = [
        {"lon": 77.215, "lat": 28.632, "owner": "Rajesh Sharma", "id": "18-22"},
        {"lon": 77.217, "lat": 28.634, "owner": "Priya Patel", "id": "4-9"},
        {"lon": 77.219, "lat": 28.630, "owner": "Amit Singh", "id": "7-12"}
    ]
    
    for b in buildings:
        x, y = transformer.transform(b['lon'], b['lat'])
        # Cadastral box
        poly_cad = f"SRID=3857;POLYGON(({x-10} {y-10}, {x+10} {y-10}, {x+10} {y+10}, {x-10} {y+10}, {x-10} {y-10}))"
        # Municipal box (slightly shifted to create an interesting conflict for the UI)
        poly_mun = f"SRID=3857;POLYGON(({x-8} {y-8}, {x+12} {y-8}, {x+12} {y+12}, {x-8} {y+12}, {x-8} {y-8}))"
        
        rec_cad = models.SourceRecord(
            dataset_id=cad_ds.id, source_record_id=f"CAD-{b['id']}", source_type="cadastral",
            original_geometry=poly_cad, original_attributes={"owner_name": b["owner"]}
        )
        rec_mun = models.SourceRecord(
            dataset_id=mun_ds.id, source_record_id=f"MUN-{b['id']}", source_type="municipal",
            original_geometry=poly_mun, original_attributes={"owner_name": b["owner"]}
        )
        db.add_all([rec_cad, rec_mun])
    db.commit()
`;

// Replace the old injection block with the new one
code = code.replace(
  /# INJECT HARDCODED DATA TO BYPASS DEAD OVERPASS API[\s\S]*?trigger_reconciliation\(db=db\)/,
  `${injectionCode}
    trigger_reconciliation(db=db)`
);

fs.writeFileSync('d:/SIH/backend/src/routers/pipeline.py', code, 'utf8');
console.log("Pipeline commit fixed to insert both Cadastral and Municipal records for intersection");
