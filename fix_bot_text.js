const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/routers/telegram.py', 'utf8');

const fraudMsg = `"🚨 [FRAUD ALERT: REMOTE APPROVAL DETECTED] 🚨\n\nGPS math indicates you are {distance:.1f} meters away from the true AI boundary of Entity #{entity.id}. \n\nYou cannot approve a property while sitting at a remote location. You must be physically standing on the property boundary to proceed.\n\n⚠️ Incident logged to the Vigilance Dashboard."`;

const successMsg = `"✅ [SPATIAL AUDIT PASSED] ✅\n\nGround Truth mathematically matches the AI Drone Geometry (Distance: {distance:.1f}m).\n\nYour physical presence is verified. You are now authorized to upload photographic evidence for Entity #{entity.id}."`;

code = code.replace(/f"\[FRAUD ALERT\] Ghost Surveying Detected\.\\n\\nYou are \{distance:\.1f\} meters away from the true boundary of Entity #\{entity\.id\}\. You must be physically present on the site to resolve disputes\.\\nYour Surveyor ID has been flagged to the Vigilance Dashboard\."/, fraudMsg);

code = code.replace(/f"\[SPATIAL AUDIT PASSED\]\\nGround Truth mathematically matches Drone AI Geometry \(Distance: \{distance:\.1f\}m\)\.\\nYou are authorized to upload physical evidence\."/, successMsg);

code = code.replace(/f"\[SUCCESS\] Location Verified\.\\n\\nYou are \{distance:\.1f\} meters from Entity #\{entity\.id\}, which is within the acceptable 50m radius\. You may now proceed to upload photographic evidence\."/, successMsg);

fs.writeFileSync('d:/SIH/backend/src/routers/telegram.py', code, 'utf8');
console.log("Bot text updated to match script");
