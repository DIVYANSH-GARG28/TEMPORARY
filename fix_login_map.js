const fs = require('fs');

// 1. Fix map styling bug (id vs selectedId type mismatch and dimming)
let mapCode = fs.readFileSync('d:/SIH/frontend/src/pages/ReconciliationMap.jsx', 'utf8');
mapCode = mapCode.replace(
  /const isSelected = selectedId && id === selectedId;/,
  `const isSelected = selectedId && String(id) === String(selectedId);`
);
mapCode = mapCode.replace(
  /const isDimmed = selectedId && id !== selectedId;/,
  `const isDimmed = selectedId && String(id) !== String(selectedId);`
);
// Make dimmed features a bit more visible
mapCode = mapCode.replace(
  /if \(isDimmed\) return \{ fillColor: fill, fillOpacity: 0\.1, color: stroke, weight: 1, opacity: 0\.2, dashArray: source === 'municipal' \? '5,4' : '' \};/,
  `if (isDimmed) return { fillColor: fill, fillOpacity: 0.25, color: stroke, weight: 1.5, opacity: 0.5, dashArray: source === 'municipal' ? '5,4' : '' };`
);
fs.writeFileSync('d:/SIH/frontend/src/pages/ReconciliationMap.jsx', mapCode, 'utf8');

// 2. Fix Login.jsx to be foolproof
let loginCode = fs.readFileSync('d:/SIH/frontend/src/pages/Login.jsx', 'utf8');
loginCode = loginCode.replace(
  /if \(username && password === '1234'\) \{/,
  `if (password.trim() === '1234') {`
);
// Remove required attribute from username just in case it's causing issues
loginCode = loginCode.replace(
  /placeholder="Enter your ID \(e\.g\. admin\)"[\s\S]*?required/,
  `placeholder="Enter your ID (e.g. admin)"\n                style={{
                  width: '100%', padding: '10px 10px 10px 40px',
                  background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', color: 'white', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none'
                }}`
);
fs.writeFileSync('d:/SIH/frontend/src/pages/Login.jsx', loginCode, 'utf8');
console.log("Fixed map and login");
