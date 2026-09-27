const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/ingest_india_data.py', 'utf8');

code = code.replace(/db\.query\(models\.ReviewTask\)\.delete\(\)/g, "");
fs.writeFileSync('d:/SIH/backend/src/ingest_india_data.py', code, 'utf8');
console.log("ingest_india_data.py fixed");
