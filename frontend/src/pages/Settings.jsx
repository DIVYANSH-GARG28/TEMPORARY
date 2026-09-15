import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Database, Shield, Globe, Bell, Moon } from 'lucide-react';
import { triggerToast } from '../App';

export default function Settings() {
  const [iouThreshold, setIouThreshold] = useState(() => Number(localStorage.getItem('naksha_iou_threshold')) || 80);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('naksha_dark_mode') !== 'false');
  const [notifications, setNotifications] = useState(() => localStorage.getItem('naksha_notifications') !== 'false');
  const [autoHarmonize, setAutoHarmonize] = useState(() => localStorage.getItem('naksha_auto_harmonize') !== 'false');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('naksha_dark_mode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('naksha_iou_threshold', iouThreshold);
  }, [iouThreshold]);

  useEffect(() => {
    localStorage.setItem('naksha_notifications', notifications);
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('naksha_auto_harmonize', autoHarmonize);
  }, [autoHarmonize]);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem', height: 'calc(100vh - 120px)', overflowY: 'auto', animation: 'fadeIn .4s ease' }} className="custom-scrollbar">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
          <SettingsIcon size={28} color="var(--accent-primary)" /> System Configurations
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', maxWidth: '1000px' }}>
        
        {/* AI Parameters */}
        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'slideIn 0.3s ease' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Shield size={18} color="var(--accent-primary)" /> GeoAI Parameters</h3>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Intersection over Union (IoU) Threshold for Auto-Harmonization</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input 
                type="range" 
                min="50" 
                max="100" 
                value={iouThreshold} 
                onChange={(e) => setIouThreshold(e.target.value)}
                style={{ flex: 1, accentColor: 'var(--accent-primary)', cursor: 'pointer' }} 
              />
              <span style={{ fontWeight: 'bold', minWidth: '40px', color: iouThreshold > 70 ? 'var(--status-green)' : 'var(--status-yellow)' }}>{iouThreshold}%</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Matches below this threshold will be flagged for manual review.</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Enable Auto-Harmonization</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Automatically merge High-Confidence entities</div>
            </div>
            <label className="switch">
              <input type="checkbox" checked={autoHarmonize} onChange={() => setAutoHarmonize(!autoHarmonize)} />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        {/* User Preferences */}
        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'slideIn 0.4s ease' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Moon size={18} color="var(--accent-primary)" /> App Preferences</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Dark Mode</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Toggle dark/light theme</div>
            </div>
            <label className="switch">
              <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
              <span className="slider round"></span>
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}><Bell size={14} style={{display:'inline', marginRight: '4px'}}/> Push Notifications</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Receive alerts for manual reviews</div>
            </div>
            <label className="switch">
              <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        {/* Database */}
        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'slideIn 0.5s ease' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Database size={18} color="var(--accent-primary)" /> PostgreSQL PostGIS Config</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Host</label>
              <input type="text" defaultValue="localhost:5432" disabled style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)', cursor: 'not-allowed' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Database Name</label>
              <input type="text" defaultValue="geosync_db" disabled style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)', cursor: 'not-allowed' }} />
            </div>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        
        .switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }
        .switch input { 
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(255,255,255,0.1);
          border: 1px solid var(--border-color);
          transition: .3s;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background-color: var(--text-secondary);
          transition: .3s;
        }
        input:checked + .slider {
          background-color: var(--accent-primary);
          border-color: var(--accent-primary);
        }
        input:checked + .slider:before {
          transform: translateX(20px);
          background-color: white;
        }
        .slider.round {
          border-radius: 24px;
        }
        .slider.round:before {
          border-radius: 50%;
        }
      `}} />
    </div>
  );
}
