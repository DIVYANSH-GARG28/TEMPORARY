const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/routers/pipeline.py', 'utf8');

code = code.replace(/center_lon, center_lat = [0-9.]+, [0-9.]+/, 'center_lon, center_lat = 77.2197, 28.6328');

code = code.replace(/rin = b\.get\('rin', 90\.0\)/, "rin = b.get('rin', 170.0)");
code = code.replace(/rout = b\.get\('rout', 130\.0\)/, "rout = b.get('rout', 220.0)");
code = code.replace(/steps=8/g, 'steps=20');

// Fix the ghost building radii in the dict
code = code.replace(/"rin": 160/g, '"rin": 230');
code = code.replace(/"rout": 180/g, '"rout": 270');
code = code.replace(/"rout": 190/g, '"rout": 270');

fs.writeFileSync('d:/SIH/backend/src/routers/pipeline.py', code, 'utf8');
console.log("Arc math perfected");
