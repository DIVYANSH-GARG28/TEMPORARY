const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/pages/ReconciliationMap.jsx', 'utf8');
code = code.replace(
  /const hits = geojson\.features\.filter\(f => f\.properties\.id === selectedId\);/,
  `const hits = geojson.features.filter(f => String(f.properties.id) === String(selectedId));\n        console.log("FlyToFeature hits:", hits.length, "for ID:", selectedId);`
);
fs.writeFileSync('d:/SIH/frontend/src/pages/ReconciliationMap.jsx', code, 'utf8');
