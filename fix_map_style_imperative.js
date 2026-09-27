const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/pages/ReconciliationMap.jsx', 'utf8');

if (!code.includes('geoJsonRef')) {
  // Add useRef
  code = code.replace(/import React, \{ useState, useEffect, useCallback, useRef \} from 'react';/, "import React, { useState, useEffect, useCallback, useRef } from 'react';");
  
  // Add the ref inside ReconciliationMap
  code = code.replace(/const searchTimer = useRef\(null\);/, "const searchTimer = useRef(null);\n  const geoJsonRef = useRef(null);\n\n  useEffect(() => {\n    if (geoJsonRef.current && geojson) {\n      geoJsonRef.current.eachLayer(layer => {\n        if (layer.feature) {\n          layer.setStyle(styleFeature(layer.feature, selectedMatchId));\n        }\n      });\n    }\n  }, [selectedMatchId, geojson]);");
  
  // Attach the ref to the GeoJSON component
  code = code.replace(/<GeoJSON key=\{`\$\{featureCount\}-\$\{refreshKey\}`\}/, `<GeoJSON ref={geoJsonRef} key={\`\${featureCount}-\${refreshKey}\`}`);
  
  fs.writeFileSync('d:/SIH/frontend/src/pages/ReconciliationMap.jsx', code, 'utf8');
  console.log("Imperative styling added");
}
