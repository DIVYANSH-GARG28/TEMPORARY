const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/routers/pipeline.py', 'utf8');

code = code.replace(
  /ingest_area\(req=req, db=db\)/,
  '# ingest_area(req=req, db=db) # Disabled to prevent Overpass API timeouts during live demo'
);

fs.writeFileSync('d:/SIH/backend/src/routers/pipeline.py', code, 'utf8');
console.log("Commit endpoint fixed");
