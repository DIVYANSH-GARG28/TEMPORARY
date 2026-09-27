const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/pages/ReviewQueue.jsx', 'utf8');

code = code.replace(
  /<EvidenceBar label=\{t\.spatial\} value=\{entity\.spatial_evidence\} color="#3b82f6" \/>/,
  `<EvidenceBar label={t.spatial} value={parseFloat(entity.confidence?.spatial_match) || 0} color="#3b82f6" />`
);
code = code.replace(
  /<EvidenceBar label=\{t\.attribute\} value=\{entity\.attribute_evidence\} color="#8b5cf6" \/>/,
  `<EvidenceBar label={t.attribute} value={parseFloat(entity.confidence?.attribute_match) || 0} color="#8b5cf6" />`
);

fs.writeFileSync('d:/SIH/frontend/src/pages/ReviewQueue.jsx', code, 'utf8');
console.log("Evidence bars fixed");
