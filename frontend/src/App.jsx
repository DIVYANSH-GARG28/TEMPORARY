import { useState, useEffect } from 'react';
import { Menu, X, Bell } from 'lucide-react';
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
import Settings from './pages/Settings';
import CitizenPortal from './pages/CitizenPortal';
import { translations } from './translations';
import './index.css';

// Global Toast Event Dispatcher Helper
export const triggerToast = (msg, type = 'info') => {
  window.dispatchEvent(new CustomEvent('show-toast', { detail: { msg, type } }));
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState('chief_approver');
  const [lang, setLang] = useState('en');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  
  // Global Toast State
  const [toast, setToast] = useState(null);

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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard lang={lang} />;
      case 'analytics': return <AnalyticsDashboard lang={lang} />;
      case 'drone': return <DroneFeed />;
      case 'blockchain': return <BlockchainLedger />;
      case 'export': return <ExportCadastral />;
      case 'settings': return <Settings />;
      case 'citizen': return <CitizenPortal lang={lang} />;
      case 'workspace': 
        return (
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
        );
      case 'provenance': return <Provenance />;
      default: return <Dashboard />;
    }
  };

  const closeSidebar = () => setSidebarOpen(false);

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
          <button 
            className="mobile-menu-btn" 
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            style={{ display: 'flex', alignItems: 'center', color: 'var(--text-primary)' }}
          >
            <Menu size={24} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: 'auto' }}>
            <select 
              className="form-input" 
              style={{ width: 'auto', padding: '6px 12px', background: 'var(--bg-glass)', fontWeight: 'bold' }}
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              aria-label="Select Language"
            >
              <option value="en">🌐 English</option>
              <option value="hi">🇮🇳 हिन्दी (Hindi)</option>
              <option value="te">🇮🇳 తెలుగు (Telugu)</option>
            </select>
            
            <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 5px' }}></div>
            
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'none', '@media(min-width: 640px)': { display: 'inline' } }}>
              {translations[lang]?.header.role || "Role:"}
            </span>
            <select 
              className="form-input" 
              style={{ width: 'auto', padding: '6px 12px' }}
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              aria-label="Select User Role"
            >
              <option value="chief_approver">{translations[lang]?.header.approver || "👑 Chief Approver"}</option>
              <option value="field_surveyor">{translations[lang]?.header.surveyor || "🚶‍♂️ Field Surveyor"}</option>
            </select>
          </div>
        </header>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {renderContent()}
        </div>
      </main>

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
