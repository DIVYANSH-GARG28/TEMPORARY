const fs = require('fs');
let code = fs.readFileSync('d:/SIH/docker-compose.yml', 'utf8');

if (!code.includes('- ./backend/src:/app/src')) {
  code = code.replace(
    /context: \.\/backend\r?\n\s+ports:/,
    "context: ./backend\n      volumes:\n        - ./backend/src:/app/src\n      ports:"
  );
  fs.writeFileSync('d:/SIH/docker-compose.yml', code, 'utf8');
  console.log("Backend volume mounted");
} else {
  console.log("Already mounted");
}
