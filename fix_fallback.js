const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/routers/citizen.py', 'utf8');

code = code.replace(/demo_entity = db\.query\(LandEntity\)\.filter\(LandEntity\.status == "AUTO_ACCEPT"\)\.first\(\)/, 'demo_entity = db.query(LandEntity).first()');

fs.writeFileSync('d:/SIH/backend/src/routers/citizen.py', code, 'utf8');
console.log("Fallback fixed");
