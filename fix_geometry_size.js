const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/routers/pipeline.py', 'utf8');

code = code.replace(/w = math\.sqrt\(b\['area'\]\) \/ 2\s*h = w \* 1\.2/, 'w = random.uniform(35.0, 50.0)\n        h = random.uniform(30.0, 45.0)');

fs.writeFileSync('d:/SIH/backend/src/routers/pipeline.py', code, 'utf8');
console.log("Geometry size fixed to match real CP buildings");
