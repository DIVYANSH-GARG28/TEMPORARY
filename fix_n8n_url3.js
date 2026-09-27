const fs = require('fs');
let code = fs.readFileSync('d:/SIH/n8n_telegram_real_workflow.json', 'utf8');

// Replace ANY previous loca.lt url with the new one
code = code.replace(/https:\/\/[a-z0-9-]+\.loca\.lt/g, 'https://honest-crabs-remain.loca.lt');

fs.writeFileSync('d:/SIH/n8n_telegram_real_workflow.json', code, 'utf8');
console.log("n8n workflow file updated with new localtunnel URL: honest-crabs-remain");
