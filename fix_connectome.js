const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/translations.js', 'utf8');

// Inject english connectome
code = code.replace(/en: \{/, 'en: {\n    connectome: {\n      title: "FlyWire AI Connectome",\n      subtitle: "Deep learning spatial graph neural network processing...",\n      analyze: "Run Graph Analysis",\n      upload: "Upload Drone Data",\n      aiInsight: "AI Graph Insight",\n      nodes: "Nodes",\n      edges: "Edges",\n      nodeId: "Node ID",\n      connections: "Connections",\n      riskLevel: "Risk Level"\n    },');

// Inject hindi connectome
code = code.replace(/hi: \{/, 'hi: {\n    connectome: {\n      title: "फ्लाइवायर एआई कनेक्टोम",\n      subtitle: "डीप लर्निंग स्थानिक ग्राफ न्यूरल नेटवर्क प्रोसेसिंग...",\n      analyze: "ग्राफ विश्लेषण चलाएं",\n      upload: "ड्रोन डेटा अपलोड करें",\n      aiInsight: "एआई ग्राफ अंतर्दृष्टि",\n      nodes: "नोड्स",\n      edges: "किनारे (Edges)",\n      nodeId: "नोड ID",\n      connections: "कनेक्शन",\n      riskLevel: "जोखिम स्तर"\n    },');

// Inject telugu connectome
code = code.replace(/te: \{/, 'te: {\n    connectome: {\n      title: "ఫ్లైవైర్ ఏఐ కనెక్టోమ్",\n      subtitle: "డీప్ లెర్నింగ్ స్పేషియల్ గ్రాఫ్ న్యూరల్ నెట్‌వర్క్ ప్రాసెసింగ్...",\n      analyze: "గ్రాఫ్ అనాలిసిస్ రన్ చేయండి",\n      upload: "డ్రోన్ డేటా అప్‌లోడ్ చేయండి",\n      aiInsight: "ఏఐ గ్రాఫ్ ఇన్‌సైట్",\n      nodes: "నోడ్స్",\n      edges: "ఎడ్జెస్",\n      nodeId: "నోడ్ ID",\n      connections: "కనెక్షన్స్",\n      riskLevel: "రిస్క్ లెవెల్"\n    },');

fs.writeFileSync('d:/SIH/frontend/src/translations.js', code, 'utf8');
console.log("Done");
