const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/App.jsx', 'utf8');

// Inject logout button next to language selector
code = code.replace(
  /<select\s*className="form-input"\s*style=\{\{ width: 'auto'/,
  '<button onClick={() => { localStorage.removeItem("isLoggedIn"); window.location.reload(); }} className="btn btn-secondary" style={{ padding: "6px 12px", background: "var(--bg-glass)", color: "var(--text-primary)", fontWeight: "bold" }}>Logout</button>\n            <select \n              className="form-input" \n              style={{ width: "auto"'
);

fs.writeFileSync('d:/SIH/frontend/src/App.jsx', code, 'utf8');
console.log("Logout button added");
