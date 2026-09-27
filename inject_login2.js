const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/App.jsx', 'utf8');

code = code.replace(
  /return \([\s\r\n]*<div className="app-container">/,
  "if (!isLoggedIn) return <Login onLogin={() => setIsLoggedIn(true)} />;\n\n  return (\n    <div className=\"app-container\">"
);

fs.writeFileSync('d:/SIH/frontend/src/App.jsx', code, 'utf8');
console.log("Replaced return statement");
