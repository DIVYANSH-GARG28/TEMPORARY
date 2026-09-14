import { useState } from 'react';
import { Menu, X } from 'lucide-react';
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
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState('chief_approver'); // 'chief_approver' or 'field_surveyor'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedMatchId, setSelectedMatchId] = useState(null);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'analytics': return <AnalyticsDashboard />;
      case 'drone': return <DroneFeed />;
      case 'blockchain': return <BlockchainLedger />;
      case 'export': return <ExportCadastral />;
      case 'settings': return <Settings />;
      case 'workspace': 
        return (
          <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 120px)' }}>
             <div style={{ flex: '1 1 65%', minWidth: '0', display: 'flex', flexDirection: 'column' }}>
                <ReconciliationMap 
                  onMatchComplete={() => setRefreshKey(prev => prev + 1)} 
                  selectedMatchId={selectedMatchId}
                  refreshKey={refreshKey}
                />
             </div>
             <div style={{ flex: '1 1 35%', minWidth: '300px', overflowY: 'auto', paddingRight: '5px' }} className="custom-scrollbar">
                <ReviewQueue 
                  userRole={userRole} 
                  refreshKey={refreshKey} 
                  selectedMatchId={selectedMatchId}
                  onSelectMatch={setSelectedMatchId}
                  onReviewSubmit={() => setRefreshKey(prev => prev + 1)}
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
      />

      <main className="main-content">
        {/* Top Header */}
        <header style={{ 
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
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'none', '@media(min-width: 640px)': { display: 'inline' } }}>Demo Role:</span>
            <select 
              className="form-input" 
              style={{ width: 'auto', padding: '6px 12px' }}
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              aria-label="Select User Role"
            >
              <option value="chief_approver">👑 Chief Approver</option>
              <option value="field_surveyor">🚶‍♂️ Field Surveyor</option>
            </select>
          </div>
        </header>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
