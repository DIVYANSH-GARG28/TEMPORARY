const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/ingest_india_data.py', 'utf8');

code = code.replace(/source_id=f"CAD-/g, 'source_record_id=f"CAD-');
code = code.replace(/source_id=f"MUN-/g, 'source_record_id=f"MUN-');

fs.writeFileSync('d:/SIH/backend/src/ingest_india_data.py', code, 'utf8');
console.log("source_id replaced with source_record_id");
