const fs = require('fs');
let code = fs.readFileSync('d:/SIH/n8n_telegram_real_workflow.json', 'utf8');

code = code.replace(/Welcome to the <b>GeoSync Field Verification Bot<\/b>/g, 'Welcome to the <b>GeoSync Anti-Corruption Field Bot</b>');
code = code.replace(/Perform an Anti-Corruption boundary check/g, 'Perform a strict GPS boundary check');

fs.writeFileSync('d:/SIH/n8n_telegram_real_workflow.json', code, 'utf8');
console.log("n8n JSON updated");
