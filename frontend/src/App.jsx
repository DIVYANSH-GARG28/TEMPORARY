import { useState, useEffect } from 'react';
import { Menu, X, Bell, ShieldCheck } from 'lucide-react';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import DroneFeed from './pages/DroneFeed';
import BlockchainLedger from './pages/BlockchainLedger';
import ExportCadastral from './pages/ExportCadastral';
import DataWorkspace from './pages/DataWorkspace';
import ReconciliationMap from './pages/ReconciliationMap';
import ReviewQueue from './pages/ReviewQueue';
import Provenance from './pages/Provenance';
import DatabaseViewer from './pages/DatabaseViewer';
import DataPipeline from './pages/DataPipeline';
import Settings from './pages/Settings';
import CitizenPortal from './pages/CitizenPortal';
import Connectome from './pages/Connectome';
import { translations } from './translations';
import './index.css';

// Global Toast Event Dispatcher Helper
export const triggerToast = (msg, type = 'info') => {
  window.dispatchEvent(new CustomEvent('show-toast', { detail: { msg, type } }));
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState('field_surveyor');
  const [lang, setLang] = useState('en');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  
  // Global Toast State
  const [toast, setToast] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authPasscode, setAuthPasscode] = useState('');
  const [authError, setAuthError] = useState(false);

  const submitAuth = () => {
    if (authPasscode === '1234') {
      setUserRole('chief_approver');
      setAuthModalOpen(false);
      triggerToast('Authentication successful. Security alert sent.', 'success');
    } else {
      setAuthError(true);
      triggerToast('Authentication failed. Privilege escalation denied.', 'error');
    }
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    if (newRole === 'chief_approver') {
      setAuthModalOpen(true);
      setAuthPasscode('');
      setAuthError(false);
      setUserRole('field_surveyor');
    } else {
      setUserRole(newRole);
    }
  };

  useEffect(() => {
    // Initialize Theme from Settings
    const isDark = localStorage.getItem('naksha_dark_mode') !== 'false';
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');

    // Global Toast Listener
    const handleToast = (e) => {
      setToast(e.detail);
      setTimeout(() => setToast(null), 4000);
    };
    window.addEventListener('show-toast', handleToast);
    return () => window.removeEventListener('show-toast', handleToast);
  }, []);

  
  const closeSidebar = () => setSidebarOpen(false);

  if (!isLoggedIn) return <Login onLogin={() => { setIsLoggedIn(true); localStorage.setItem('isLoggedIn', 'true'); }} />;

  return (
    <div className="app-container">
      {/* Mobile Overlay */}
      <div 
        className={`mobile-overlay ${sidebarOpen ? 'open' : ''}`} 
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={sidebarOpen} 
        closeSidebar={closeSidebar} 
        lang={lang}
      />

      <main className="main-content">
        {/* Top Header */}
        <header className="hide-on-print" style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          padding: '12px 20px', background: 'var(--bg-secondary)', 
          borderBottom: '1px solid var(--border-color)', marginBottom: '20px',
          borderRadius: '0.5rem', boxShadow: 'var(--shadow-sm)'
        }}>
            {/* Mobile Menu Button (Hidden on Desktop) */}
            <button 
              className="mobile-menu-btn" 
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              style={{ display: window.innerWidth < 768 ? 'flex' : 'none', alignItems: 'center', color: 'var(--text-primary)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <Menu size={24} />
            </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: 'auto' }}>
            <button onClick={() => { localStorage.removeItem("isLoggedIn"); window.location.reload(); }} className="btn btn-secondary" style={{ padding: "6px 12px", background: "var(--bg-glass)", color: "var(--text-primary)", fontWeight: "bold" }}>Logout</button>
            <select 
              className="form-input" 
              style={{ width: "auto", padding: '6px 12px', background: 'var(--bg-glass)', color: 'var(--text-primary)', fontWeight: 'bold' }}
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              aria-label="Select Language"
            >
              <option value="en">🇺🇸 English</option>
              <option value="hi">🇮🇳 हिन्दी (Hindi)</option>
              <option value="te">🇮🇳 తెలుగు (Telugu)</option>
            </select>
            
            <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 5px' }}></div>
            
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'none', '@media(min-width: 640px)': { display: 'inline' } }}>
              {translations[lang]?.header.role || "Role:"}
            </span>
            <select 
              className="form-input" 
              style={{ width: 'auto', padding: '6px 12px', background: 'var(--bg-glass)', color: 'var(--text-primary)' }}
              value={userRole}
              onChange={handleRoleChange}
              aria-label="Select User Role"
            >
              <option value="chief_approver">👑 Chief Approver</option>
              <option value="field_surveyor">👨‍🔬 Field Surveyor</option>
            </select>
          </div>
        </header>

        <div key={refreshKey} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
        {/* Render all tabs but hide inactive ones to preserve state */}
        <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none', height: '100%' }}>
          <Dashboard lang={lang} />
        </div>
        <div style={{ display: activeTab === 'analytics' ? 'block' : 'none', height: '100%' }}>
          <AnalyticsDashboard lang={lang} />
        </div>
        <div style={{ display: activeTab === 'citizen' ? 'block' : 'none', height: '100%' }}>
          <CitizenPortal lang={lang} />
        </div>
        <div style={{ display: activeTab === 'connectome' ? 'block' : 'none', height: '100%' }}>
          <Connectome lang={lang} />
        </div>
        <div style={{ display: activeTab === 'ingest' ? 'block' : 'none', height: '100%' }}>
          <DataPipeline onComplete={() => { setActiveTab('workspace'); setRefreshKey(prev => prev + 1); }} />
        </div>
        
        {/* Other tabs that don't need complex state persistence can just be conditionally rendered to save DOM nodes */}
        {activeTab === 'drone' && <DroneFeed />}
        {activeTab === 'blockchain' && <BlockchainLedger />}
        {activeTab === 'export' && <ExportCadastral />}
        {activeTab === 'settings' && <Settings />}
        {activeTab === 'database' && <DatabaseViewer />}
        {activeTab === 'provenance' && <Provenance />}
        {activeTab === 'workspace' && (
          <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 120px)' }}>
               <div style={{ flex: '1 1 65%', minWidth: '0', display: 'flex', flexDirection: 'column' }}>
                  <ReconciliationMap 
                    onMatchComplete={() => setRefreshKey(prev => prev + 1)} 
                    selectedMatchId={selectedMatchId}
                    refreshKey={refreshKey}
                    lang={lang}
                  />
               </div>
               <div style={{ flex: '1 1 35%', minWidth: '300px', overflowY: 'auto', paddingRight: '5px' }} className="custom-scrollbar">
                  <ReviewQueue 
                    userRole={userRole} 
                    refreshKey={refreshKey} 
                    selectedMatchId={selectedMatchId}
                    onSelectMatch={setSelectedMatchId}
                    onReviewSubmit={() => setRefreshKey(prev => prev + 1)}
                    lang={lang}
                  />
               </div>
          </div>
        )}

        </div>
      </main>

      
      {/* Auth Modal */}
      {authModalOpen && (
        <div className="mobile-overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, background: 'rgba(0,0,0,0.6)' }}>
          <div style={{
            background: 'var(--bg-glass)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
            padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-color)',
            width: '90%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column', gap: '1.5rem',
            animation: 'toastSlideIn 0.3s ease'
          }}>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', fontSize: '1.25rem' }}>
               <ShieldCheck size={24} color="var(--accent-primary)" /> Security Lock
            </h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Enter Chief Approver Passcode to elevate privileges. (Hint: 1234)
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <input 
                type="password" 
                value={authPasscode}
                onChange={e => { setAuthPasscode(e.target.value); setAuthError(false); }}
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') submitAuth(); }}
                style={{
                  width: '100%', padding: '12px 15px', background: 'var(--bg-primary)',
                  border: `1px solid ${authError ? 'var(--status-red)' : 'var(--border-color)'}`,
                  borderRadius: '10px', color: 'var(--text-primary)', outline: 'none',
                  boxSizing: 'border-box', fontSize: '1rem'
                }}
              />
              {authError && <span style={{ color: 'var(--status-red)', fontSize: '0.85rem' }}>Invalid passcode.</span>}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button onClick={() => setAuthModalOpen(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={submitAuth} className="btn btn-primary">Authenticate</button>
            </div>
          </div>
        </div>
      )}

      {/* Global Apple-Grade Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: 30, right: 30, zIndex: 99999,
          padding: '14px 20px', borderRadius: 12,
          background: 'var(--bg-glass)', backdropFilter: 'blur(20px)',
          border: `1px solid ${toast.type === 'success' ? 'var(--status-green)' : toast.type === 'error' ? 'var(--status-red)' : 'var(--accent-primary)'}`,
          color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, 
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
          animation: 'toastSlideIn .4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          display: 'flex', alignItems: 'center', gap: '10px',
          minWidth: '250px'
        }}>
          <Bell size={18} style={{ color: toast.type === 'success' ? 'var(--status-green)' : toast.type === 'error' ? 'var(--status-red)' : 'var(--accent-primary)' }} />
          {toast.msg}
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes toastSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}} />
    </div>
  );
}

export default App;
