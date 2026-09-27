const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/routers/audit.py', 'utf8');

code = code.replace(
  /webhook_url = ".*?"/,
  'webhook_url = "https://divyansh13132.app.n8n.cloud/webhook/48cc3cf4-70e3-49b8-b6e8-9c076c3f0e57/webhook"'
);

fs.writeFileSync('d:/SIH/backend/src/routers/audit.py', code, 'utf8');
console.log("n8n cloud webhook updated");
