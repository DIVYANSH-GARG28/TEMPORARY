import React, { useState, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Network, Zap, Cpu, Plus, Info, Upload } from 'lucide-react';
import { translations } from '../translations';

const TypewriterText = ({ text }) => {
  const [displayText, setDisplayText] = useState('');
  useEffect(() => {
    setDisplayText('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText((prev) => text.substring(0, prev.length + 1));
    }, 10);
    return () => clearInterval(interval);
  }, [text]);
  return <span>{displayText}</span>;
};

export default function Connectome({ lang = "en" }) {
  const t = translations[lang]?.connectome || translations["en"].connectome;
  const [data, setData] = useState({ nodes: [], links: [] });
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [aiInsight, setAiInsight] = useState('');
  
  const [newOwner, setNewOwner] = useState('');
  const [newProperty, setNewProperty] = useState('');
  const [isFraud, setIsFraud] = useState(false);
  
  const fgRef = useRef();

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const baseUrl = API.endsWith('/api') ? API : API + '/api';
        const response = await fetch(`${baseUrl}/ai/connectome-data/`);
        if (response.ok) {
          const json = await response.json();
          setData(json);
        } else {
          console.error("Failed to fetch real connectome data");
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchRealData();
  }, []);

  const runFruitFlyAI = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      if (fgRef.current) fgRef.current.zoomToFit(1000, 50);
    }, 2500);
  };
  
  const handleAddManualData = (e) => {
    e.preventDefault();
    if (!newOwner || !newProperty) return;
    setData(prev => {
      const newNodes = [...prev.nodes];
      const newLinks = [...prev.links];
      if (!newNodes.find(n => n.id === newOwner)) {
        newNodes.push({ id: newOwner, group: 1, val: 15, name: newOwner, type: 'corp' });
      }
      newNodes.push({ id: newProperty, group: isFraud ? 2 : 3, val: 8, name: newProperty, type: 'property', fraud: isFraud });
      newLinks.push({ source: newProperty, target: newOwner, value: isFraud ? 4 : 1 });
      return { nodes: newNodes, links: newLinks };
    });
    setTimeout(() => { if (fgRef.current) fgRef.current.d3ReheatSimulation(); }, 100);
    setNewProperty('');
  };

  const handleJsonUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        if (jsonData.nodes && jsonData.links) setData(jsonData);
      } catch (err) {}
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', height: 'calc(100vh - 200px)', padding: '20px' }}>
      <div style={{ flex: '2 1 600px', minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', background: 'var(--bg-glass)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#a855f7' }}>
              <Network size={28} />
              {t.title}
            </h2>
            <p style={{ margin: '5px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {t.subtitle}
            </p>
          </div>
          <button onClick={runFruitFlyAI} style={{
              background: analyzing ? 'transparent' : 'var(--accent-primary)',
              color: analyzing ? 'var(--text-primary)' : 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', 
              fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
              boxShadow: analyzing ? 'none' : '0 4px 15px rgba(168,85,247,0.4)'
            }}>
            {analyzing ? <Cpu className="spin" size={20} /> : <Zap size={20} />}
            {analyzing ? t.analyzing : t.execute}
          </button>
        </div>

        <div style={{ flex: 1, background: '#0f172a', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '1px solid #334155' }}>
          {analyzing && (
            <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, background: 'rgba(0,0,0,0.8)', padding: '15px', borderRadius: '8px', color: '#10b981', border: '1px solid #10b981', fontFamily: 'monospace' }}>
              &gt; Initializing Connectome GNN...<br/>
              &gt; Tracing ownership synapses...<br/>
              &gt; Isolating anomaly clusters...
            </div>
          )}
          
          <ForceGraph2D
            ref={fgRef}
            graphData={data}
            nodeRelSize={6}
            linkColor={link => link.value > 1 ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.1)'}
            linkWidth={link => link.value}
            backgroundColor="#0f172a"
            nodeCanvasObject={(node, ctx, globalScale) => {
              const x = node.x || 0;
              const y = node.y || 0;
              const size = node.val || 5;
              ctx.beginPath();
              ctx.arc(x, y, size, 0, 2 * Math.PI, false);
              ctx.fillStyle = node.type === 'corp' ? '#a855f7' : (node.fraud && !analyzing ? '#ef4444' : '#3b82f6');
              ctx.fill();
              
              const fontSize = node.type === 'corp' ? 14 / globalScale : 10 / globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
              ctx.textAlign = 'center';
              const label = node.name || node.id || 'Unknown Node';
              ctx.fillText(label, x, y + size + fontSize);
              
              if (node.fraud && !analyzing) {
                ctx.fillStyle = '#ef4444';
                ctx.fillText('FLAG', x, y + size + fontSize*2.2);
              }
            }}
            onNodeClick={async (node) => {
              if(fgRef.current) {
                fgRef.current.centerAt(node.x, node.y, 1000);
                fgRef.current.zoom(8, 2000);
              }
              setSelectedNode(node);
              setAiInsight(`Initializing secure connection to Local Llama 3.2 Model...\nAnalyzing node parameters...`);
              
              try {
                const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
                const baseUrl = API.endsWith('/api') ? API : API + '/api';
                const response = await fetch(`${baseUrl}/ai/ollama-connectome/`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: node.name, type: node.type, fraud: node.fraud || false })
                });
                
                if (response.ok) {
                  const result = await response.json();
                  setAiInsight(result.analysis);
                } else {
                  setAiInsight("[Error] Failed to communicate with Llama 3.2 backend.");
                }
              } catch (err) {
                setAiInsight(`[Error] Local AI Engine offline. \nDetails: ${err.message}`);
              }
            }}
          />

          {selectedNode && (
            <div style={{ position: 'absolute', top: 20, right: 20, width: '350px', background: 'rgba(15,23,42,0.95)', padding: '20px', borderRadius: '12px', border: selectedNode.fraud || selectedNode.type === 'corp' ? '1px solid #ef4444' : '1px solid #3b82f6', color: '#fff', fontSize: '13px', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 50 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
                <h3 style={{ margin: 0, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cpu size={18} className="spin" /> AI Insight Terminal
                </h3>
                <button onClick={() => setSelectedNode(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px' }}>X</button>
              </div>
              <div style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: '1.5', color: '#e2e8f0' }}>
                <TypewriterText text={aiInsight} />
              </div>
            </div>
          )}

          <div style={{ position: 'absolute', bottom: 20, right: 20, background: 'rgba(15,23,42,0.9)', padding: '15px', borderRadius: '8px', border: '1px solid #334155', color: '#fff', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}><div style={{ width: 12, height: 12, borderRadius: '50%', background: '#a855f7' }}></div> Holding Company (Brain Hub)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}><div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }}></div> Tax-Evading Property</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3b82f6' }}></div> Legitimate Property</div>
          </div>
        </div>
      </div>

      <div style={{ flex: '1 1 350px', maxWidth: '100%', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflowY: 'auto' }}>
        <div style={{ background: 'var(--bg-glass)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', color: 'var(--text-primary)' }}><Info size={18} color="var(--accent-primary)" /> {t.howItWorks}</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{t.desc1}<br/><br/>{t.desc2}</p>
        </div>
        <div style={{ background: 'var(--bg-glass)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>{t.addManual}</h3>
          <form onSubmit={handleAddManualData} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{t.owner}</label>
              <input type="text" value={newOwner} onChange={e => setNewOwner(e.target.value)} placeholder="e.g. Apex Holdings 4" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{t.propId}</label>
              <input type="text" value={newProperty} onChange={e => setNewProperty(e.target.value)} placeholder="e.g. Parcel #2048" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <input type="checkbox" id="isFraudCheck" checked={isFraud} onChange={e => setIsFraud(e.target.checked)} />
              <label htmlFor="isFraudCheck" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{t.flag}</label>
            </div>
            <button type="submit" style={{ background: 'var(--accent-primary)', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', marginTop: '5px' }}><Plus size={16} /> {t.addBtn}</button>
          </form>
          <hr style={{ margin: '20px 0', borderColor: 'var(--border-color)' }} />
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '10px', border: '1px dashed var(--accent-primary)', color: 'var(--accent-primary)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
            <Upload size={16} /> {t.upload}
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleJsonUpload} />
          </label>
        </div>
      </div>
    </div>
  );
}
