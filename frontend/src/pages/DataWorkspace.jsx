import React, { useState } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle, Loader2, Database, Cpu, Map as MapIcon, ChevronRight } from 'lucide-react';
import axios from 'axios';

export default function DataWorkspace() {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [sourceType, setSourceType] = useState('cadastral');
  const [version, setVersion] = useState('2024');
  
  const [status, setStatus] = useState({ type: '', message: '' });
  const [uploading, setUploading] = useState(false);
  
  // Animation state for engine
  const [engineState, setEngineState] = useState('idle'); // idle, running, complete
  const [engineStep, setEngineStep] = useState(0);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !name) {
      setStatus({ type: 'error', message: 'Please provide a name and file.' });
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('source_type', sourceType);
    formData.append('version', version);
    formData.append('file', file);

    setUploading(true);
    setStatus({ type: 'info', message: 'Uploading and running Topology QA...' });

    try {
      await axios.post('http://localhost:8000/api/datasets/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus({ type: 'success', message: 'Dataset uploaded and validated successfully!' });
      setFile(null);
      setName('');
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: `Error: ${err.response?.data?.detail || err.message}` });
    } finally {
      setUploading(false);
    }
  };

  const triggerReconciliation = async () => {
    setEngineState('running');
    setEngineStep(1);
    
    // Simulate pipeline steps for UI polish
    setTimeout(() => setEngineStep(2), 1500); // Indexing
    setTimeout(() => setEngineStep(3), 3000); // Topology Overlay
    setTimeout(() => setEngineStep(4), 4500); // Conflict Resolution
    
    try {
      const res = await axios.post('http://localhost:8000/api/reconciliation/trigger');
      setTimeout(() => {
        setEngineStep(5);
        setEngineState('complete');
        setStatus({ type: 'success', message: res.data.message });
      }, 5500);
    } catch (err) {
      console.error(err);
      setEngineState('idle');
      setStatus({ type: 'error', message: `Engine Error: ${err.message}` });
    }
  };

  return (
    <div style={{ padding: '1rem', height: 'calc(100vh - 120px)', overflowY: 'auto' }} className="custom-scrollbar">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={24} color="var(--accent-primary)" /> Data Ingestion Workspace
        </h1>
      </div>
      
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* Upload Panel */}
        <div className="panel-card" style={{ flex: '1 1 400px', maxWidth: '600px', position: 'relative', overflow: 'hidden' }}>
          <h2 className="card-title">Upload New Dataset</h2>
          
          {status.message && engineState === 'idle' && (
            <div className={`alert ${status.type === 'error' ? 'alert-error' : status.type === 'success' ? 'alert-success' : ''}`} style={{ background: status.type === 'info' ? 'var(--bg-primary)' : '', border: status.type === 'info' ? '1px solid var(--border-color)' : '', marginBottom: '1.5rem' }}>
              {status.type === 'error' && <AlertTriangle size={20} />}
              {status.type === 'success' && <CheckCircle size={20} />}
              {status.type === 'info' && <Loader2 size={20} className="lucide-spin" style={{ animation: 'spin 1s linear infinite' }} />}
              <span style={{ marginLeft: status.type === 'info' ? '10px' : '0' }}>{status.message}</span>
            </div>
          )}

          <form onSubmit={handleUpload}>
            <div className="form-group">
              <label className="form-label">Dataset Name</label>
              <input type="text" className="form-input" placeholder="e.g., Ward 42 Cadastral" value={name} onChange={(e) => setName(e.target.value)} required disabled={uploading || engineState !== 'idle'} />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Source Type</label>
                <select className="form-input" value={sourceType} onChange={(e) => setSourceType(e.target.value)} disabled={uploading || engineState !== 'idle'}>
                  <option value="cadastral">Cadastral (High-Res)</option>
                  <option value="municipal">Municipal (Legacy)</option>
                  <option value="revenue">Revenue (RoR)</option>
                </select>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Version (Year)</label>
                <input type="text" className="form-input" value={version} onChange={(e) => setVersion(e.target.value)} required disabled={uploading || engineState !== 'idle'} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">GeoJSON Payload</label>
              <div style={{ 
                border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '2rem', textAlign: 'center', 
                background: 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'all 0.3s ease'
              }}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
              onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border-color)'; }}
              onClick={() => document.getElementById('file-upload').click()}
              >
                <Upload size={32} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
                <div style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{file ? file.name : 'Click or Drag & Drop'}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Only valid .geojson format accepted</div>
                <input id="file-upload" type="file" accept=".geojson" onChange={(e) => setFile(e.target.files[0])} style={{ display: 'none' }} disabled={uploading || engineState !== 'idle'} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem', padding: '0.8rem', borderRadius: '8px' }} disabled={uploading || engineState !== 'idle'}>
              {uploading ? <><Loader2 size={18} className="lucide-spin" style={{ display: 'inline', marginRight: '8px' }}/> Uploading...</> : 'Secure Ingest'}
            </button>
          </form>
        </div>

        {/* Engine Runner Panel */}
        <div className="panel-card" style={{ flex: '1 1 400px', maxWidth: '600px', display: 'flex', flexDirection: 'column' }}>
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <Cpu size={22} color="var(--status-yellow)" /> Geospatial Reconciliation Engine
          </h2>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.5rem', padding: '1rem 0' }}>
            
            {/* Pipeline Visualization */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ position: 'absolute', left: '15px', top: '20px', bottom: '20px', width: '2px', background: 'var(--border-color)', zIndex: 0 }}></div>
              
              <StepItem number={1} title="Data Ingestion & Validation" active={engineStep >= 1} current={engineStep === 1} />
              <StepItem number={2} title="Spatial R-Tree Indexing" active={engineStep >= 2} current={engineStep === 2} />
              <StepItem number={3} title="Topology Overlay & Intersection" active={engineStep >= 3} current={engineStep === 3} />
              <StepItem number={4} title="Attribute Conflict Resolution" active={engineStep >= 4} current={engineStep === 4} />
              
            </div>

          </div>

          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            {engineState === 'idle' && (
              <button onClick={triggerReconciliation} className="btn btn-secondary" style={{ width: '100%', background: 'rgba(234, 179, 8, 0.1)', color: 'var(--status-yellow)', borderColor: 'var(--status-yellow)', padding: '0.8rem' }}>
                Run Match Engine
              </button>
            )}
            
            {engineState === 'running' && (
              <div style={{ width: '100%', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)', padding: '0.8rem', borderRadius: '8px', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                <Loader2 size={18} className="lucide-spin" /> Engine Processing...
              </div>
            )}

            {engineState === 'complete' && (
              <div style={{ width: '100%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--status-green)', border: '1px solid var(--status-green)', padding: '0.8rem', borderRadius: '8px', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={18} /> Matches Sent to Review Queue!
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function StepItem({ number, title, active, current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 1, opacity: active ? 1 : 0.4, transition: 'all 0.3s ease', transform: current ? 'scale(1.02)' : 'scale(1)' }}>
      <div style={{ 
        width: '32px', height: '32px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center',
        background: current ? 'var(--accent-primary)' : active ? 'var(--status-green)' : 'var(--bg-secondary)',
        border: `2px solid ${current ? 'var(--accent-primary)' : active ? 'var(--status-green)' : 'var(--border-color)'}`,
        color: '#fff', fontWeight: 'bold', fontSize: '0.9rem',
        boxShadow: current ? '0 0 15px rgba(59, 130, 246, 0.5)' : 'none'
      }}>
        {active && !current ? <CheckCircle size={16} /> : number}
      </div>
      <div style={{ flex: 1, background: current ? 'rgba(59, 130, 246, 0.1)' : 'transparent', padding: '8px 12px', borderRadius: '8px', border: current ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent', transition: 'all 0.3s ease' }}>
        <h4 style={{ margin: 0, color: current ? 'var(--accent-primary)' : active ? 'var(--text-primary)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {title} {current && <Loader2 size={14} className="lucide-spin" />}
        </h4>
      </div>
    </div>
  );
}
