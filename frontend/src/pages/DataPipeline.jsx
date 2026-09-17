import { useState } from 'react';
import { Upload, Database, Settings, FileSearch, ShieldCheck, CheckCircle, AlertTriangle, ArrowRight, XCircle } from 'lucide-react';
import axios from 'axios';

const getApiUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  if (!url) return 'http://localhost:8000/api';
  return url.endsWith('/api') ? url : `${url}/api`;
};
const API = getApiUrl();

export default function DataPipeline({ onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [demoData, setDemoData] = useState([]);
  const [schemaMappings, setSchemaMappings] = useState([]);
  const [normalizedData, setNormalizedData] = useState([]);
  const [qualityReport, setQualityReport] = useState(null);
  
  // 1. Fetch Dirty Demo Data
  const loadDemoData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/pipeline/demo-data`);
      setDemoData(data);
      setStep(2);
    } catch (e) {
      alert("Failed to load demo dataset");
    }
    setLoading(false);
  };
  
  // 2. Detect Schema
  const detectSchema = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/pipeline/schema-detect`, { data: demoData });
      setSchemaMappings(data.mappings);
      setStep(3);
    } catch (e) {
      alert("Schema detection failed");
    }
    setLoading(false);
  };
  
  // 3. Normalize Data
  const normalizeData = async () => {
    setLoading(true);
    try {
      const mappingDict = {};
      schemaMappings.forEach(m => mappingDict[m.source] = m.canonical);
      const { data } = await axios.post(`${API}/pipeline/normalize`, { data: demoData, mappings: mappingDict });
      setNormalizedData(data.normalized_data);
      setStep(4);
    } catch (e) {
      alert("Normalization failed");
    }
    setLoading(false);
  };
  
  // 4. Validate Data
  const validateData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/pipeline/validate`, { normalized_data: normalizedData });
      setQualityReport(data);
      setStep(5);
    } catch (e) {
      alert("Validation failed");
    }
    setLoading(false);
  };
  
  // 5. Commit Data
  const commitData = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/pipeline/commit`, {});
      if (onComplete) onComplete();
      alert("Data successfully committed to Canonical Database. Reconciliation Engine triggered.");
    } catch (e) {
      alert("Commit failed");
    }
    setLoading(false);
  };

  const steps = [
    { num: 1, title: 'Upload Dataset', icon: Upload },
    { num: 2, title: 'Schema Mapping', icon: Database },
    { num: 3, title: 'Normalization', icon: Settings },
    { num: 4, title: 'Quality Engine', icon: FileSearch },
    { num: 5, title: 'Commit & Match', icon: ShieldCheck }
  ];

  return (
    <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', flex: 1, height: 'calc(100vh - 120px)', animation: 'fadeIn 0.5s ease-out', color: 'var(--text-primary)' }}>
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
            Data Ingestion & Validation Pipeline
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Process heterogeneous legacy government datasets before matching
          </p>
        </div>
      </div>
      
      {/* Wizard Progress Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', padding: '0 40px' }}>
        {steps.map(s => (
          <div key={s.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: step >= s.num ? 1 : 0.4 }}>
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center',
              background: step === s.num ? 'var(--accent-primary)' : step > s.num ? 'var(--status-green)' : 'var(--bg-secondary)',
              color: '#fff'
            }}>
              <s.icon size={20} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{s.title}</span>
          </div>
        ))}
      </div>
      
      {/* Content Area */}
      <div style={{ 
        flex: 1, background: 'var(--bg-secondary)', borderRadius: '16px', 
        border: '1px solid var(--border-color)', overflowY: 'auto', padding: '30px'
      }} className="custom-scrollbar">
        
        {/* Step 1: Upload */}
        {step === 1 && (
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto', paddingTop: '40px' }}>
            <div style={{ 
                border: '2px dashed var(--border-color)', borderRadius: '16px', padding: '40px', 
                background: 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'all 0.3s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <Upload size={48} color="var(--text-secondary)" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ margin: '0 0 10px 0' }}>Upload Legacy Dataset</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                Supports CSV, GeoJSON, Municipal Records
              </p>
              
              <div style={{ margin: '30px 0', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <hr style={{ flex: 1, borderColor: 'var(--border-color)' }} />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>OR</span>
                <hr style={{ flex: 1, borderColor: 'var(--border-color)' }} />
              </div>
              
              <button 
                onClick={loadDemoData} 
                disabled={loading}
                className="btn btn-primary" 
                style={{ width: '100%', padding: '12px', fontSize: '1rem', background: 'var(--accent-primary)' }}
              >
                {loading ? 'Loading Dataset...' : 'Load Dirty Demo Dataset (SIH Simulation)'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Schema Mapping */}
        {step === 2 && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Automatic Schema Detection</h3>
              <button onClick={detectSchema} disabled={loading} className="btn btn-primary" style={{ padding: '8px 24px', background: 'var(--accent-primary)' }}>
                {loading ? 'Scanning AI...' : 'Run Auto-Mapping'}
              </button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Showing a preview of {demoData.length} records.
            </p>
            
            <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border-color)' }} className="custom-scrollbar">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px', background: 'var(--bg-primary)' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-glass)' }}>
                    {Object.keys(demoData[0]).map(col => (
                      <th key={col} style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {demoData.slice(0, 5).map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val, j) => (
                        <td key={j} style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                          {String(val).substring(0, 30)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Step 3: Normalization */}
        {step === 3 && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Schema Mapped Successfully</h3>
              <button onClick={normalizeData} disabled={loading} className="btn btn-primary" style={{ padding: '8px 24px', background: 'var(--accent-primary)' }}>
                {loading ? 'Cleaning...' : 'Apply Normalization Rules'}
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {schemaMappings.map(m => (
                <div key={m.source} style={{ 
                  background: 'var(--bg-primary)', padding: '20px', borderRadius: '12px', 
                  border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '15px'
                }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>SOURCE COLUMN</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{m.source}</div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ArrowRight size={20} color="var(--text-secondary)" />
                    <span style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent-primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      {m.canonical || 'UNMAPPED'}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>AI Confidence</span>
                    <span style={{ fontWeight: 'bold', color: m.confidence > 90 ? 'var(--status-green)' : 'var(--status-yellow)' }}>
                      {m.confidence}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Validate Data */}
        {step === 4 && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Data Normalized</h3>
              <button onClick={validateData} disabled={loading} className="btn btn-primary" style={{ padding: '8px 24px', background: 'var(--accent-primary)' }}>
                {loading ? 'Validating...' : 'Run Data Quality Engine'}
              </button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Preview of normalization rules applied (Without destroying original data):
            </p>
            
            <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border-color)' }} className="custom-scrollbar">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: 'var(--bg-primary)' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-glass)' }}>
                    <th style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>Field</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>Raw Source Value</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>Normalized Value</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>Rule Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {normalizedData.filter(r => r._rules && r._rules.length > 0).slice(0, 10).map((row, i) => (
                    Object.keys(row).filter(k => k !== '_rules' && row[k].raw !== row[k].normalized).map((k, j) => (
                      <tr key={`${i}-${j}`}>
                        <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold' }}>{k}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', color: 'var(--status-red)', background: 'rgba(239,68,68,0.05)' }}>"{row[k].raw}"</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', color: 'var(--status-green)', background: 'rgba(34,197,94,0.05)' }}>"{row[k].normalized}"</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>
                          {row._rules.map(rule => (
                            <span key={rule} style={{ background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', marginRight: '5px' }}>{rule}</span>
                          ))}
                        </td>
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Step 5: Final Report */}
        {step === 5 && qualityReport && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Data Quality Report</h3>
              <button onClick={commitData} disabled={loading} className="btn btn-primary" style={{ padding: '8px 24px', background: 'var(--status-green)', borderColor: 'var(--status-green)' }}>
                {loading ? 'Committing...' : 'Commit to Canonical DB'}
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
              <div style={{ flex: 1, background: 'var(--bg-primary)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{qualityReport.total_records}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Records</div>
              </div>
              <div style={{ flex: 1, background: 'var(--bg-primary)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--status-green)' }}>{qualityReport.valid_records}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Valid Records</div>
              </div>
              <div style={{ flex: 1, background: 'var(--bg-primary)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--status-yellow)' }}>{qualityReport.warnings}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Warnings</div>
              </div>
              <div style={{ flex: 1, background: 'var(--bg-primary)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--status-red)' }}>{qualityReport.critical_errors}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Critical Errors</div>
              </div>
            </div>
            
            <h4 style={{ margin: '0 0 15px 0' }}>Detected Anomalies</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {qualityReport.alerts.map((alert, i) => (
                <div key={i} style={{ 
                  display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', borderRadius: '8px',
                  background: alert.severity === 'CRITICAL' ? 'rgba(239,68,68,0.1)' : 'rgba(234,179,8,0.1)',
                  border: `1px solid ${alert.severity === 'CRITICAL' ? 'var(--status-red)' : 'var(--status-yellow)'}`
                }}>
                  {alert.severity === 'CRITICAL' ? <XCircle color="var(--status-red)" /> : <AlertTriangle color="var(--status-yellow)" />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', color: alert.severity === 'CRITICAL' ? 'var(--status-red)' : 'var(--status-yellow)' }}>
                      {alert.severity} (Row {alert.record_index + 1})
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{alert.message}</div>
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
