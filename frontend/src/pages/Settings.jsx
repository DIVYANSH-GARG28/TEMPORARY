import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Database, Shield, Globe } from 'lucide-react';

export default function Settings() {
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("Settings saved successfully!");
    }, 800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem', height: 'calc(100vh - 120px)', overflowY: 'auto' }} className="custom-scrollbar">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
          <SettingsIcon size={28} color="var(--accent-primary)" /> System Configurations
        </h2>
        <button 
          className="btn btn-primary" 
          onClick={handleSave}
          disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
        >
          {saving ? <div className="lucide-spin" style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }}></div> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
        
        {/* AI Parameters */}
        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Shield size={18} /> GeoAI Parameters</h3>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Intersection over Union (IoU) Threshold for Auto-Harmonization</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input type="range" min="0" max="100" defaultValue="80" style={{ flex: 1 }} />
              <span style={{ fontWeight: 'bold' }}>80%</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Matches below this threshold will be flagged for manual review.</p>
          </div>
        </div>

        {/* Database */}
        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Database size={18} /> PostgreSQL PostGIS Config</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Host</label>
              <input type="text" defaultValue="localhost:5432" disabled style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Database Name</label>
              <input type="text" defaultValue="geosync_db" disabled style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
