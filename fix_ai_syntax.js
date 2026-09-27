const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/routers/ai_agent.py', 'utf8');

code = code.replace(/"vision_analysis": "\[Llama 3\.2 Vision Analysis Complete\][\s\S]*?tax recalculation\."/g, 
`"vision_analysis": """[Llama 3.2 Vision Analysis Complete]\n\nVisual inspection confirms a 4-story commercial structure on-site. This severely contradicts the legacy municipal tax record which lists this property as a '1-Story Residential' unit. \n\nFlagging for immediate Surveyor Escalation and penalty tax recalculation."""`);

code = code.replace(/"vision_analysis": "\[Llama 3\.2 Vision Analysis Complete\][\s\S]*?tax recalculation\."/g, 
`"vision_analysis": """[Llama 3.2 Vision Analysis Complete]\n\nVisual inspection confirms an unregistered 3-story commercial structure attached to the primary building. This contradicts the cadastral boundaries.\n\nFlagging for Surveyor Escalation and penalty tax recalculation."""`);

fs.writeFileSync('d:/SIH/backend/src/routers/ai_agent.py', code, 'utf8');
console.log("AI Agent syntax fixed");
