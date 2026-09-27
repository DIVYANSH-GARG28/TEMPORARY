const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/routers/pipeline.py', 'utf8');

code = code.replace(/^trigger_reconciliation\(db=db\)/m, '    trigger_reconciliation(db=db)');

fs.writeFileSync('d:/SIH/backend/src/routers/pipeline.py', code, 'utf8');
console.log("Fixed indentation");
