const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/ingest_india_data.py', 'utf8');

const lines = code.split('\n');
// We want to replace lines 93-97 with nothing
lines.splice(92, 6);

fs.writeFileSync('d:/SIH/backend/src/ingest_india_data.py', lines.join('\n'), 'utf8');
console.log("Lines deleted");
