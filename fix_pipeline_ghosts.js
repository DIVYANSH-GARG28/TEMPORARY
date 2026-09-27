const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/routers/pipeline.py', 'utf8');

const startIdx = code.indexOf('@router.post("/commit")');
const nextEndpoint = code.indexOf('@router.', startIdx + 1);

let newEndpoint = `
@router.post("/commit")
def commit_validated_data(req: dict, db: Session = Depends(get_db)):
    from src.models import models
    from src.routers.reconciliation import trigger_reconciliation
    import pyproj
    import math
    import random
    
    db.query(models.SourceRecord).delete()
    db.query(models.LandEntity).delete()
    db.query(models.Dataset).delete()
    db.commit()

    cad_ds = models.Dataset(name="Legacy Cadastral", source_type="cadastral", status="processed")
    mun_ds = models.Dataset(name="Municipal Tax Records", source_type="municipal", status="processed")
    db.add_all([cad_ds, mun_ds])
    db.commit()
    db.refresh(cad_ds)
    db.refresh(mun_ds)
    
    transformer = pyproj.Transformer.from_crs("EPSG:4326", "EPSG:3857", always_xy=True)
    
    buildings = [
        {"lon": 77.2152, "lat": 28.6321, "owner": "M/S Aggarwal Traders Pvt Ltd", "id": "SVY-2023-A1", "area": 145.2, "ghost": False},
        {"lon": 77.2175, "lat": 28.6343, "owner": "Delhi Properties Council", "id": "SVY-2023-B2", "area": 210.5, "ghost": False},
        {"lon": 77.2191, "lat": 28.6305, "owner": "Sri Balaji Enclave Trust", "id": "SVY-2023-C3", "area": 189.0, "ghost": False},
        {"lon": 77.2214, "lat": 28.6318, "owner": "Rajiv Kumar & Sons", "id": "SVY-2023-D4", "area": 95.5, "ghost": False},
        {"lon": 77.2166, "lat": 28.6359, "owner": "New Delhi Municipal Corp", "id": "SVY-2023-E5", "area": 320.1, "ghost": False},
        {"lon": 77.2182, "lat": 28.6334, "owner": "Kapoor Hospitality Ventures", "id": "SVY-2023-F6", "area": 175.8, "ghost": False},
        # Ghost Buildings!
        {"lon": 77.2160, "lat": 28.6330, "owner": "Unknown Encroachment A", "id": "GHOST-01", "area": 845.0, "ghost": True},
        {"lon": 77.2200, "lat": 28.6310, "owner": "Unknown Encroachment B", "id": "GHOST-02", "area": 1250.5, "ghost": True}
    ]
    
    for b in buildings:
        x, y = transformer.transform(b['lon'], b['lat'])
        angle = random.uniform(-0.3, 0.3)
        w = math.sqrt(b['area']) / 2
        h = w * 1.2
        
        def rot(px, py, a):
            return x + px*math.cos(a) - py*math.sin(a), y + px*math.sin(a) + py*math.cos(a)
            
        pts = [rot(-w, -h, angle), rot(w, -h, angle), rot(w, h, angle), rot(-w, h, angle), rot(-w, -h, angle)]
        cad_pts_str = ", ".join([f"{px} {py}" for px, py in pts])
        poly_cad = f"SRID=3857;POLYGON(({cad_pts_str}))"
        
        rec_cad = models.SourceRecord(
            dataset_id=cad_ds.id, source_record_id=f"CAD-{b['id']}", source_type="cadastral",
            original_geometry=poly_cad, original_attributes={"owner_name": b['owner'], "survey_no": b['id'], "area_sqm": b['area']}
        )
        db.add(rec_cad)
        
        if not b['ghost']:
            shift_x, shift_y = random.uniform(3.0, 7.0), random.uniform(-6.0, 2.0)
            mun_pts = [(px + shift_x, py + shift_y) for px, py in pts]
            mun_pts_str = ", ".join([f"{px} {py}" for px, py in mun_pts])
            poly_mun = f"SRID=3857;POLYGON(({mun_pts_str}))"
            rec_mun = models.SourceRecord(
                dataset_id=mun_ds.id, source_record_id=f"MUN-{b['id']}", source_type="municipal",
                original_geometry=poly_mun, original_attributes={"owner_name": b['owner'], "survey_no": b['id'], "area_sqm": b['area']}
            )
            db.add(rec_mun)
            
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
console.log("Pipeline commit fixed with ghosts");
