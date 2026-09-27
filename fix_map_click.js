const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/App.jsx', 'utf8');

code = code.replace(
  /<ReconciliationMap\s+onMatchComplete=\{\(\) => setRefreshKey\(prev => prev \+ 1\)\}\s+selectedMatchId=\{selectedMatchId\}\s+refreshKey=\{refreshKey\}\s*\/>/g,
  '<ReconciliationMap onMatchComplete={() => setRefreshKey(prev => prev + 1)} selectedMatchId={selectedMatchId} onSelectMatch={setSelectedMatchId} refreshKey={refreshKey} lang={lang} />'
);

code = code.replace(
  /<ReviewQueue\s+userRole=\{userRole\}\s+refreshKey=\{refreshKey\}\s+onActionComplete=\{\(\) => setRefreshKey\(prev => prev \+ 1\)\}\s*\/>/g,
  '<ReviewQueue userRole={userRole} refreshKey={refreshKey} onActionComplete={() => setRefreshKey(prev => prev + 1)} selectedMatchId={selectedMatchId} onSelectMatch={setSelectedMatchId} lang={lang} />'
);

fs.writeFileSync('d:/SIH/frontend/src/App.jsx', code, 'utf8');
console.log("Map click fixed in App.jsx");
