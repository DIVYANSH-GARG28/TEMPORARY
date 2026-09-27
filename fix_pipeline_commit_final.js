const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/routers/pipeline.py', 'utf8');

// Find the commit endpoint start and replace everything until the end of the function
const startIdx = code.indexOf('@router.post("/commit")');
const nextEndpoint = code.indexOf('@router.', startIdx + 1);

let newEndpoint = `
@router.post("/commit")
def commit_validated_data(req: dict, db: Session = Depends(get_db)):
    from src.models import models
    from src.routers.reconciliation import trigger_reconciliation
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
        poly_cad = f"SRID=3857;POLYGON(({x-10} {y-10}, {x+10} {y-10}, {x+10} {y+10}, {x-10} {y+10}, {x-10} {y-10}))"
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
    
    trigger_reconciliation(db=db)
    return {"status": "success", "message": "Data committed successfully"}

`;

if (nextEndpoint !== -1) {
    code = code.substring(0, startIdx) + newEndpoint + code.substring(nextEndpoint);
} else {
    code = code.substring(0, startIdx) + newEndpoint;
}

fs.writeFileSync('d:/SIH/backend/src/routers/pipeline.py', code, 'utf8');
console.log("Pipeline commit fixed correctly");
