const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/routers/reconciliation.py', 'utf8');

code = code.replace(/CAST\(original_attributes->>'area_sqm' AS float\)/g, "CAST(COALESCE(original_attributes->>'area_sqm', original_attributes->>'area_cad', '0') AS float)");

fs.writeFileSync('d:/SIH/backend/src/routers/reconciliation.py', code, 'utf8');
console.log("SQL fixed for area_cad");
