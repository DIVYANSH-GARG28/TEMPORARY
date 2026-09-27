const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/App.jsx', 'utf8');

// 1. Remove the old handleRoleChange completely
code = code.replace(/const handleRoleChange = \(e\) => \{[\s\S]*?\}\s*else\s*\{\s*setUserRole\(newRole\);\s*\}\s*\};/, `const handleRoleChange = (e) => {
    const newRole = e.target.value;
    if (newRole === 'chief_approver') {
      setAuthModalOpen(true);
      setAuthPasscode('');
      setAuthError(false);
      setUserRole('field_surveyor');
    } else {
      setUserRole(newRole);
    }
  };`);

// 2. Fix emojis in Language Select
code = code.replace(/<option value="en">.*?<\/option>/, `<option value="en">🇺🇸 English</option>`);
code = code.replace(/<option value="hi">.*?<\/option>/, `<option value="hi">🇮🇳 हिन्दी (Hindi)</option>`);
code = code.replace(/<option value="te">.*?<\/option>/, `<option value="te">🇮🇳 తెలుగు (Telugu)</option>`);

// 3. Fix emojis in Role Select
code = code.replace(/<option value="chief_approver">\{translations\[lang\]\?\.header\.approver \|\| ".*?"\}<\/option>/, `<option value="chief_approver">{translations[lang]?.header.approver || "👑 Chief Approver"}</option>`);
code = code.replace(/<option value="field_surveyor">\{translations\[lang\]\?\.header\.surveyor \|\| ".*?"\}<\/option>/, `<option value="field_surveyor">{translations[lang]?.header.surveyor || "👨‍🔬 Field Surveyor"}</option>`);

fs.writeFileSync('d:/SIH/frontend/src/App.jsx', code, 'utf8');
console.log("App fixed");
