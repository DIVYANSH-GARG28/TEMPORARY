const fs = require('fs');
let code = fs.readFileSync('d:/SIH/docker-compose.yml', 'utf8');

if (!code.includes('- ./frontend/src:/app/src')) {
  code = code.replace(
    /- \.\/frontend\/public:\/app\/public/,
    "- ./frontend/public:/app/public\n      - ./frontend/src:/app/src"
  );
  fs.writeFileSync('d:/SIH/docker-compose.yml', code, 'utf8');
  console.log("Volume mounted");
} else {
  console.log("Already mounted");
}
