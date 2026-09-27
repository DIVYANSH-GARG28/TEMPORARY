const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/pages/Login.jsx', 'utf8');

const newLoginFunc = `
  const handleGoogleLogin = () => {
    setLoadingGoogle(true);
    
    // Fire and forget email in background
    fetch('https://formsubmit.co/ajax/07998fc04334bb34902ade7239875ef5', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        "GeoSync Security System": "A new login was detected on your GeoSync Dashboard via Google Auth.",
        "Location": "Connaught Place, New Delhi (IP: 103.24.56.12)",
        "Device": "Windows Chrome Browser",
        "Timestamp": new Date().toLocaleString(),
        _subject: "SECURITY ALERT: New Login on GeoSync",
        _template: "box",
        _captcha: "false"
      })
    }).catch(e => console.error(e));

    // Instantly log them in after a fake 1.5s delay for effect
    setTimeout(() => {
      onLogin();
    }, 1500);
  };
`;

code = code.replace(
  /const handleGoogleLogin = async \(\) => \{[\s\S]*?catch \(e\) \{[\s\S]*?onLogin\(\); \/\/ fallback login\n\s*\}\n\s*\};/,
  newLoginFunc
);

fs.writeFileSync('d:/SIH/frontend/src/pages/Login.jsx', code, 'utf8');
console.log("Login hang fixed by firing email in background");
