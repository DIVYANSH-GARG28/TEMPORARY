import React, { useEffect, useState } from 'react';
import { Layers, CheckCircle, AlertTriangle, XCircle, Loader2, TrendingUp, Shield, Zap, BarChart3 } from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:8000/api';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, auto: 0, review: 0, rejected: 0 });
  const [datasets, setDatasets] = useState([]);
  const [financials, setFinancials] = useState({});

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resEntities, resDatasets, resFinancials] = await Promise.all([
        axios.get(`${API}/reconciliation/results`),
        axios.get(`${API}/datasets/`),
        axios.get(`${API}/reconciliation/financials`)
      ]);

      const entities = resEntities.data;
      setStats({
        total: entities.length,
        auto: entities.filter(e => e.status === 'AUTO_ACCEPT').length,
        review: entities.filter(e => e.status === 'PENDING_REVIEW').length,
        rejected: entities.filter(e => e.status === 'REJECTED').length,
      });
      setDatasets(resDatasets.data);
      setFinancials(resFinancials.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 16 }}>
        <div style={{ position: 'relative' }}>
          <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-primary)' }} />
          <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '2px solid var(--accent-primary)', opacity: .15, animation: 'ping 1.5s ease infinite' }} />
        </div>
        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading Dashboard…</span>
      </div>
    );
  }

  const cards = [
    { icon: <Layers size={22} />, label: 'Total Entities', value: stats.total, color: 'var(--accent-primary)', bg: 'rgba(59,130,246,.08)' },
    { icon: <CheckCircle size={22} />, label: 'Auto-Harmonized', value: stats.auto, color: 'var(--status-green)', bg: 'rgba(52,211,153,.08)' },
    { icon: <AlertTriangle size={22} />, label: 'Pending Review', value: stats.review, color: 'var(--status-yellow)', bg: 'rgba(251,191,36,.08)' },
    { icon: <XCircle size={22} />, label: 'Conflicts', value: stats.rejected, color: 'var(--status-red)', bg: 'rgba(248,113,113,.08)' },
  ];

  return (
    <div style={{ animation: 'fadeIn .4s ease' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>Overview Dashboard</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>GeoSync Reconciliation Engine Status</p>
        </div>
      </div>
      
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertTriangle size={18} />
          {error}
        </div>
      )}
      
      {/* Financial Impact Banner */}
      <div className="panel-card" style={{ 
        background: 'linear-gradient(135deg, rgba(16,185,129,.08), rgba(59,130,246,.05))',
        border: '1px solid rgba(16,185,129,.15)',
        marginBottom: '1.5rem',
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
        animation: 'slideIn .5s ease'
      }}>
        <div>
          <h2 style={{ color: 'var(--status-green)', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.05rem' }}>
            <TrendingUp size={20} />
            Property Tax Leakage Recovered
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
            Identified <strong style={{ color: 'var(--text-primary)' }}>{financials.ghost_buildings_identified || 0}</strong> unregistered constructions via spatial reconciliation.
          </p>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--status-green)', fontFamily: "'Inter', system-ui, sans-serif" }}>
          ₹{(financials.potential_revenue_recovered || 0).toLocaleString('en-IN')}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
        {cards.map((card, i) => (
          <div key={i} className="panel-card" style={{ 
            animation: `slideIn .4s cubic-bezier(.34,1.56,.64,1) ${i * 0.08}s both`,
            transition: 'transform .2s, box-shadow .2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: card.bg, display: 'flex', justifyContent: 'center', alignItems: 'center', color: card.color }}>
                {card.icon}
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{card.label}</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: card.color, lineHeight: 1 }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Reconciliation Stats Bar */}
      {stats.total > 0 && (
        <div className="panel-card" style={{ marginBottom: '1.5rem', animation: 'slideIn .5s .3s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <BarChart3 size={18} color="var(--accent-primary)" />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Reconciliation Breakdown</span>
          </div>
          <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', background: 'rgba(255,255,255,.04)' }}>
            {stats.auto > 0 && <div style={{ width: `${(stats.auto/stats.total)*100}%`, background: 'var(--status-green)', transition: 'width .8s ease' }} />}
            {stats.review > 0 && <div style={{ width: `${(stats.review/stats.total)*100}%`, background: 'var(--status-yellow)', transition: 'width .8s ease' }} />}
            {stats.rejected > 0 && <div style={{ width: `${(stats.rejected/stats.total)*100}%`, background: 'var(--status-red)', transition: 'width .8s ease' }} />}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--text-secondary)' }}>
            <span><span style={{ color: 'var(--status-green)', fontWeight: 700 }}>{((stats.auto/stats.total)*100).toFixed(0)}%</span> Auto</span>
            <span><span style={{ color: 'var(--status-yellow)', fontWeight: 700 }}>{((stats.review/stats.total)*100).toFixed(0)}%</span> Review</span>
            <span><span style={{ color: 'var(--status-red)', fontWeight: 700 }}>{((stats.rejected/stats.total)*100).toFixed(0)}%</span> Conflict</span>
          </div>
        </div>
      )}

      {/* Datasets Table */}
      <div className="panel-card" style={{ animation: 'slideIn .5s .4s both' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={18} color="var(--accent-primary)" />
          Loaded Datasets
        </h2>
        {datasets.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.15)', borderRadius: 8, fontSize: 13 }}>
            No data loaded. Navigate to the Reconciliation Map to ingest spatial data.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dataset Name</th>
                  <th>Source Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {datasets.map(ds => (
                  <tr key={ds.id}>
                    <td>{ds.name}</td>
                    <td style={{ textTransform: 'capitalize' }}>{ds.source_type}</td>
                    <td><span className="badge badge-green">Processed</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes ping { 0% { transform: scale(1); opacity: .3; } 100% { transform: scale(1.6); opacity: 0; } }
      `}} />
    </div>
  );
}
