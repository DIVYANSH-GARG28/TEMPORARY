const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/App.jsx', 'utf8');

// 1. Add states to App()
code = code.replace(
  /const \[toast, setToast\] = useState\(null\);/,
  `const [toast, setToast] = useState(null);\n  const [authModalOpen, setAuthModalOpen] = useState(false);\n  const [authPasscode, setAuthPasscode] = useState('');\n  const [authError, setAuthError] = useState(false);\n\n  const submitAuth = () => {\n    if (authPasscode === '1234') {\n      setUserRole('chief_approver');\n      setAuthModalOpen(false);\n      triggerToast('Authentication successful. Security alert sent.', 'success');\n    } else {\n      setAuthError(true);\n      triggerToast('Authentication failed. Privilege escalation denied.', 'error');\n    }\n  };`
);

// 2. Replace handleRoleChange
code = code.replace(
  /const handleRoleChange = \(e\) => \{[\s\S]*?setUserRole\(newRole\);\n    \}\n  \};/,
  `const handleRoleChange = (e) => {\n    const newRole = e.target.value;\n    if (newRole === 'chief_approver') {\n      setAuthModalOpen(true);\n      setAuthPasscode('');\n      setAuthError(false);\n      setUserRole('field_surveyor');\n    } else {\n      setUserRole(newRole);\n    }\n  };`
);

// 3. Fix garbled emojis in select
code = code.replace(
  /<option value="chief_approver">\{translations\[lang\]\?\.header\.approver \|\| ".*?"\}<\/option>\s*<option value="field_surveyor">\{translations\[lang\]\?\.header\.surveyor \|\| ".*?"\}<\/option>/g,
  `<option value="chief_approver">{translations[lang]?.header.approver || "👑 Chief Approver"}</option>\n              <option value="field_surveyor">{translations[lang]?.header.surveyor || "👨‍🔬 Field Surveyor"}</option>`
);

// 4. Inject Modal HTML just before the toast div
const modalHTML = `
      {/* Auth Modal */}
      {authModalOpen && (
        <div className="mobile-overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, background: 'rgba(0,0,0,0.6)' }}>
          <div style={{
            background: 'var(--bg-glass)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
            padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-color)',
            width: '90%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column', gap: '1.5rem',
            animation: 'toastSlideIn 0.3s ease'
          }}>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', fontSize: '1.25rem' }}>
               <ShieldCheck size={24} color="var(--accent-primary)" /> Security Lock
            </h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Enter Chief Approver Passcode to elevate privileges. (Hint: 1234)
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <input 
                type="password" 
                value={authPasscode}
                onChange={e => { setAuthPasscode(e.target.value); setAuthError(false); }}
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') submitAuth(); }}
                style={{
                  width: '100%', padding: '12px 15px', background: 'var(--bg-primary)',
                  border: \`1px solid \${authError ? 'var(--status-red)' : 'var(--border-color)'}\`,
                  borderRadius: '10px', color: 'var(--text-primary)', outline: 'none',
                  boxSizing: 'border-box', fontSize: '1rem'
                }}
              />
              {authError && <span style={{ color: 'var(--status-red)', fontSize: '0.85rem' }}>Invalid passcode.</span>}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button onClick={() => setAuthModalOpen(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={submitAuth} className="btn btn-primary">Authenticate</button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(/\{\/\* Global Apple-Grade Toast Notification \*\/\}/, modalHTML + '\n      {/* Global Apple-Grade Toast Notification */}');

// Make sure ShieldCheck is imported
if (!code.includes('ShieldCheck')) {
  code = code.replace(/import { Menu, X, Bell } from 'lucide-react';/, "import { Menu, X, Bell, ShieldCheck } from 'lucide-react';");
}

fs.writeFileSync('d:/SIH/frontend/src/App.jsx', code, 'utf8');
console.log("Done");
