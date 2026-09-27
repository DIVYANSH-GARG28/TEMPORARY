const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/routers/ai_agent.py', 'utf8');

code = code.replace(/\}\s*\}/g, '}');

fs.writeFileSync('d:/SIH/backend/src/routers/ai_agent.py', code, 'utf8');
console.log("Braces fixed");
