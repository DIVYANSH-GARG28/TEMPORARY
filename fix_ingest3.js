const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/ingest_india_data.py', 'utf8');

// Find the "Clearing old data" block and safely comment everything out
code = code.replace(/print\("Clearing old data from database\.\.\."\)/g, "print('Skipping delete')");
code = code.replace(/db\.query\(models\.[A-Za-z]+\)\.delete\(\)/g, "pass");
code = code.replace(/db\.commit\(\)/g, "db.commit()");

fs.writeFileSync('d:/SIH/backend/src/ingest_india_data.py', code, 'utf8');
console.log("Fixed indentation and removed all delete queries");
