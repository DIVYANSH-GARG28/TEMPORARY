const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/pages/CitizenPortal.jsx', 'utf8');

const stickyNote = `
        <div style={{
          background: '#fef3c7',
          color: '#92400e',
          padding: '1rem',
          borderRadius: '4px',
          boxShadow: '2px 2px 5px rgba(0,0,0,0.1)',
          transform: 'rotate(-2deg)',
          display: 'inline-block',
          margin: '0 auto 2rem',
          borderLeft: '4px solid #f59e0b',
          maxWidth: '500px',
          fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif'
        }}>
          <strong>📌 Future Scope:</strong> This G2C Portal will be integrated with <strong>DigiLocker</strong> to securely pull <strong>Aadhaar</strong> data for instant, biometric-backed property linking and verification.
        </div>
`;

code = code.replace(
  /<\/div>\s*<div className="panel-card"/,
  `</div>\n${stickyNote}\n        <div className="panel-card"`
);

fs.writeFileSync('d:/SIH/frontend/src/pages/CitizenPortal.jsx', code, 'utf8');
console.log("Sticky note added to G2C portal");
