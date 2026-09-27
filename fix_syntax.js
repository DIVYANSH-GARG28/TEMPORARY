const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/translations.js', 'utf8');

const corsIndex = code.indexOf('cors: "GNSS');
if (corsIndex !== -1) {
    const nextBrace = code.indexOf('}', corsIndex);
    const cleanedCode = code.substring(0, nextBrace + 1);
    const te_dict = `
  },
  te: {
    sidebar: { dashboard: "డాష్‌బోర్డ్", citizen: "పౌర పోర్టల్ (G2C)", database: "డేటాబేస్", connectome: "ప్రాపర్టీ కనెక్టోమ్", ingest: "కొత్త డేటా", workspace: "సమన్వయ ప్రదేశం", analytics: "విశ్లేషణలు", enterprise: "ఎంటర్‌ప్రైజ్", geoai: "జియో-ఏఐ", blockchain: "బ్లాక్‌చెయిన్", export: "డేటా ఎగుమతి", system: "సిస్టమ్", provenance: "ఆడిట్ హిస్టరీ", settings: "సెట్టింగులు" },
    header: { role: "పాత్ర:", approver: "చీఫ్ అప్రూవర్", surveyor: "ఫీల్డ్ సర్వేయర్" },
    citizen: { title: "పౌర ఆస్తి నివేదిక పోర్టల్", subtitle: "పారదర్శకతను పెంచడం కోసం పౌరులు తమ ఆస్తి వివరాలను సరిదిద్దుకునే అవకాశం.", placeholder: "మీ ఆస్తి ID లేదా మీ పేరు నమోదు చేయండి...", search: "వెతకండి", owner: "యజమాని:", area: "నమోదైన విస్తీర్ణం:", system: "సిస్టమ్ రికార్డు:" },
    workspace: { search: "ఆస్తి ID, యజమాని పేరు లేదా చిరునామాతో వెతకండి...", geoView: "భౌగోళిక వీక్షణ", features: "లక్షణాలు", auto: "ఆటో-యాక్సెప్ట్", review: "సమీక్ష పెండింగ్", conflict: "తిరస్కరించబడింది", reset: "డేటాబేస్ రీసెట్", ingest: "కొత్త డేటా", run: "ఆడిట్ రన్ చేయండి" },
    review: { queue: "సమీక్ష క్యూ", pending: "పెండింగ్", entity: "ఆస్తి", spatial: "భౌగోళిక", attribute: "వివరాలు", conflict: "సమస్యలు", cadastral: "రెవెన్యూ:", municipal: "మున్సిపల్:", accept: "ఆమోదించు", reject: "తిరస్కరించు", autofix: "ఆటో-ఫిక్స్" },
    dashboard: { title: "జియోసింక్ కమాండ్ సెంటర్", subtitle: "ప్రాపర్టీ ట్యాక్స్ ఫ్రాడ్ మరియు ఆక్రమణల ట్రాకింగ్", total: "మొత్తం ఆస్తులు", auto: "ఆటో-యాక్సెప్ట్ అయినవి", pending: "పెండింగ్ రివ్యూ", conflicts: "దొరికిన మోసాలు", taxTitle: "ప్రాపర్టీ ట్యాక్స్ రిస్క్ అంచనా", taxDesc: "మున్సిపల్ రికార్డులతో రెవెన్యూ రికార్డులను పోల్చి చూసిన తర్వాత లెక్కింపు", datasets: "కనెక్ట్ చేసిన డేటాబేస్‌లు" },
    analytics: { title: "ట్యాక్స్ ఫ్రాడ్ మరియు ఆక్రమణల విశ్లేషణ", pdf: "PDF రిపోర్ట్ డౌన్‌లోడ్", ghost: "ఘోస్ట్ ప్రాపర్టీలు (లెక్కలోకి రానివి)", ghostDesc: "రెవెన్యూ/మున్సిపల్ రికార్డులలో లేని కానీ డ్రోన్ చిత్రాలలో కనిపించే నిర్మాణాలు.", revenue: "లీకైన ట్యాక్స్ ఆదాయం (₹)", revenueDesc: "రికార్డుల్లో చూపించని అంతస్తులు మరియు వాణిజ్య భవనాల వల్ల నష్టపోయిన ట్యాక్స్.", pending: "పెండింగ్ ఆస్తులు", pendingDesc: "మ్యానువల్ రివ్యూ కోసం ఎదురుచూస్తున్న ఆస్తులు.", pipeline: "పైప్‌లైన్ గణాంకలు", autoHarmonized: "ఆటో-యాక్సెప్ట్ (కచ్చితమైనవి)", topoMismatch: "భౌగోళిక తేడాలు (IoU < 80%)", entityConflicts: "డేటాబేస్ తేడాలు (LLM అనాలిసిస్)", ingested: "మొత్తం రికార్డులు", drone: "డ్రోన్ (ORI) రికార్డులు", cadastral: "రెవెన్యూ (Cadastral) రికార్డులు", municipal: "మున్సిపల్ (Municipal) రికార్డులు", cors: "GNSS రిఫరెన్స్ (CORS)" }
  }
};
`;
    fs.writeFileSync('d:/SIH/frontend/src/translations.js', cleanedCode + te_dict, 'utf8');
}
