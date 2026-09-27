const fs = require('fs');
let code = fs.readFileSync('d:/SIH/docker-compose.yml', 'utf8');

// Remove the mangled lines 76-80
code = code.replace(/  volumes:\r?\n      - n8n_data:\/home\/node\/\.n8n\r?\n    depends_on:\r?\n      - backend\r?\n/, "");
fs.writeFileSync('d:/SIH/docker-compose.yml', code, 'utf8');
console.log("YAML fixed");
