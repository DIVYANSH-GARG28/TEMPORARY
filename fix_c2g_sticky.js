const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/pages/CitizenPortal.jsx', 'utf8');

code = code.replace(
  /<strong>📌 Future Scope:<\/strong> This G2C Portal will be integrated with <strong>DigiLocker<\/strong> to securely pull <strong>Aadhaar<\/strong> data for instant, biometric-backed property linking and verification\./,
  "<strong>📌 Future Scope (Aadhaar Integration):</strong> This G2C Portal will be integrated with <strong>DigiLocker</strong> to securely pull <strong>Aadhaar</strong> data for instant, biometric-backed property linking.<br/><br/><em>(Demo: Type <strong>123456789</strong> below to see how a verified Aadhaar property card will look)</em>"
);

fs.writeFileSync('d:/SIH/frontend/src/pages/CitizenPortal.jsx', code, 'utf8');
console.log("Citizen portal sticky note updated with demo instruction");
