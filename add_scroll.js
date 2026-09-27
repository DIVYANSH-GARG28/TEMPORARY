const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/pages/ReviewQueue.jsx', 'utf8');

if (!code.includes('useRef')) {
  code = code.replace(/import React, \{ useState, useEffect \} from 'react';/, "import React, { useState, useEffect, useRef } from 'react';");
}
if (!code.includes('const refs = useRef')) {
  code = code.replace(/const \[loading, setLoading\] = useState\(true\);/, "const [loading, setLoading] = useState(true);\n    const cardRefs = useRef({});");
}
if (!code.includes('scrollIntoView')) {
  const scrollEffect = `
    useEffect(() => {
      if (selectedMatchId && cardRefs.current[selectedMatchId]) {
        cardRefs.current[selectedMatchId].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, [selectedMatchId]);
  `;
  code = code.replace(/return \(/, scrollEffect + '\n    return (');
}

// Add ref to the card div
code = code.replace(
  /className=\{`panel-card white-apple-card \$\{isSelected \? 'active' : ''\}`\}/,
  `ref={el => cardRefs.current[entity.id] = el}\n                    className={\`panel-card white-apple-card \${isSelected ? 'active' : ''}\`}`
);

fs.writeFileSync('d:/SIH/frontend/src/pages/ReviewQueue.jsx', code, 'utf8');
console.log("Scroll logic added");
