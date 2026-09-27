const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/pages/DataPipeline.jsx', 'utf8');

code = code.replace(
  /onChange=\{\(e\) => \{ if \(e\.target\.files\.length\) \n?setStep\(2\); \}\}/,
  'onChange={(e) => { if (e.target.files.length) loadDemoData(); }}'
);

fs.writeFileSync('d:/SIH/frontend/src/pages/DataPipeline.jsx', code, 'utf8');
console.log("File upload fixed to load demo data seamlessly");
