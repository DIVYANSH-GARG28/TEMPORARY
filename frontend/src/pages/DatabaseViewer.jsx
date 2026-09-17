import { useState, useEffect } from 'react';
import { Database, Search, Filter, ArrowUpDown } from 'lucide-react';
import { getReconciliationResults } from '../api';

export default function DatabaseViewer() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getReconciliationResults();
      setData(response.data || []);
    } catch (error) {
      console.error("Failed to fetch database records:", error);
    }
    setLoading(false);
  };

  const filteredData = data.filter(row => 
    String(row.id).toLowerCase().includes(search.toLowerCase()) ||
    (row.status || '').toLowerCase().includes(search.toLowerCase()) ||
    (row.match_type || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', height: '100%', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Apple-grade Header */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        marginBottom: '20px', background: 'var(--bg-glass)', backdropFilter: 'blur(16px)',
        padding: '16px 24px', borderRadius: '16px', border: '1px solid var(--border-color)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
      }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', fontWeight: '700' }}>
            <Database size={24} color="var(--accent-primary)" />
            Database Explorer
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Direct manual access to the canonical Land Entity ledger
          </p>
        </div>
        
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search ID, status, or type..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ 
              width: '100%', padding: '10px 10px 10px 38px', 
              borderRadius: '12px', border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)', color: 'var(--text-primary)',
              outline: 'none', transition: 'all 0.2s ease',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
            }}
            onFocus={e => e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.3)'}
            onBlur={e => e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'}
          />
        </div>
      </div>

      {/* Sleek Table Container */}
      <div style={{ 
        flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        background: 'var(--bg-primary)', borderRadius: '16px', 
        border: '1px solid var(--border-color)',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ overflowX: 'auto', overflowY: 'auto', flex: 1 }} className="custom-scrollbar">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--bg-glass)', backdropFilter: 'blur(20px)' }}>
              <tr>
                {['Entity ID', 'Status', 'Match Type', 'Spatial %', 'Attribute %', 'Overall Confidence'].map((head, idx) => (
                  <th key={idx} style={{ 
                    padding: '16px', fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-secondary)',
                    textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {head} <ArrowUpDown size={14} style={{ opacity: 0.5 }} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Loading database records...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No matching records found in database.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, index) => (
                  <tr key={row.id} style={{ 
                    borderBottom: '1px solid var(--border-color)', 
                    background: index % 2 === 0 ? 'transparent' : 'var(--bg-secondary)',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = index % 2 === 0 ? 'transparent' : 'var(--bg-secondary)'}
                  >
                    <td style={{ padding: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      #{row.id}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                        background: row.status === 'AUTO_ACCEPT' ? 'rgba(34,197,94,0.1)' : 
                                    row.status === 'PENDING_REVIEW' ? 'rgba(234,179,8,0.1)' : 'rgba(239,68,68,0.1)',
                        color: row.status === 'AUTO_ACCEPT' ? 'var(--status-green)' : 
                               row.status === 'PENDING_REVIEW' ? 'var(--status-yellow)' : 'var(--status-red)'
                      }}>
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {row.match_type || 'N/A'}
                    </td>
                    <td style={{ padding: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {row.spatial_evidence ? row.spatial_evidence.toFixed(1) + '%' : 'N/A'}
                    </td>
                    <td style={{ padding: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {row.attribute_evidence ? row.attribute_evidence.toFixed(1) + '%' : 'N/A'}
                    </td>
                    <td style={{ padding: '16px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                         <div style={{ flex: 1, height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ 
                              height: '100%', 
                              width: `${row.overall_confidence || 0}%`,
                              background: (row.overall_confidence || 0) > 85 ? 'var(--status-green)' : (row.overall_confidence || 0) > 50 ? 'var(--status-yellow)' : 'var(--status-red)'
                            }}></div>
                         </div>
                         <span style={{ fontSize: '0.85rem', fontWeight: '600', width: '40px' }}>
                           {(row.overall_confidence || 0).toFixed(1)}%
                         </span>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div style={{ 
          padding: '12px 20px', background: 'var(--bg-secondary)', 
          borderTop: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-secondary)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span>Showing {filteredData.length} entities</span>
          <span>Read-only Canonical Ledger Access</span>
        </div>
      </div>
    </div>
  );
}
