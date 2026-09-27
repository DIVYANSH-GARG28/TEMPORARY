const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/ingest_india_data.py', 'utf8');

code = code.replace(/models\.ParcelObservation/g, "models.SourceRecord");
code = code.replace(/dataset_id=cad_ds\.id,/g, "dataset_id=cad_ds.id,\n                    source_type='cadastral',");
code = code.replace(/dataset_id=mun_ds\.id,/g, "dataset_id=mun_ds.id,\n                    source_type='municipal',");

fs.writeFileSync('d:/SIH/backend/src/ingest_india_data.py', code, 'utf8');
console.log("ParcelObservation replaced with SourceRecord");
