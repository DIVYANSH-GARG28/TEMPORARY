const fs = require('fs');
let code = fs.readFileSync('d:/SIH/n8n_telegram_real_workflow.json', 'utf8');

code = code.replace(
  /https:\/\/floppy-heads-doubt\.loca\.lt\/cases/g,
  'https://floppy-heads-doubt.loca.lt/api/telegram/cases'
);
code = code.replace(
  /https:\/\/floppy-heads-doubt\.loca\.lt\/location/g,
  'https://floppy-heads-doubt.loca.lt/api/telegram/location'
);

fs.writeFileSync('d:/SIH/n8n_telegram_real_workflow.json', code, 'utf8');
console.log("Workflow URLs fixed");
