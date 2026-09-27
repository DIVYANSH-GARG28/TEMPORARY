const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/routers/audit.py', 'utf8');

code = code.replace(
  /webhook_url = "https:\/\/divyansh67\.app\.n8n\.cloud\/webhook-test\/sih-alert"/,
  'webhook_url = "https://divyansh67.app.n8n.cloud/webhook/sih-alert"'
);

fs.writeFileSync('d:/SIH/backend/src/routers/audit.py', code, 'utf8');
console.log("n8n webhook updated to production");
