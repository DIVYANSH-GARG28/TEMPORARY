const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/App.jsx', 'utf8');

// The exact old function to remove
const oldFunc = `  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    if (newRole === 'chief_approver') {
      const passcode = window.prompt("SECURITY LOCK: Enter Chief Approver Passcode to elevate privileges (Hint: 1234):");
      if (passcode === "1234") {
        setUserRole(newRole);
        setToast({ type: 'success', message: 'Authentication successful. Security email alert sent to registered Chief Approver.' });
      } else {
        setToast({ type: 'error', message: 'Authentication failed. Privilege escalation denied.' });
        setUserRole('field_surveyor');
      }
    } else {
      setUserRole(newRole);
    }
  };`;

// The new function
const newFunc = `  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    if (newRole === 'chief_approver') {
      setAuthModalOpen(true);
      setAuthPasscode('');
      setAuthError(false);
      setUserRole('field_surveyor');
    } else {
      setUserRole(newRole);
    }
  };`;

code = code.replace(oldFunc, newFunc);
fs.writeFileSync('d:/SIH/frontend/src/App.jsx', code, 'utf8');
console.log("Replaced handleRoleChange");
