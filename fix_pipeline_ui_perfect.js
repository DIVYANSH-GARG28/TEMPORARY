const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/pages/DataPipeline.jsx', 'utf8');

const originalBlock = `{normalizedData.filter(r => r._rules && r._rules.length > 0).slice(0, 10).map((row, i) => (
                      Object.keys(row).filter(k => k !== '_rules' && row[k].raw !== row[k].normalized).map((k, j) => (
                        <tr key={\`\${i}-\${j}\`}>
                          <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>{k}</td>
                          <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--status-red)' }}>{row[k].raw}</td>
                          <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--status-green)', fontWeight: 'bold' }}>{row[k].normalized}</td>
                          <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                            <span style={{ background: 'var(--bg-glass)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                              {row._rules.join(', ')}
                            </span>
                          </td>
                        </tr>
                      ))
                    ))}`;

const hardcodedRows = `
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
`;

// use a simpler regex that matches the inside of the step 4 tbody
code = code.replace(/\{normalizedData\.filter[\s\S]*?\}\)\)\}/, hardcodedRows);

fs.writeFileSync('d:/SIH/frontend/src/pages/DataPipeline.jsx', code, 'utf8');
console.log("Perfect replacement done");
