const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/App.jsx', 'utf8');

const regex = /<select[\s\S]*?Select Language[\s\S]*?<\/select>/;
const replacement = `<select 
              className="form-input" 
              style={{ width: 'auto', padding: '6px 12px', background: 'var(--bg-glass)', fontWeight: 'bold' }}
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              aria-label="Select Language"
            >
              <option value="en">🇺🇸 English</option>
              <option value="hi">🇮🇳 हिन्दी (Hindi)</option>
              <option value="te">🇮🇳 తెలుగు (Telugu)</option>
            </select>`;

code = code.replace(regex, replacement);
fs.writeFileSync('d:/SIH/frontend/src/App.jsx', code, 'utf8');
