const fs = require('fs');
let code = fs.readFileSync('d:/SIH/docker-compose.yml', 'utf8');

// Use a regex to strip out the n8n service block
code = code.replace(/n8n:[\s\S]*?(?=volumes:)/, "");
fs.writeFileSync('d:/SIH/docker-compose.yml', code, 'utf8');
console.log("n8n removed from Docker");
