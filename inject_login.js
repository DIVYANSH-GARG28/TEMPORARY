const fs = require('fs');
let code = fs.readFileSync('d:/SIH/frontend/src/App.jsx', 'utf8');

// 1. Import Login
if (!code.includes('import Login')) {
  code = code.replace(/import Sidebar from '\.\/components\/Sidebar';/, "import Login from './pages/Login';\nimport Sidebar from './components/Sidebar';");
}

// 2. Add isLoggedIn state
if (!code.includes('const [isLoggedIn')) {
  code = code.replace(/const \[activeTab, setActiveTab\] = useState\('dashboard'\);/, "const [isLoggedIn, setIsLoggedIn] = useState(false);\n  const [activeTab, setActiveTab] = useState('dashboard');");
}

// 3. Render Login if not logged in
if (!code.includes('if (!isLoggedIn) return <Login')) {
  code = code.replace(/return \(\n    <div className="app-container">/, "if (!isLoggedIn) return <Login onLogin={() => setIsLoggedIn(true)} />;\n\n  return (\n    <div className=\"app-container\">");
}

fs.writeFileSync('d:/SIH/frontend/src/App.jsx', code, 'utf8');
console.log("Login injected");
