const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/routers/ai_agent.py', 'utf8');

code = code.replace(/\{\{"risk_level": "High", "analysis": "your 3 sentences", "recommended_action": "what should the surveyor do"\}/g, '{{"risk_level": "High", "analysis": "your 3 sentences", "recommended_action": "what should the surveyor do"}}');

fs.writeFileSync('d:/SIH/backend/src/routers/ai_agent.py', code, 'utf8');
console.log("F-string fixed");
