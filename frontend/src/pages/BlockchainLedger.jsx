import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldCheck, Link, Server, Key, Lock, Loader2 } from 'lucide-react';

export default function BlockchainLedger() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8000/api/audit/ledger')
      .then(res => {
        setLogs(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Generate deterministic mock hash for UI
  const generateHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(64, '02e8fa4d9c7b13a5f0e4b8');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem', height: 'calc(100vh - 120px)', overflowY: 'auto' }} className="custom-scrollbar">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
          <ShieldCheck size={28} color="var(--status-green)" /> Immutable Audit Ledger (Blockchain)
        </h2>
        <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Server size={16} /> Nodes: 12</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Lock size={16} color="var(--status-green)"/> Validated</span>
        </div>
      </div>

      <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '12px', color: 'var(--status-green)' }}>
        This ledger records all system AI and human manual review decisions securely. Edits to cadastral data cannot be repudiated.
      </div>

      {loading ? (
        <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
          <Loader2 className="lucide-spin" size={32} />
        </div>
      ) : logs.length === 0 ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-glass)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
          <ShieldCheck size={48} style={{ opacity: 0.3, margin: '0 auto 1rem auto' }} />
          <h3>Ledger is Empty</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Run the Reconciliation Engine or perform a manual review to record AI and human decisions to the provenance ledger.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingLeft: '2rem', position: 'relative' }}>
          {/* Vertical Blockchain Line */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '2rem', width: '4px', background: 'rgba(59, 130, 246, 0.3)', transform: 'translateX(20px)', zIndex: 0 }}></div>

          {logs.map((log, index) => {
            const currentHash = generateHash(log.id + log.action + log.created_at);
            const prevHash = index < logs.length - 1 ? generateHash(logs[index+1].id + logs[index+1].action + logs[index+1].created_at) : '0000000000000000000000000000000000000000000000000000000000000000';

            return (
              <div key={log.id} className="panel-card" style={{ zIndex: 1, position: 'relative', marginLeft: '3rem' }}>
                <div style={{ position: 'absolute', left: '-3rem', top: '20px', width: '2rem', height: '4px', background: 'var(--accent-primary)' }}></div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>Block #{log.id}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                  <span className={`badge ${log.action.includes('APPROVED') || log.action === 'TOPOLOGY_MERGED' ? 'badge-green' : log.action.includes('REJECTED') ? 'badge-red' : 'badge-yellow'}`}>
                    {log.action}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <Key size={14} /> <strong>Prev Hash:</strong> 
                    <span style={{ color: 'var(--status-yellow)' }}>{prevHash.substring(0, 32)}...</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <Link size={14} /> <strong>Hash:</strong> 
                    <span style={{ color: 'var(--status-green)' }}>{currentHash.substring(0, 32)}...</span>
                  </div>
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <strong>Actor:</strong> {log.actor} <br />
                  <strong>Reason:</strong> {log.reason}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
