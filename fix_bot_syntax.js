const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/routers/telegram.py', 'utf8');

code = code.replace(/"🚨 \[FRAUD ALERT: REMOTE APPROVAL DETECTED\] 🚨[\s\S]*?Vigilance Dashboard\."/g, 
`f"""🚨 [FRAUD ALERT: REMOTE APPROVAL DETECTED] 🚨\n\nGPS math indicates you are {distance:.1f} meters away from the true AI boundary of Entity #{entity.id}. \n\nYou cannot approve a property while sitting at a remote location. You must be physically standing on the property boundary to proceed.\n\n⚠️ Incident logged to the Vigilance Dashboard."""`);

code = code.replace(/"✅ \[SPATIAL AUDIT PASSED\] ✅[\s\S]*?Entity #\{entity\.id\}\."/g, 
`f"""✅ [SPATIAL AUDIT PASSED] ✅\n\nGround Truth mathematically matches the AI Drone Geometry (Distance: {distance:.1f}m).\n\nYour physical presence is verified. You are now authorized to upload photographic evidence for Entity #{entity.id}."""`);

fs.writeFileSync('d:/SIH/backend/src/routers/telegram.py', code, 'utf8');
console.log("Telegram syntax fixed");
