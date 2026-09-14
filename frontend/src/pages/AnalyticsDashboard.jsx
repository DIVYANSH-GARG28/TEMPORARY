import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingDown, AlertTriangle, Building, IndianRupee, ShieldAlert, Check } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem', height: 'calc(100vh - 120px)', overflowY: 'auto' }} className="custom-scrollbar">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingDown size={28} color="var(--status-red)" /> Tax Leakage & Analytics
        </h2>
        <span className="badge badge-red">LIVE SYNC</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        
        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '4px solid var(--status-red)' }}>
          <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={20} /> Unregistered "Ghost" Buildings
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            {totalGhost}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--status-red)' }}>
            <AlertTriangle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
            Detected via Drone/Satellite (ORI)
          </div>
        </div>

        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '4px solid var(--status-green)' }}>
          <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IndianRupee size={20} /> Est. Revenue Recovered (₹)
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--status-green)' }}>
            {potentialRevenue.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Based on average municipal property tax
          </div>
        </div>

        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '4px solid var(--status-yellow)' }}>
          <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={20} /> Pending Spatial Conflicts
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--status-yellow)' }}>
            {pendingConflicts}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Awaiting manual surveyor review
          </div>
        </div>

      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        <div className="panel-card" style={{ flex: '1 1 400px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem' }}>Spatial Conflict Resolution Pipeline</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span>Auto-Harmonized (High Confidence)</span>
              <span style={{ color: 'var(--status-green)' }}>{data.stats?.auto_harmonized || 0}</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '75%', background: 'var(--status-green)' }}></div>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span>Topology Mismatches (IoU &lt; 80%)</span>
              <span style={{ color: 'var(--status-yellow)' }}>{data.stats?.manual_review || 0}</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '15%', background: 'var(--status-yellow)' }}></div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span>Entity Type Conflicts (LLM Flagged)</span>
              <span style={{ color: 'var(--status-red)' }}>{data.stats?.entity_type_conflict || 0}</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '10%', background: 'var(--status-red)' }}></div>
            </div>
          </div>
        </div>

        <div className="panel-card" style={{ flex: '1 1 300px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem' }}>Ingested Datasets</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span>High-Res Drone Imagery (ORI)</span>
              <Check size={16} color="var(--status-green)" />
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span>Cadastral Records (Vector)</span>
              <Check size={16} color="var(--status-green)" />
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span>Municipal Property Tax DB</span>
              <Check size={16} color="var(--status-green)" />
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
              <span>GNSS Ground Truthing (CORS)</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--status-yellow)' }}>Syncing...</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
