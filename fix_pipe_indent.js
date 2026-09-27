const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/routers/pipeline.py', 'utf8');

code = code.replace(/^transformer = pyproj\.Transformer/m, '    transformer = pyproj.Transformer');

fs.writeFileSync('d:/SIH/backend/src/routers/pipeline.py', code, 'utf8');
console.log("Fixed pipeline indentation");
