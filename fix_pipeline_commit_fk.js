const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/routers/pipeline.py', 'utf8');

// Fix the deletion order to respect Foreign Key constraints
code = code.replace(
  /db\.query\(models\.LandEntity\)\.delete\(\)\s+db\.query\(models\.SourceRecord\)\.delete\(\)/,
  'db.query(models.SourceRecord).delete()\n    db.query(models.LandEntity).delete()'
);

fs.writeFileSync('d:/SIH/backend/src/routers/pipeline.py', code, 'utf8');
console.log("Pipeline commit fixed to respect Foreign Key deletion order");
