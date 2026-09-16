import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingDown, AlertTriangle, Building, IndianRupee, ShieldAlert, Check } from 'lucide-react';
import { translations } from '../translations';

export default function AnalyticsDashboard({ lang = 'en' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const t = translations[lang]?.analytics || translations['en'].analytics;

  useEffect(() => {
    axios.get('http://localhost:8000/api/reconciliation/financials')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading financial analytics...</div>;
  if (!data) return <div style={{ padding: '2rem', color: 'var(--status-red)' }}>Failed to load analytics.</div>;

  const totalGhost = data.ghost_buildings_identified;
  const potentialRevenue = data.potential_revenue_recovered;
  const pendingConflicts = data.pending_conflicts;

  const autoVal = data.stats?.auto_harmonized || 0;
  const topoVal = data.stats?.manual_review || 0;
  const entityVal = data.stats?.entity_type_conflict || 0;
  const totalStats = autoVal + topoVal + entityVal;
  
  const getWidth = (val) => totalStats > 0 ? `${(val / totalStats) * 100}%` : '0%';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem', height: 'calc(100vh - 120px)', overflowY: 'auto' }} className="custom-scrollbar">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingDown size={28} color="var(--status-red)" /> {t.title}
        </h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            className="btn btn-secondary hide-on-print" 
            onClick={() => {
              document.title = "GeoSync_Official_Report";
              window.print();
            }}
          >
            📄 {t.pdf}
          </button>
          <span className="badge badge-red hide-on-print">LIVE SYNC</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        
        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '4px solid var(--status-red)' }}>
          <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={20} /> {t.ghost}
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            {totalGhost}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--status-red)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <AlertTriangle size={14} /> {t.ghostDesc}
          </div>
        </div>

        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '4px solid var(--status-green)' }}>
          <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IndianRupee size={20} /> {t.revenue}
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--status-green)' }}>
            {potentialRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {t.revenueDesc}
          </div>
        </div>

        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '4px solid var(--status-yellow)' }}>
          <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={20} /> {t.pending}
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--status-yellow)' }}>
            {pendingConflicts}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {t.pendingDesc}
          </div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{t.pipeline}</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span>{t.autoHarmonized}</span>
                <span style={{ color: 'var(--status-green)', fontWeight: 'bold' }}>{autoVal}</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: getWidth(autoVal), background: 'var(--status-green)', transition: 'width 1s ease-out' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span>{t.topoMismatch}</span>
                <span style={{ color: 'var(--status-yellow)', fontWeight: 'bold' }}>{topoVal}</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: getWidth(topoVal), background: 'var(--status-yellow)', transition: 'width 1s ease-out' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span>{t.entityConflicts}</span>
                <span style={{ color: 'var(--status-red)', fontWeight: 'bold' }}>{entityVal}</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: getWidth(entityVal), background: 'var(--status-red)', transition: 'width 1s ease-out' }}></div>
              </div>
            </div>

          </div>
        </div>

        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{t.ingested}</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem' }}>{t.drone}</span>
              <Check size={16} color="var(--status-green)" />
            </div>
            <div style={{ height: '1px', background: 'var(--border-color)' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem' }}>{t.cadastral}</span>
              <Check size={16} color="var(--status-green)" />
            </div>
            <div style={{ height: '1px', background: 'var(--border-color)' }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem' }}>{t.municipal}</span>
              <Check size={16} color="var(--status-green)" />
            </div>
            <div style={{ height: '1px', background: 'var(--border-color)' }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem' }}>{t.cors}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--status-green)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Check size={14} /> Live Stream
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
