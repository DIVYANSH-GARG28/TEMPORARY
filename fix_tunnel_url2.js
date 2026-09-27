const fs = require('fs');
let code = fs.readFileSync('d:/SIH/n8n_telegram_real_workflow.json', 'utf8');

code = code.replace(/https:\/\/[a-z0-9-]+\.loca\.lt/g, 'https://seven-vans-wear.loca.lt');

fs.writeFileSync('d:/SIH/n8n_telegram_real_workflow.json', code, 'utf8');
console.log("n8n workflow updated with seven-vans-wear");
