import { LayoutDashboard, Map, Settings, X, Search, ShieldCheck, Database, Camera, TrendingDown, FileDown } from 'lucide-react';
import { translations } from '../translations';

export default function Sidebar({ activeTab, setActiveTab, isOpen, closeSidebar, lang }) {
  const t = translations[lang]?.sidebar || translations['en'].sidebar;

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="sidebar-title" style={{ margin: 0 }}>
          <Map size={24} color="var(--accent-primary)" />
          Geo<span>Sync</span>
        </h1>
        {isOpen && (
          <button className="mobile-menu-btn" onClick={closeSidebar}>
            <X size={24} />
          </button>
        )}
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 1rem', marginBottom: '0.5rem' }}>
          {t.core}
        </div>
        
        <button 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => { setActiveTab('dashboard'); closeSidebar(); }}
        >
          <LayoutDashboard size={20} /> {t.dashboard}
        </button>
        <button 
          className={`nav-item ${activeTab === 'citizen' ? 'active' : ''}`}
          onClick={() => { setActiveTab('citizen'); closeSidebar(); }}
        >
          <ShieldCheck size={20} /> {t.citizen}
        </button>
        <button 
          className={`nav-item ${activeTab === 'workspace' ? 'active' : ''}`}
          onClick={() => { setActiveTab('workspace'); closeSidebar(); }}
        >
          <Search size={20} /> {t.workspace}
        </button>
        <button 
          className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => { setActiveTab('analytics'); closeSidebar(); }}
        >
          <TrendingDown size={20} /> {t.analytics}
        </button>

        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 1rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
          {t.enterprise}
        </div>

        <button 
          className={`nav-item ${activeTab === 'drone' ? 'active' : ''}`}
          onClick={() => { setActiveTab('drone'); closeSidebar(); }}
        >
          <Camera size={20} /> {t.geoai} <span className="badge badge-yellow" style={{ fontSize: '0.6rem', marginLeft: 'auto' }}>BETA</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'blockchain' ? 'active' : ''}`}
          onClick={() => { setActiveTab('blockchain'); closeSidebar(); }}
        >
          <ShieldCheck size={20} /> {t.blockchain}
        </button>
        <button 
          className={`nav-item ${activeTab === 'export' ? 'active' : ''}`}
          onClick={() => { setActiveTab('export'); closeSidebar(); }}
        >
          <FileDown size={20} /> {t.export}
        </button>

        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 1rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
          {t.system}
        </div>
        <button 
          className={`nav-item ${activeTab === 'database' ? 'active' : ''}`}
          onClick={() => { setActiveTab('database'); closeSidebar(); }}
        >
          <Database size={20} /> DB Explorer
        </button>
        <button 
          className={`nav-item ${activeTab === 'provenance' ? 'active' : ''}`}
          onClick={() => { setActiveTab('provenance'); closeSidebar(); }}
        >
          <ShieldCheck size={20} /> {t.provenance}
        </button>
        <button 
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => { setActiveTab('settings'); closeSidebar(); }}
        >
          <Settings size={20} /> {t.settings}
        </button>
      </nav>
    </aside>
  );
}
