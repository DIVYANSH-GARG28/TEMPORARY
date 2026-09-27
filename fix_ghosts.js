const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/routers/pipeline.py', 'utf8');

code = code.replace(/"rin": 230, "rout": 270/g, '"rin": 260, "rout": 310');

fs.writeFileSync('d:/SIH/backend/src/routers/pipeline.py', code, 'utf8');
console.log("Ghost buildings moved further out");
