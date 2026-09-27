const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/routers/pipeline.py', 'utf8');

const fakeGeom = `, "geometry": "POLYGON((77.218 28.632, 77.219 28.632, 77.219 28.633, 77.218 28.633, 77.218 28.632))"}`;
code = code.replace(/, "LAND_USE": "[^"]+"\}/g, '$&'.replace('}', fakeGeom));

fs.writeFileSync('d:/SIH/backend/src/routers/pipeline.py', code, 'utf8');
console.log("Geom injected into demo data");
