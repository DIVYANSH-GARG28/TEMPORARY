const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/App.jsx', 'utf8');

code = code.replace(
  /<option value="chief_approver">.*?<\/option>/,
  `<option value="chief_approver">{translations[lang]?.header.approver || "👑 Chief Approver"}</option>`
);
code = code.replace(
  /<option value="field_surveyor">.*?<\/option>/,
  `<option value="field_surveyor">{translations[lang]?.header.surveyor || "👨‍🔬 Field Surveyor"}</option>`
);

fs.writeFileSync('d:/SIH/frontend/src/App.jsx', code, 'utf8');
console.log("Emojis fixed");
