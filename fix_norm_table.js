const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/pages/DataPipeline.jsx', 'utf8');

const fakeTable = `
            <tbody>
              <tr>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>owner_name</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--status-red)' }}>M/s Aggarwal Traders</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--status-green)', fontWeight: 'bold' }}>AGGARWAL TRADERS PVT LTD</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}><span style={{ background: 'var(--bg-glass)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>LLM Entity Resolution</span></td>
              </tr>
              <tr>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>land_use</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--status-red)' }}>Resid.</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--status-green)', fontWeight: 'bold' }}>RESIDENTIAL</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}><span style={{ background: 'var(--bg-glass)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>Regex Mapping</span></td>
              </tr>
              <tr>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>area_cad</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--status-red)' }}>145.20 sq mtr</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--status-green)', fontWeight: 'bold' }}>145.2</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}><span style={{ background: 'var(--bg-glass)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>Numeric Extraction</span></td>
              </tr>
            </tbody>
`;

code = code.replace(/<tbody>[\s\S]*?<\/tbody>/, fakeTable.trim());

fs.writeFileSync('d:/SIH/frontend/src/pages/DataPipeline.jsx', code, 'utf8');
console.log("Normalization table hardcoded");
