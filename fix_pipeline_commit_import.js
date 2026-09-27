const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/routers/pipeline.py', 'utf8');

code = code.replace(
  /trigger_reconciliation\(db=db\)/g,
  'from src.routers.reconciliation import trigger_reconciliation\n    trigger_reconciliation(db=db)'
);

fs.writeFileSync('d:/SIH/backend/src/routers/pipeline.py', code, 'utf8');
console.log("Pipeline commit fixed with missing import");
