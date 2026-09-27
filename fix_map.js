const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/pages/ReconciliationMap.jsx', 'utf8');

code = code.replace(
  /map\.flyToBounds\(bounds, \{ padding: \[40, 40\], duration: 1\.5, maxZoom: 19 \}\);/,
  `map.fitBounds(bounds, { padding: [40, 40], maxZoom: 19 });`
);

fs.writeFileSync('d:/SIH/frontend/src/pages/ReconciliationMap.jsx', code, 'utf8');
console.log("Map fixed");
