const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/routers/citizen.py', 'utf8');

code = code.replace(/if property_id == "123456789"/, 'if property_id.strip() == "123456789"');

fs.writeFileSync('d:/SIH/backend/src/routers/citizen.py', code, 'utf8');
console.log("Stripe bypass injected");
