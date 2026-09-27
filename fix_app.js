const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/App.jsx', 'latin1'); // Read as what powershell saved it as
// Actually, let's just use replace to fix the corrupted emojis!
code = code.replace(/dY(?:.|\n)*?Chief Approver/, '?? Chief Approver');
code = code.replace(/dYs(?:.|\n)*?Field Surveyor/, '????? Field Surveyor');
fs.writeFileSync('d:/SIH/frontend/src/App.jsx', code, 'utf8');
