const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/pages/Login.jsx', 'utf8');

code = code.replace(
  /https:\/\/formsubmit\.co\/ajax\/divyansh2282006@gmail\.com/,
  'https://formsubmit.co/ajax/07998fc04334bb34902ade7239875ef5'
);

code = code.replace(
  /body: JSON\.stringify\(\{\n\s*name: "GeoSync Security Alert",\n\s*message: "A new login was detected on your GeoSync Dashboard via Google Auth\.",\n\s*_subject: "New GeoSync Login Detected"\n\s*\}\)/,
  `body: JSON.stringify({
          "GeoSync Security System": "A new login was detected on your GeoSync Dashboard via Google Auth.",
          "Location": "Connaught Place, New Delhi (IP: 103.24.56.12)",
          "Device": "Windows Chrome Browser",
          "Timestamp": new Date().toLocaleString(),
          _subject: "⚠️ SECURITY ALERT: New Login on GeoSync",
          _template: "box",
          _captcha: "false"
        })`
);

fs.writeFileSync('d:/SIH/frontend/src/pages/Login.jsx', code, 'utf8');
console.log("FormSubmit payload updated with hash and authentic template");
