const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/pages/ReconciliationMap.jsx', 'utf8');

// Replace the FlyToFeature logic to be robust against layer remounts
code = code.replace(
  /if \(bounds\.isValid\(\)\) \{\s*map\.flyToBounds\(bounds, \{ padding: \[40, 40\], duration: 1\.5, maxZoom: 19 \}\);\s*\}/,
  `if (bounds.isValid()) {
          setTimeout(() => {
            map.flyToBounds(bounds, { padding: [40, 40], duration: 1.5, maxZoom: 19 });
          }, 100);
        }`
);
fs.writeFileSync('d:/SIH/frontend/src/pages/ReconciliationMap.jsx', code, 'utf8');
