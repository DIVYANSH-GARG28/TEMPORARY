import React, { useEffect, useState } from 'react';
import { Layers, CheckCircle, AlertTriangle, XCircle, Loader2, TrendingUp, Shield, Zap, BarChart3 } from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:8000/api';

// Animated Counter Component
const AnimatedCounter = ({ value, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!value) {
      setCount(0);
      return;
    }
    const end = parseInt(value, 10);
    const duration = 1200; // ms
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;
    
    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(end * ease));
      if (frame === totalFrames) clearInterval(counter);
    }, frameRate);
    
    return () => clearInterval(counter);
  }, [value]);

  return <>{prefix}{count.toLocaleString('en-IN')}{suffix}</>;
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, auto: 0, review: 0, rejected: 0 });
  const [datasets, setDatasets] = useState([]);
  const [financials, setFinancials] = useState({ ghost_buildings_identified: 0, potential_revenue_recovered: 0 });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resEntities, resDatasets] = await Promise.all([
        axios.get(`${API}/reconciliation/results`).catch(() => ({ data: [] })),
        axios.get(`${API}/datasets/`).catch(() => ({ data: [] }))
      ]);

      let resFinancials = { data: { ghost_buildings_identified: 0, potential_revenue_recovered: 0 } };
      try {
        const f = await axios.get(`${API}/reconciliation/financials`);
        if (f.data && Object.keys(f.data).length > 0) resFinancials = f;
      } catch (e) {
        // Fallback to 0 if endpoint missing or errors
      }

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
      setError("Failed to fetch dashboard data. Make sure the backend is running.");
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
        <div className="alert alert-error" style={{ marginBottom: '1.5rem', animation: 'slideIn .3s ease' }}>
          <AlertTriangle size={18} />
          {error}
        </div>
      )}
      
      {/* Financial Impact Banner */}
      <div className="panel-card" style={{ 
        background: 'linear-gradient(135deg, rgba(16,185,129,.08), rgba(59,130,246,.05))',
        border: '1px solid rgba(16,185,129,.2)',
        marginBottom: '1.5rem',
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
        animation: 'slideIn .4s ease',
        boxShadow: '0 4px 20px rgba(16,185,129,0.05)',
        transition: 'transform 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div>
          <h2 style={{ color: 'var(--status-green)', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.05rem' }}>
            <TrendingUp size={20} />
            Property Tax Leakage Recovered
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
            Identified <strong style={{ color: 'var(--text-primary)' }}><AnimatedCounter value={financials.ghost_buildings_identified || 0} /></strong> unregistered constructions via spatial reconciliation.
          </p>
        </div>
        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--status-green)', fontFamily: "'Inter', system-ui, sans-serif", textShadow: '0 0 20px rgba(16,185,129,0.3)' }}>
          <AnimatedCounter value={financials.potential_revenue_recovered || 0} prefix="₹" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
        {cards.map((card, i) => (
          <div key={i} className="panel-card" style={{ 
            animation: `slideIn .4s cubic-bezier(.34,1.56,.64,1) ${(i * 0.1) + 0.1}s both`,
            transition: 'all .2s ease',
            border: '1px solid var(--border-color)'
          }}
            onMouseEnter={e => { 
              e.currentTarget.style.transform = 'translateY(-4px)'; 
              e.currentTarget.style.boxShadow = `0 10px 25px -5px ${card.color.replace('var(--', 'var(--rgb-').replace(')', ', 0.1)')}`; 
              e.currentTarget.style.borderColor = card.color;
            }}
            onMouseLeave={e => { 
              e.currentTarget.style.transform = 'translateY(0)'; 
              e.currentTarget.style.boxShadow = 'none'; 
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: card.bg, display: 'flex', justifyContent: 'center', alignItems: 'center', color: card.color }}>
                {card.icon}
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{card.label}</span>
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: card.color, lineHeight: 1 }}>
              <AnimatedCounter value={card.value} />
            </div>
          </div>
        ))}
      </div>

      {/* Reconciliation Stats Bar */}
      {stats.total > 0 && (
        <div className="panel-card" style={{ marginBottom: '1.5rem', animation: 'slideIn .5s .5s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <BarChart3 size={18} color="var(--accent-primary)" />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Reconciliation Breakdown</span>
          </div>
          <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', background: 'rgba(255,255,255,.04)', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)' }}>
            {stats.auto > 0 && <div style={{ width: `${(stats.auto/stats.total)*100}%`, background: 'var(--status-green)', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1) 0.5s', opacity: 0, animation: 'fillBar 1s forwards 0.5s' }} />}
            {stats.review > 0 && <div style={{ width: `${(stats.review/stats.total)*100}%`, background: 'var(--status-yellow)', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1) 0.6s', opacity: 0, animation: 'fillBar 1s forwards 0.6s' }} />}
            {stats.rejected > 0 && <div style={{ width: `${(stats.rejected/stats.total)*100}%`, background: 'var(--status-red)', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1) 0.7s', opacity: 0, animation: 'fillBar 1s forwards 0.7s' }} />}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11, color: 'var(--text-secondary)' }}>
            <span><span style={{ color: 'var(--status-green)', fontWeight: 700, fontSize: 13 }}><AnimatedCounter value={((stats.auto/stats.total)*100) || 0} suffix="%" /></span> Auto</span>
            <span><span style={{ color: 'var(--status-yellow)', fontWeight: 700, fontSize: 13 }}><AnimatedCounter value={((stats.review/stats.total)*100) || 0} suffix="%" /></span> Review</span>
            <span><span style={{ color: 'var(--status-red)', fontWeight: 700, fontSize: 13 }}><AnimatedCounter value={((stats.rejected/stats.total)*100) || 0} suffix="%" /></span> Conflict</span>
          </div>
        </div>
      )}

      {/* Datasets Table */}
      <div className="panel-card" style={{ animation: 'slideIn .5s .6s both' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={18} color="var(--accent-primary)" />
          Loaded Datasets
        </h2>
        {datasets.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.15)', borderRadius: 8, fontSize: 13, border: '1px dashed var(--border-color)' }}>
            <Layers size={32} style={{ opacity: 0.2, margin: '0 auto 10px auto' }} />
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
                  <tr key={ds.id} style={{ transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <td style={{ fontWeight: 500 }}>{ds.name}</td>
                    <td style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{ds.source_type}</td>
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
        @keyframes slideIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes ping { 0% { transform: scale(1); opacity: .3; } 100% { transform: scale(1.6); opacity: 0; } }
        @keyframes fillBar { to { opacity: 1; } }
      `}} />
    </div>
  );
}
