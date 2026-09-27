const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/routers/pipeline.py', 'utf8');

code = code.replace(/"LAND_USE": "Commercial"\}/g, '"LAND_USE": "Commercial", "geometry": "POLYGON((77.218 28.632, 77.219 28.632, 77.219 28.633, 77.218 28.633, 77.218 28.632))"}');
code = code.replace(/"LAND_USE": "Residential"\}/g, '"LAND_USE": "Residential", "geometry": "POLYGON((77.218 28.632, 77.219 28.632, 77.219 28.633, 77.218 28.633, 77.218 28.632))"}');

fs.writeFileSync('d:/SIH/backend/src/routers/pipeline.py', code, 'utf8');
console.log("Geom forced");
