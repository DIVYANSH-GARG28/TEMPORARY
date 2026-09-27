const fs = require('fs');
let code = fs.readFileSync('d:/SIH/n8n_telegram_real_workflow.json', 'utf8');

code = code.replace(/https:\/\/wild-rats-joke\.loca\.lt/g, 'https://angry-toes-pay.loca.lt');

fs.writeFileSync('d:/SIH/n8n_telegram_real_workflow.json', code, 'utf8');
console.log("n8n workflow file updated with new localtunnel URL");
