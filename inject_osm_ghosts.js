const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/routers/ingest.py', 'utf8');

const ghostInjection = `
    # INJECT GHOST BUILDINGS FOR OSM DEMO
    ghost_geom_1 = "SRID=3857;POLYGON((8595900 3328500, 8596000 3328500, 8596000 3328600, 8595900 3328600, 8595900 3328500))"
    ghost_geom_2 = "SRID=3857;POLYGON((8596100 3328700, 8596200 3328700, 8596200 3328800, 8596100 3328800, 8596100 3328700))"
    
    db.add(models.SourceRecord(
        dataset_id=cad_ds.id, source_record_id="OSM-GHOST-1", source_type="cadastral", source_authority_weight=0.9,
        original_attributes={"owner_name": "Massive Encroachment A", "land_use": "Commercial", "area_cad": 1500.5, "source": "Drone Survey"},
        original_geometry=ghost_geom_1
    ))
    db.add(models.SourceRecord(
        dataset_id=cad_ds.id, source_record_id="OSM-GHOST-2", source_type="cadastral", source_authority_weight=0.9,
        original_attributes={"owner_name": "Massive Encroachment B", "land_use": "Commercial", "area_cad": 2200.0, "source": "Drone Survey"},
        original_geometry=ghost_geom_2
    ))
    db.commit()
`;

code = code.replace(/db\.commit\(\)\s*return \{\s*"message": "Successfully fetched/, ghostInjection + '\n    return {\n        "message": "Successfully fetched');

fs.writeFileSync('d:/SIH/backend/src/routers/ingest.py', code, 'utf8');
console.log("OSM Ghosts injected");
