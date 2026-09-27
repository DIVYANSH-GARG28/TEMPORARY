const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/routers/citizen.py', 'utf8');

code = code.replace(/router = APIRouter\(prefix="\/citizen", tags=\["Citizen Portal"\]\)/, 'router = APIRouter(tags=["Citizen Portal"])');

fs.writeFileSync('d:/SIH/backend/src/routers/citizen.py', code, 'utf8');
console.log("Double prefix fixed");
