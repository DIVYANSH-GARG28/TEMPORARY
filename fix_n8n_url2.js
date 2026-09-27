const fs = require('fs');
let code = fs.readFileSync('d:/SIH/n8n_telegram_real_workflow.json', 'utf8');

code = code.replace(/https:\/\/angry-toes-pay\.loca\.lt/g, 'https://neat-friends-burn.loca.lt');

fs.writeFileSync('d:/SIH/n8n_telegram_real_workflow.json', code, 'utf8');
console.log("n8n workflow file updated with new localtunnel URL again");
