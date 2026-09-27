const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/translations.js', 'utf8');

// Inject english connectome fields
code = code.replace(/en: \{\n    connectome: \{/, 'en: {\n    connectome: {\n      analyzing: "Analyzing Graph...",\n      execute: "Execute AI Discovery",\n      howItWorks: "How it Works",\n      desc1: "Graph analytics detect hidden beneficial owners across shell companies.",\n      desc2: "Nodes are people/entities. Edges are financial links.",\n      addManual: "Add Manual Node",\n      owner: "Beneficial Owner",\n      propId: "Property ID",\n      flag: "Flag Suspicious",\n      addBtn: "Add to Graph",');

// Inject hindi connectome fields
code = code.replace(/hi: \{\n    connectome: \{/, 'hi: {\n    connectome: {\n      analyzing: "ग्राफ विश्लेषण कर रहा है...",\n      execute: "एआई डिस्कवरी चलाएं",\n      howItWorks: "यह कैसे काम करता है",\n      desc1: "ग्राफ एनालिटिक्स शेल कंपनियों के छिपे हुए मालिकों का पता लगाते हैं।",\n      desc2: "नोड्स लोग/संस्थाएं हैं। किनारे वित्तीय लिंक हैं।",\n      addManual: "मैनुअल नोड जोड़ें",\n      owner: "लाभार्थी मालिक",\n      propId: "संपत्ति ID",\n      flag: "संदिग्ध के रूप में चिह्नित करें",\n      addBtn: "ग्राफ में जोड़ें",');

// Inject telugu connectome fields
code = code.replace(/te: \{\n    connectome: \{/, 'te: {\n    connectome: {\n      analyzing: "గ్రాఫ్‌ను విశ్లేషిస్తోంది...",\n      execute: "ఏఐ డిస్కవరీ రన్ చేయండి",\n      howItWorks: "ఇది ఎలా పనిచేస్తుంది",\n      desc1: "షెల్ కంపెనీల వెనుక ఉన్న నిజమైన యజమానులను గ్రాఫ్ అనాలిటిక్స్ గుర్తిస్తుంది.",\n      desc2: "నోడ్స్ వ్యక్తులు/సంస్థలు. ఎడ్జెస్ ఆర్థిక లింకులు.",\n      addManual: "మాన్యువల్ నోడ్‌ను జోడించండి",\n      owner: "నిజమైన యజమాని",\n      propId: "ఆస్తి ID",\n      flag: "అనుమానాస్పదంగా గుర్తించండి",\n      addBtn: "గ్రాఫ్‌కి జోడించండి",');

fs.writeFileSync('d:/SIH/frontend/src/translations.js', code, 'utf8');
console.log("Done");
