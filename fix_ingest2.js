const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/ingest_india_data.py', 'utf8');
code = code.replace(/db\.query\(models\.MatchResult\)\.delete\(\)\r?\n/g, "");
code = code.replace(/db\.query\(models\.SourceRecord\)\.delete\(\)\r?\n/g, "");
code = code.replace(/db\.query\(models\.LandEntity\)\.delete\(\)\r?\n/g, "");
code = code.replace(/db\.query\(models\.AuditLog\)\.delete\(\)\r?\n/g, "");
code = code.replace(/db\.query\(models\.EntityConflict\)\.delete\(\)\r?\n/g, "");
fs.writeFileSync('d:/SIH/backend/src/ingest_india_data.py', code, 'utf8');
