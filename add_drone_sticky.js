const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/pages/DroneFeed.jsx', 'utf8');

const stickyNote = `
              <div style={{
                background: '#fef3c7',
                color: '#92400e',
                padding: '1rem',
                borderRadius: '4px',
                boxShadow: '2px 2px 5px rgba(0,0,0,0.1)',
                transform: 'rotate(1deg)',
                display: 'block',
                margin: '0 auto 2rem',
                borderLeft: '4px solid #f59e0b',
                maxWidth: '600px',
                fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
                textAlign: 'center',
                position: 'relative',
                zIndex: 100
              }}>
                <strong>📌 Proof of Concept:</strong> This Geo AI vision system is currently utilizing a <strong>Mobile IP Camera</strong> to mimic physical drone hardware. In the final deployment, it will be directly integrated with live <strong>UAV/Drone Imagery</strong> arrays.
              </div>
`;

code = code.replace(
  /                  \}<\/style>\s*/,
  '                  }</style>\n' + stickyNote
);

fs.writeFileSync('d:/SIH/frontend/src/pages/DroneFeed.jsx', code, 'utf8');
console.log("Drone sticky note added");
