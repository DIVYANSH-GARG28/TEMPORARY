const { translations } = require('./frontend/src/translations.js');
const checkLang = (lang) => {
  const t = translations[lang];
  console.log(`Checking ${lang}...`);
  ['sidebar', 'header', 'citizen', 'workspace', 'review', 'dashboard', 'analytics'].forEach(key => {
    if (!t[key]) console.log(`  Missing key: ${key}`);
  });
};
checkLang('en');
checkLang('hi');
checkLang('te');
