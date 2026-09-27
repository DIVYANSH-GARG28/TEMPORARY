const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/pages/ReconciliationMap.jsx', 'utf8');

// Remove the dimmed styling entirely so non-selected polygons look completely normal
code = code.replace(
  /if \(isDimmed\).*?;/,
  ``
);
// Ensure isSelected uses string comparison correctly and has high z-index via fill/color
code = code.replace(
  /if \(isSelected\) return \{ fillColor: '#0ea5e9', fillOpacity: 0\.9, color: '#ffffff', weight: 4, opacity: 1, dashArray: '' \};/,
  `if (isSelected) return { fillColor: '#0ea5e9', fillOpacity: 0.9, color: '#3b82f6', weight: 4, opacity: 1, dashArray: '' };`
);

fs.writeFileSync('d:/SIH/frontend/src/pages/ReconciliationMap.jsx', code, 'utf8');
console.log("Map dimming removed");
