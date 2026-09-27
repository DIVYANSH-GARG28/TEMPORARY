const fs = require('fs');
let code = fs.readFileSync('d:/SIH/n8n_telegram_real_workflow.json', 'utf8');

code = code.replace(
  /https:\/\/floppy-heads-doubt\.loca\.lt/g,
  'https://geosync-sih-2024.loca.lt'
);

fs.writeFileSync('d:/SIH/n8n_telegram_real_workflow.json', code, 'utf8');
console.log("Workflow URLs fixed to robust tunnel");
