const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/App.jsx', 'utf8');

// Fix styling
code = code.replace(
  /style=\{\{ width: 'auto', padding: '6px 12px', background: 'var\(--bg-glass\)', fontWeight: 'bold' \}\}/g,
  `style={{ width: 'auto', padding: '6px 12px', background: 'var(--bg-glass)', color: 'var(--text-primary)', fontWeight: 'bold' }}`
);
code = code.replace(
  /style=\{\{ width: 'auto', padding: '6px 12px' \}\}/g,
  `style={{ width: 'auto', padding: '6px 12px', background: 'var(--bg-glass)', color: 'var(--text-primary)' }}`
);

// Fix emojis brute force
code = code.replace(/<option value="en">.*?<\/option>/g, '<option value="en">🇺🇸 English</option>');
code = code.replace(/<option value="hi">.*?<\/option>/g, '<option value="hi">🇮🇳 हिन्दी (Hindi)</option>');
code = code.replace(/<option value="te">.*?<\/option>/g, '<option value="te">🇮🇳 తెలుగు (Telugu)</option>');
code = code.replace(/<option value="chief_approver">.*?<\/option>/g, '<option value="chief_approver">👑 Chief Approver</option>');
code = code.replace(/<option value="field_surveyor">.*?<\/option>/g, '<option value="field_surveyor">👨‍🔬 Field Surveyor</option>');

fs.writeFileSync('d:/SIH/frontend/src/App.jsx', code, 'utf8');
console.log("Dropdowns fixed");
