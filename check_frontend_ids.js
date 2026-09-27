const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/pages/ReconciliationMap.jsx', 'utf8');
if (code.includes('String(f.properties.id) === String(selectedId)')) {
  console.log("String coercion is present.");
} else {
  console.log("String coercion MISSING.");
}
