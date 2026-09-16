export const translations = {
  en: {
    sidebar: {
      core: "Core Modules",
      dashboard: "System Dashboard",
      citizen: "Citizen G2C Portal",
      workspace: "Active Workspace",
      analytics: "Tax Leakage Analytics",
      enterprise: "Enterprise Integrations",
      geoai: "GeoAI Extraction",
      blockchain: "Blockchain Ledger",
      export: "Export Cadastral PDF",
      system: "System",
      provenance: "Data Provenance",
      settings: "Settings"
    },
    header: {
      role: "Role:",
      approver: "👑 Chief Approver",
      surveyor: "🚶‍♂️ Field Surveyor"
    },
    citizen: {
      title: "Public Land Verification Portal",
      subtitle: "Direct G2C transparency. Instantly check if your land boundaries are verified or disputed.",
      placeholder: "Enter Property ID or Aadhaar linked Khasra Number...",
      search: "Verify",
      owner: "Registered Owner",
      area: "Computed Spatial Area",
      system: "System Assessment:"
    },
    workspace: {
      search: "Search any place in India...",
      geoView: "Geospatial View",
      features: "features",
      auto: "Auto",
      review: "Review",
      conflict: "Conflict",
      reset: "Reset",
      ingest: "Ingest Area",
      run: "Run Engine"
    },
    review: {
      queue: "Review Queue",
      pending: "pending",
      entity: "Entity",
      spatial: "Spatial",
      attribute: "Attribute",
      conflict: "GEOMETRY CONFLICT",
      cadastral: "Cadastral:",
      municipal: "Municipal:",
      accept: "Accept",
      reject: "Reject",
      autofix: "Auto-Fix"
    },
    dashboard: {
      title: "Overview Dashboard",
      subtitle: "GeoSync Reconciliation Engine Status",
      total: "Total Entities",
      auto: "Auto-Harmonized",
      pending: "Pending Review",
      conflicts: "Conflicts",
      taxTitle: "Property Tax Leakage Recovered",
      taxDesc: "Identified unregistered constructions via spatial reconciliation.",
      datasets: "Data Pipelines"
    },
    analytics: {
      title: "Tax Leakage & Analytics",
      pdf: "Generate Official PDF Report",
      ghost: "Unregistered \"Ghost\" Buildings",
      ghostDesc: "Detected via Drone/Satellite (ORI)",
      revenue: "Est. Revenue Recovered (₹)",
      revenueDesc: "Based on average municipal property tax",
      pending: "Pending Spatial Conflicts",
      pendingDesc: "Awaiting manual surveyor review",
      pipeline: "Spatial Conflict Resolution Pipeline",
      autoHarmonized: "Auto-Harmonized (High Confidence)",
      topoMismatch: "Topology Mismatches (IoU < 80%)",
      entityConflicts: "Entity Type Conflicts (LLM Flagged)",
      ingested: "Ingested Datasets",
      drone: "High-Res Drone Imagery (ORI)",
      cadastral: "Cadastral Records (Vector)",
      municipal: "Municipal Property Tax DB",
      cors: "GNSS Ground Truthing (CORS)"
    }
  },
  hi: {
    sidebar: {
      core: "मुख्य मॉड्यूल",
      dashboard: "सिस्टम डैशबोर्ड",
      citizen: "नागरिक G2C पोर्टल",
      workspace: "सक्रिय कार्यक्षेत्र",
      analytics: "कर रिसाव विश्लेषण",
      enterprise: "एंटरप्राइज़ एकीकरण",
      geoai: "जिओएआई निष्कर्षण",
      blockchain: "ब्लॉकचेन लेजर",
      export: "कैडस्ट्रल पीडीएफ निर्यात करें",
      system: "सिस्टम",
      provenance: "डेटा उत्पत्ति",
      settings: "सेटिंग्स"
    },
    header: {
      role: "भूमिका:",
      approver: "👑 मुख्य अधिकारी",
      surveyor: "🚶‍♂️ फील्ड सर्वेक्षक"
    },
    citizen: {
      title: "सार्वजनिक भूमि सत्यापन पोर्टल",
      subtitle: "प्रत्यक्ष G2C पारदर्शिता। तुरंत जांचें कि आपकी भूमि की सीमाएं सत्यापित हैं या विवादित।",
      placeholder: "संपत्ति आईडी या आधार लिंक खसरा नंबर दर्ज करें...",
      search: "सत्यापित करें",
      owner: "पंजीकृत मालिक",
      area: "गणना किया गया स्थानिक क्षेत्र",
      system: "सिस्टम मूल्यांकन:"
    },
    workspace: {
      search: "भारत में किसी भी स्थान को खोजें...",
      geoView: "स्थानिक दृश्य",
      features: "सुविधाएँ",
      auto: "स्वतः",
      review: "समीक्षा",
      conflict: "विवाद",
      reset: "रीसेट",
      ingest: "क्षेत्र लें",
      run: "इंजन चलाएँ"
    },
    review: {
      queue: "समीक्षा कतार",
      pending: "लंबित",
      entity: "इकाई",
      spatial: "स्थानिक",
      attribute: "गुण",
      conflict: "ज्यामिति विवाद",
      cadastral: "कैडस्ट्रल:",
      municipal: "नगरपालिका:",
      accept: "स्वीकार करें",
      reject: "अस्वीकार करें",
      autofix: "स्वतः सुधार"
    },
    dashboard: {
      title: "अवलोकन डैशबोर्ड",
      subtitle: "जिओसिंक समाधान इंजन स्थिति",
      total: "कुल इकाइयाँ",
      auto: "स्वतः-सामंजस्यपूर्ण",
      pending: "लंबित समीक्षा",
      conflicts: "विवाद",
      taxTitle: "संपत्ति कर रिसाव वसूल किया गया",
      taxDesc: "स्थानिक समाधान के माध्यम से अपंजीकृत निर्माणों की पहचान की गई।",
      datasets: "डेटा पाइपलाइन"
    },
    analytics: {
      title: "कर रिसाव एवं विश्लेषण",
      pdf: "आधिकारिक पीडीएफ रिपोर्ट बनाएं",
      ghost: "अपंजीकृत \"भूत\" इमारतें",
      ghostDesc: "ड्रोन/उपग्रह के माध्यम से पता लगाया गया (ORI)",
      revenue: "अनुमानित राजस्व वसूली (₹)",
      revenueDesc: "औसत नगरपालिका संपत्ति कर के आधार पर",
      pending: "लंबित स्थानिक विवाद",
      pendingDesc: "मैनुअल सर्वेक्षक समीक्षा की प्रतीक्षा में",
      pipeline: "स्थानिक विवाद समाधान पाइपलाइन",
      autoHarmonized: "स्वतः-सामंजस्यपूर्ण (उच्च विश्वास)",
      topoMismatch: "टोपोलॉजी बेमेल (IoU < 80%)",
      entityConflicts: "इकाई प्रकार विवाद (LLM द्वारा चिह्नित)",
      ingested: "अंतर्ग्रहण किए गए डेटासेट",
      drone: "उच्च-रिज़ॉल्यूशन ड्रोन इमेजरी (ORI)",
      cadastral: "कैडस्ट्रल रिकॉर्ड (वेक्टर)",
      municipal: "नगरपालिका संपत्ति कर डीबी",
      cors: "GNSS ग्राउंड ट्रुथिंग (CORS)"
    }
  },
  te: {
    sidebar: {
      core: "కోర్ మాడ్యూల్స్",
      dashboard: "సిస్టమ్ డాష్‌బోర్డ్",
      citizen: "సిటిజన్ G2C పోర్టల్",
      workspace: "క్రియాశీల వర్క్‌స్పేస్",
      analytics: "పన్ను లీకేజీ విశ్లేషణ",
      enterprise: "ఎంటర్‌ప్రైజ్ ఇంటిగ్రేషన్స్",
      geoai: "జియోఏఐ ఎక్స్‌ట్రాక్షన్",
      blockchain: "బ్లాక్‌చెయిన్ లెడ్జర్",
      export: "కాడాస్ట్రల్ PDF ఎగుమతి చేయండి",
      system: "సిస్టమ్",
      provenance: "డేటా మూలం",
      settings: "సెట్టింగ్‌లు"
    },
    header: {
      role: "పాత్ర:",
      approver: "👑 ముఖ్య అధికారి",
      surveyor: "🚶‍♂️ ఫీల్డ్ సర్వేయర్"
    },
    citizen: {
      title: "పబ్లిక్ ల్యాండ్ వెరిఫికేషన్ పోర్టల్",
      subtitle: "G2C పారదర్శకత. మీ భూమి సరిహద్దులు ధృవీకరించబడ్డాయో లేదా వివాదాస్పదంగా ఉన్నాయో తక్షణమే తనిఖీ చేయండి.",
      placeholder: "ఆస్తి ID లేదా ఆధార్ లింక్ చేయబడిన ఖస్రా నంబర్‌ను నమోదు చేయండి...",
      search: "ధృవీకరించండి",
      owner: "నమోదిత యజమాని",
      area: "కంప్యూటెడ్ ఏరియా",
      system: "సిస్టమ్ అంచనా:"
    },
    workspace: {
      search: "భారతదేశంలో ఏ స్థలాన్నైనా శోధించండి...",
      geoView: "జియోస్పేషియల్ వీక్షణ",
      features: "లక్షణాలు",
      auto: "ఆటో",
      review: "సమీక్ష",
      conflict: "వివాదం",
      reset: "రీసెట్",
      ingest: "ప్రాంతం తీసుకోండి",
      run: "ఇంజిన్ నడపండి"
    },
    review: {
      queue: "సమీక్ష క్యూ",
      pending: "పెండింగ్‌లో ఉంది",
      entity: "ఎంటిటీ",
      spatial: "ప్రాదేశిక",
      attribute: "లక్షణం",
      conflict: "జ్యామితి వివాదం",
      cadastral: "కాడాస్ట్రల్:",
      municipal: "మునిసిపల్:",
      accept: "అంగీకరించండి",
      reject: "తిరస్కరించండి",
      autofix: "ఆటో-ఫిక్స్"
    },
    dashboard: {
      title: "అవలోకనం డాష్‌బోర్డ్",
      subtitle: "జియోసింక్ రికన్సిలియేషన్ ఇంజిన్ స్థితి",
      total: "మొత్తం ఎంటిటీలు",
      auto: "ఆటో-హార్మోనైజ్ చేయబడింది",
      pending: "పెండింగ్ సమీక్ష",
      conflicts: "వివాదాలు",
      taxTitle: "ఆస్తి పన్ను లీకేజీ రికవరీ",
      taxDesc: "ప్రాదేశిక సయోధ్య ద్వారా నమోదుకాని నిర్మాణాలను గుర్తించారు.",
      datasets: "డేటా పైప్‌లైన్స్"
    },
    analytics: {
      title: "పన్ను లీకేజీ & విశ్లేషణ",
      pdf: "అధికారిక PDF నివేదికను రూపొందించండి",
      ghost: "నమోదుకాని \"ఘోస్ట్\" భవనాలు",
      ghostDesc: "డ్రోన్/శాటిలైట్ (ORI) ద్వారా కనుగొనబడింది",
      revenue: "అంచనా వేయబడిన ఆదాయం రికవరీ (₹)",
      revenueDesc: "సగటు మునిసిపల్ ఆస్తి పన్ను ఆధారంగా",
      pending: "పెండింగ్ స్పేషియల్ వివాదాలు",
      pendingDesc: "మాన్యువల్ సర్వేయర్ సమీక్ష కోసం వేచి ఉంది",
      pipeline: "స్పేషియల్ వివాదాల పరిష్కారం పైప్‌లైన్",
      autoHarmonized: "ఆటో-హార్మోనైజ్ చేయబడింది (అధిక నమ్మకం)",
      topoMismatch: "టోపోలజీ అసమానతలు (IoU < 80%)",
      entityConflicts: "ఎంటిటీ రకం వివాదాలు (LLM ఫ్లాగ్ చేయబడింది)",
      ingested: "తీసుకున్న డేటాసెట్‌లు",
      drone: "హై-రిజల్యూషన్ డ్రోన్ ఇమేజరీ (ORI)",
      cadastral: "కాడాస్ట్రల్ రికార్డ్స్ (వెక్టర్)",
      municipal: "మునిసిపల్ ప్రాపర్టీ టాక్స్ DB",
      cors: "GNSS గ్రౌండ్ ట్రూతింగ్ (CORS)"
    }
  }
};
