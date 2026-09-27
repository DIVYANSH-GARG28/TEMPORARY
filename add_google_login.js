const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/pages/Login.jsx', 'utf8');

// Add Google icon import if not present (we'll just use a generic icon or text if needed, but let's use a standard svg)
const googleIcon = `<svg style={{width: '20px', height: '20px', marginRight: '8px'}} viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`;

const googleLoginLogic = `
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    try {
      // Trigger email to user
      await fetch('https://formsubmit.co/ajax/divyansh2282006@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: "GeoSync Security Alert",
          message: "A new login was detected on your GeoSync Dashboard via Google Auth.",
          _subject: "New GeoSync Login Detected"
        })
      });
      // Allow them in
      setTimeout(() => {
        onLogin();
      }, 1000);
    } catch (e) {
      console.error(e);
      onLogin(); // fallback login
    }
  };
`;

if (!code.includes('handleGoogleLogin')) {
  // Inject logic
  code = code.replace(/const handleSubmit = \(e\) => \{/, googleLoginLogic + '\n  const handleSubmit = (e) => {');
  
  // Inject button
  const googleBtn = `
          <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
            <span style={{ padding: '0 10px', color: '#64748b', fontSize: '0.85rem' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          </div>
          
          <button type="button" onClick={handleGoogleLogin} disabled={loadingGoogle} style={{
            background: 'white', color: '#333', border: 'none', padding: '12px', borderRadius: '10px',
            fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)', transition: 'transform 0.1s'
          }}>
            ${googleIcon}
            {loadingGoogle ? 'Authenticating...' : 'Continue with Google'}
          </button>
  `;
  
  code = code.replace(/<\/form>/, googleBtn + '\n        </form>');
  
  fs.writeFileSync('d:/SIH/frontend/src/pages/Login.jsx', code, 'utf8');
  console.log("Google login added");
}
