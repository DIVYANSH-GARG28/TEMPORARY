const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/pages/ReviewQueue.jsx', 'utf8');

code = code.replace(
  /import React, \{ useEffect, useState \} from 'react';/,
  "import React, { useEffect, useState, useRef } from 'react';"
);

fs.writeFileSync('d:/SIH/frontend/src/pages/ReviewQueue.jsx', code, 'utf8');
console.log("Crash fixed");
