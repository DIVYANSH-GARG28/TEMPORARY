const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/routers/pipeline.py', 'utf8');

const arcLogic = `
    transformer = pyproj.Transformer.from_crs("EPSG:4326", "EPSG:3857", always_xy=True)
    center_lon, center_lat = 77.2184, 28.6328
    cx, cy = transformer.transform(center_lon, center_lat)
    
    buildings = [
        {"owner": "M/S Aggarwal Traders Pvt Ltd", "id": "SVY-2023-A1", "area": 145.2, "ghost": False, "start": 0.1, "end": 0.9},
        {"owner": "Delhi Properties Council", "id": "SVY-2023-B2", "area": 210.5, "ghost": False, "start": 1.1, "end": 1.9},
        {"owner": "Sri Balaji Enclave Trust", "id": "SVY-2023-C3", "area": 189.0, "ghost": False, "start": 2.1, "end": 2.9},
        {"owner": "Rajiv Kumar & Sons", "id": "SVY-2023-D4", "area": 95.5, "ghost": False, "start": 3.2, "end": 4.0},
        {"owner": "New Delhi Municipal Corp", "id": "SVY-2023-E5", "area": 320.1, "ghost": False, "start": 4.2, "end": 5.0},
        {"owner": "Kapoor Hospitality Ventures", "id": "SVY-2023-F6", "area": 175.8, "ghost": False, "start": 5.2, "end": 6.0},
        # Ghost Buildings!
        {"owner": "Unknown Encroachment A", "id": "GHOST-01", "area": 845.0, "ghost": True, "start": 0.3, "end": 0.7, "rin": 160, "rout": 180},
        {"owner": "Unknown Encroachment B", "id": "GHOST-02", "area": 1250.5, "ghost": True, "start": 3.4, "end": 3.8, "rin": 160, "rout": 190}
    ]
    
    def get_arc(cx, cy, rin, rout, a1, a2, steps=8):
        pts = []
        for i in range(steps+1):
            a = a1 + (a2-a1)*i/steps
            pts.append((cx + rout*math.cos(a), cy + rout*math.sin(a)))
        for i in range(steps+1):
            a = a2 - (a2-a1)*i/steps
            pts.append((cx + rin*math.cos(a), cy + rin*math.sin(a)))
        pts.append(pts[0])
        return pts

    for b in buildings:
        rin = b.get('rin', 90.0)
        rout = b.get('rout', 130.0)
        pts = get_arc(cx, cy, rin, rout, b['start'], b['end'])
        
        cad_pts_str = ", ".join([f"{px} {py}" for px, py in pts])
        poly_cad = f"SRID=3857;POLYGON(({cad_pts_str}))"
        
        rec_cad = models.SourceRecord(
            dataset_id=cad_ds.id, source_record_id=f"CAD-{b['id']}", source_type="cadastral",
            original_geometry=poly_cad, original_attributes={"owner_name": b['owner'], "survey_no": b['id'], "area_sqm": b['area']}
        )
        db.add(rec_cad)
        
        if not b['ghost']:
            # Municipal is shifted slightly radially and angularly to create conflict
            shift_r = random.uniform(-4.0, 4.0)
            shift_a = random.uniform(-0.02, 0.02)
            mun_pts = get_arc(cx, cy, rin + shift_r, rout + shift_r, b['start'] + shift_a, b['end'] + shift_a)
            mun_pts_str = ", ".join([f"{px} {py}" for px, py in mun_pts])
            poly_mun = f"SRID=3857;POLYGON(({mun_pts_str}))"
            rec_mun = models.SourceRecord(
                dataset_id=mun_ds.id, source_record_id=f"MUN-{b['id']}", source_type="municipal",
                original_geometry=poly_mun, original_attributes={"owner_name": b['owner'], "survey_no": b['id'], "area_sqm": b['area']}
            )
            db.add(rec_mun)
            
    db.commit()
`;

code = code.replace(
    /    transformer = pyproj\.Transformer\.from_crs\("EPSG:4326", "EPSG:3857", always_xy=True\)[\s\S]*?db\.commit\(\)\s*trigger_reconciliation\(db=db\)/,
    arcLogic.trim() + '\n    trigger_reconciliation(db=db)'
);

fs.writeFileSync('d:/SIH/backend/src/routers/pipeline.py', code, 'utf8');
console.log("Arcs fixed");
