const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/App.jsx', 'utf8');

code = code.replace(
  /const \[isLoggedIn, setIsLoggedIn\] = useState\(false\);/,
  `const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');`
);

code = code.replace(
  /if \(!isLoggedIn\) return <Login onLogin=\{\(\) => setIsLoggedIn\(true\)\} \/>;/,
  `if (!isLoggedIn) return <Login onLogin={() => { setIsLoggedIn(true); localStorage.setItem('isLoggedIn', 'true'); }} />;`
);

fs.writeFileSync('d:/SIH/frontend/src/App.jsx', code, 'utf8');

// Fix Login.jsx to only accept 1234
let loginCode = fs.readFileSync('d:/SIH/frontend/src/pages/Login.jsx', 'utf8');
loginCode = loginCode.replace(
  /if \(username && password\) \{/,
  `if (username && password === '1234') {`
);
// add an error state for password
if (!loginCode.includes('authError')) {
  loginCode = loginCode.replace(
    /const \[password, setPassword\] = useState\(''\);/,
    `const [password, setPassword] = useState('');\n  const [authError, setAuthError] = useState(false);`
  );
  loginCode = loginCode.replace(
    /if \(username && password === '1234'\) \{/,
    `if (username && password === '1234') {\n      setAuthError(false);`
  );
  loginCode = loginCode.replace(
    /onLogin\(\);\n    \}/,
    `onLogin();\n    } else {\n      setAuthError(true);\n    }`
  );
  loginCode = loginCode.replace(
    /onChange=\{e => setPassword\(e\.target\.value\)\}/,
    `onChange={e => { setPassword(e.target.value); setAuthError(false); }}`
  );
  loginCode = loginCode.replace(
    /<button type="submit"/,
    `{authError && <span style={{color: '#ef4444', fontSize: '0.85rem', marginTop: '-10px'}}>Invalid password. Try 1234.</span>}\n          <button type="submit"`
  );
}

fs.writeFileSync('d:/SIH/frontend/src/pages/Login.jsx', loginCode, 'utf8');
console.log("Login persistence fixed");
