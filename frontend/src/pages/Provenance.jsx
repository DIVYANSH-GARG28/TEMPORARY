import React, { useState } from 'react';
import axios from 'axios';
import { History, Search, FileText, AlertTriangle, Loader2 } from 'lucide-react';

const getApiUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  if (!url) return 'http://localhost:8000/api';
  return url.endsWith('/api') ? url : `${url}/api`;
};
const API = getApiUrl();

export default function Provenance() {
  const [matchId, setMatchId] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = (e) => {
    e.preventDefault();
    if (!matchId) return;
    
    setLoading(true);
    setError(null);
    
    axios.get(`${API}/audit/entity/${matchId}/history`)
      .then(res => {
        setHistory(res.data);
        setLoading(false);
        if (res.data.length === 0) {
          setError("No audit logs found for this Match ID.");
        }
      })
      .catch(err => {
        console.error(err);
        setError("Error fetching audit logs. Check the Match ID or ensure the backend is running.");
        setLoading(false);
      });
  };

  return (
    <div>
      <h1 className="card-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
        <History size={24} color="var(--accent-primary)" />
        Provenance Ledger
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
        Immutable audit trail of all harmonization decisions (Automated & Manual).
      </p>

      <div className="panel-card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={fetchHistory} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Enter Match ID (e.g., 1)" 
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            className="form-input"
            style={{ flex: '1 1 200px' }}
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: '0 0 auto' }}>
            {loading ? <Loader2 size={18} className="lucide-spin" style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={18} />} 
            Search History
          </button>
        </form>
        
        {error && (
          <div className="alert alert-error" style={{ marginTop: '1rem', marginBottom: '0' }}>
            <AlertTriangle size={18} />
            {error}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {history.map((log, idx) => (
          <div key={log.id} className="panel-card" style={{ borderLeft: `4px solid ${log.action.includes('APPROVED') || log.action === 'AUTO_HARMONIZED' ? 'var(--status-green)' : 'var(--status-red)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="badge" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'inline-block' }}>
                  {new Date(log.created_at).toLocaleString()}
                </span>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{log.action.replace(/_/g, ' ')}</h3>
              </div>
              <div style={{ textAlign: 'left', minWidth: '100px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Actor</div>
                <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{log.actor}</div>
              </div>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}><strong>Reason:</strong> {log.reason}</p>
            
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-primary)', borderRadius: '0.375rem', overflowX: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <FileText size={16} /> State Snapshot at Time of Decision
              </div>
              <pre style={{ margin: 0, color: 'var(--accent-primary)', fontSize: '0.85rem' }}>
                {JSON.stringify(log.original_state, null, 2)}
              </pre>
            </div>
          </div>
        ))}
        {history.length === 0 && !loading && !error && (
          <div className="panel-card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            Enter a Match ID above to view its immutable audit history.
          </div>
        )}
      </div>
    </div>
  );
}
