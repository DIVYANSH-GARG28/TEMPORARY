const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/pages/ReconciliationMap.jsx', 'utf8');

// Remove selectedMatchId from the key so it doesn't unmount the entire map when selected
code = code.replace(
  /<GeoJSON key=\{`\$\{featureCount\}-\$\{selectedMatchId \|\| ''\}-\$\{refreshKey\}`\}/,
  `<GeoJSON key={\`\${featureCount}-\${refreshKey}\`}`
);

fs.writeFileSync('d:/SIH/frontend/src/pages/ReconciliationMap.jsx', code, 'utf8');
console.log("Map key fixed");
