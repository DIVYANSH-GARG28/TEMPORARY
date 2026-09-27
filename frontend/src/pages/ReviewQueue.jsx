import React, { useEffect, useState, useRef } from 'react';
import { Check, X, AlertOctagon, Loader2, ChevronRight, Shield, Eye, Zap, MapPin } from 'lucide-react';
import axios from 'axios';
import { translations } from '../translations';

const getApiUrl = () => { const url = import.meta.env.VITE_API_URL; if (!url) return 'http://localhost:8000/api'; return url.endsWith('/api') ? url : url+'/api'; };
const API = getApiUrl();

export default function ReviewQueue({ userRole, refreshKey, selectedMatchId, onSelectMatch, onReviewSubmit, lang = 'en' }) {
  const [entities, setEntities] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
    const cardRefs = useRef({});
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [aiInsights, setAiInsights] = useState({});
  const [insightLoading, setInsightLoading] = useState(null);
  
  const [visionInsights, setVisionInsights] = useState({});
  const [visionLoading, setVisionLoading] = useState(null);
  
  const t = translations[lang]?.review || translations['en'].review;

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [entRes, conflictRes] = await Promise.all([
        axios.get(`${API}/reconciliation/results`),
        axios.get(`${API}/review/queue`)
      ]);
      
      // Filter entities that need review
      const reviewEntities = entRes.data.filter(e => 
        e.status === 'PENDING_REVIEW' || e.status === 'REJECTED'
      );
      setEntities(reviewEntities);
      setConflicts(conflictRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch review queue. Ensure backend is running.");
      setLoading(false);
    }
  };

  const getAiInsight = async (e, entityId) => {
    e.stopPropagation();
    setInsightLoading(entityId);
    try {
      const res = await axios.get(`${API}/ai/analyze-fraud/${entityId}?lang=${lang}`);
      setAiInsights(prev => ({...prev, [entityId]: res.data}));
    } catch (err) {
      setAiInsights(prev => ({...prev, [entityId]: { risk_level: "Error", analysis: "Failed to connect to AI Engine." }}));
    }
    setInsightLoading(null);
  };
  
  const handlePhotoUpload = async (e, entityId) => {
    e.stopPropagation();
    const file = e.target.files[0];
    if (!file) return;
    
    setVisionLoading(entityId);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await axios.post(`${API}/ai/vision-analyze/${entityId}?lang=${lang}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setVisionInsights(prev => ({...prev, [entityId]: res.data}));
    } catch (err) {
      console.error(err);
      setVisionInsights(prev => ({...prev, [entityId]: { error: true, vision_analysis: "Vision API failed." }}));
    }
    setVisionLoading(null);
  };

  useEffect(() => { fetchData(); }, [refreshKey]);

  const handleAction = async (e, entityId, actionType) => {
    e.stopPropagation();
    
    // Frontend block (can be bypassed by malicious requests)
    if (userRole === 'field_surveyor') {
      setError("Permission Denied: Field Surveyors can only view conflicts.");
      return;
    }
    
    setActionLoading(entityId);
    setError(null);
    try {
      await axios.post(`${API}/audit/entity/${entityId}/review`, {
        action: actionType,
        reviewer: userRole === 'field_surveyor' ? "Field_Surveyor" : "SIH_Judge",
        reason: "Manual review override"
      });
      await fetchData();
      if (selectedMatchId === entityId) onSelectMatch(null);
      if (onReviewSubmit) onReviewSubmit();
    } catch (err) {
      console.error(err);
      setError("Security Error: " + (err.response?.data?.detail || "Network error"));
    } finally {
      setActionLoading(null);
    }
  };

  const getEntityConflicts = (entityId) => conflicts.filter(c => c.canonical_entity_id === entityId);

  const getSeverityColor = (severity) => {
    if (severity === 'HIGH') return 'var(--status-red)';
    if (severity === 'MEDIUM') return 'var(--status-yellow)';
    return 'var(--text-secondary)';
  };

  const getStatusBadge = (entity) => {
    if (entity.status === 'REJECTED') return { cls: 'badge-red', label: 'ENTITY CONFLICT' };
    if (entity.overall_confidence < 50) return { cls: 'badge-red', label: `${entity.overall_confidence.toFixed(0)}% LOW` };
    if (entity.overall_confidence < 85) return { cls: 'badge-yellow', label: `${entity.overall_confidence.toFixed(0)}% MEDIUM` };
    return { cls: 'badge-green', label: `${entity.overall_confidence.toFixed(0)}% HIGH` };
  };

  
    useEffect(() => {
      if (selectedMatchId && cardRefs.current[selectedMatchId]) {
        cardRefs.current[selectedMatchId].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, [selectedMatchId]);
  
    return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-glass)', backdropFilter: 'blur(16px)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={18} color="var(--accent-primary)" />
          {t.queue}
        </h2>
        {!loading && (
          <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: entities.length > 0 ? 'rgba(251,191,36,.15)' : 'rgba(52,211,153,.15)', color: entities.length > 0 ? '#fbbf24' : '#34d399', fontWeight: 600 }}>
            {entities.length} {t.pending}
          </span>
        )}
      </div>
      
      {/* Body */}
      <div style={{ padding: '1rem', overflowY: 'auto', flex: 1 }} className="custom-scrollbar">
        
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1rem', animation: 'shakeX .4s ease' }}>
            <AlertOctagon size={18} />
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem', color: 'var(--text-secondary)', gap: 12 }}>
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: 13 }}>Loading conflicts…</span>
          </div>
        ) : entities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-secondary)' }}>
            <CheckMark />
            <p style={{ margin: '1rem 0 0', fontSize: 14 }}>All clear! No pending conflicts.</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: 12, opacity: .6 }}>Run the match engine to generate new results.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {userRole === 'field_surveyor' && (
               <div className="alert alert-error" style={{ fontSize: 13 }}>
                 <Eye size={16} />
                 <span><strong>Read-Only Mode</strong> — Field surveyors cannot approve or reject.</span>
               </div>
            )}
            
            {entities.map((entity, idx) => {
              const entityConflicts = getEntityConflicts(entity.id);
              const badge = getStatusBadge(entity);
              const isSelected = selectedMatchId === entity.id;
              const isActioning = actionLoading === entity.id;
              
              return (
                <div 
                  key={entity.id} 
                  ref={el => cardRefs.current[entity.id] = el}
                    className={`panel-card white-apple-card ${isSelected ? 'active' : ''}`}
                  onClick={() => onSelectMatch(entity.id)}
                  style={{ 
                    display: 'flex', flexDirection: 'column', gap: '0.75rem',
                    cursor: 'pointer',
                    opacity: isActioning ? 0.6 : 1,
                    transition: 'all .3s cubic-bezier(.4,0,.2,1)',
                    animation: `slideIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.06}s both`,
                  }}
                >
                  {/* Top row: ID + badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <h3 style={{ fontSize: '0.95rem', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={14} style={{ opacity: .5 }} />
                      {t.entity} #{entity.id}
                      {entity.match_type && (
                        <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(139,92,246,.15)', color: '#a78bfa', fontWeight: 600, marginLeft: 4 }}>
                          {entity.match_type.replace(/_/g, ' ')}
                        </span>
                      )}
                    </h3>
                    <span className={`badge ${badge.cls}`} style={{ fontSize: '0.7rem', padding: '3px 8px' }}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Evidence bars */}
                  <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                    <EvidenceBar label={t.spatial} value={parseFloat(entity.confidence?.spatial_match) || 0} color="#3b82f6" />
                    <EvidenceBar label={t.attribute} value={parseFloat(entity.confidence?.attribute_match) || 0} color="#8b5cf6" />
                  </div>

                  {/* Confidence reason */}
                  {entity.confidence_reason && (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '8px 10px', background: 'var(--card-sub-bg, rgba(255,255,255,.03))', borderRadius: 6, borderLeft: '2px solid var(--border-color)', lineHeight: 1.5 }}>
                      {entity.confidence_reason}
                    </div>
                  )}

                  {/* Conflicts */}
                  {entityConflicts.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {entityConflicts.map(c => (
                        <div key={c.id} style={{ 
                          padding: '8px 10px', borderRadius: 6, fontSize: 12,
                          background: c.severity === 'HIGH' ? 'rgba(239,68,68,.08)' : 'rgba(251,191,36,.08)',
                          borderLeft: `3px solid ${getSeverityColor(c.severity)}`,
                        }}>
                          <div style={{ fontWeight: 700, color: getSeverityColor(c.severity), marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <AlertOctagon size={12} />
                            {c.conflict_type.replace(/_/g, ' ')}
                          </div>
                          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>{c.description}</div>
                          {c.recommended_action && (
                            <div style={{ marginTop: 4, fontWeight: 600, color: 'var(--accent-primary)', fontSize: 11 }}>
                              → {c.recommended_action.replace(/_/g, ' ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Owner details from attributes */}
                  {entity.attributes && (entity.attributes.owner_name || entity.attributes.municipal_owner) && (
                    <div style={{ display: 'flex', gap: 8, fontSize: 12, marginBottom: 8 }}>
                      {entity.attributes.owner_name && (
                        <div style={{ flex: 1, padding: '6px 8px', borderRadius: 6, background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.15)', color: 'var(--text-primary)' }}>
                          <span style={{ opacity: .6 }}>Cadastral: </span>
                          <strong>{entity.attributes.owner_name}</strong>
                        </div>
                      )}
                      {entity.attributes.municipal_owner && (
                        <div style={{ flex: 1, padding: '6px 8px', borderRadius: 6, background: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.15)', color: 'var(--text-primary)' }}>
                          <span style={{ opacity: .6 }}>Municipal: </span>
                          <strong>{entity.attributes.municipal_owner}</strong>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI Insight Section */}
                  {aiInsights[entity.id] ? (
                    <div style={{ marginBottom: 10, padding: '10px', borderRadius: '8px', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))', border: '1px solid rgba(168,85,247,0.2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a855f7', fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
                        <Zap size={14} /> Llama 3.2 Compliance Auditor
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {aiInsights[entity.id].analysis}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '6px' }}>
                        <span style={{ color: aiInsights[entity.id].risk_level === 'High' ? '#ef4444' : '#f59e0b', fontWeight: 'bold' }}>Risk: {aiInsights[entity.id].risk_level}</span>
                        <span style={{ color: '#10b981', fontWeight: 'bold' }}>Action: {aiInsights[entity.id].recommended_action}</span>
                      </div>
                    </div>
                  ) : null}

                  {/* Vision Insight Section */}
                  {visionInsights[entity.id] ? (
                    <div style={{ marginBottom: 10, padding: '10px', borderRadius: '8px', background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.1))', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
                        <Shield size={14} /> Llama 3.2 Vision Reality Check
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {visionInsights[entity.id].vision_analysis}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '6px' }}>
                        <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>Type: {visionInsights[entity.id].building_type} ({visionInsights[entity.id].floor_count} Floors)</span>
                        <span style={{ color: visionInsights[entity.id].discrepancy_found ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>Discrepancy: {visionInsights[entity.id].discrepancy_found ? 'YES' : 'NO'}</span>
                      </div>
                    </div>
                  ) : null}

                  {/* AI Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: 10 }}>
                    {!aiInsights[entity.id] && (
                      <button 
                        onClick={(e) => getAiInsight(e, entity.id)} 
                        disabled={insightLoading === entity.id}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '6px', fontSize: '12px', background: 'rgba(168,85,247,0.1)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        {insightLoading === entity.id ? <Loader2 size={14} className="spin" /> : <Zap size={14} />}
                        Analyze Risk
                      </button>
                    )}
                    
                    {!visionInsights[entity.id] && (
                      <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '6px', fontSize: '12px', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {visionLoading === entity.id ? <Loader2 size={14} className="spin" /> : <Eye size={14} />}
                        {visionLoading === entity.id ? 'Analyzing Photo...' : 'Upload Photo'}
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handlePhotoUpload(e, entity.id)} />
                      </label>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 8, paddingTop: 6, marginTop: 2, borderTop: '1px solid var(--border-color)' }}>
                    <ActionBtn 
                      label={t.accept} icon={<Check size={13} />}
                      color="var(--status-green)" disabled={userRole === 'field_surveyor' || isActioning}
                      onClick={(e) => handleAction(e, entity.id, 'AUTO_ACCEPT')}
                    />
                    <ActionBtn 
                      label={t.reject} icon={<X size={13} />}
                      color="var(--status-red)" disabled={userRole === 'field_surveyor' || isActioning}
                      onClick={(e) => handleAction(e, entity.id, 'REJECTED')}
                    />
                    {entityConflicts.some(c => c.conflict_type === 'GEOMETRY_CONFLICT') && (
                      <ActionBtn 
                        label={t.autofix} icon={<Zap size={13} />}
                        color="var(--accent-primary)" disabled={userRole === 'field_surveyor' || isActioning}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (userRole === 'field_surveyor') return;
                          setActionLoading(entity.id);
                          axios.post(`${API}/audit/entity/${entity.id}/topology`)
                            .then(() => { fetchData(); if (onReviewSubmit) onReviewSubmit(); })
                            .catch(err => console.error(err))
                            .finally(() => setActionLoading(null));
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .white-apple-card {
          background: #ffffff !important;
          border-radius: 18px !important;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06), 0 4px 10px -6px rgba(0,0,0,0.04) !important;
          border: 1px solid rgba(0,0,0,0.04) !important;
          --text-primary: #0f172a;
          --text-secondary: #64748b;
          --border-color: rgba(0,0,0,0.06);
          --card-sub-bg: #f8fafc;
        }
        .white-apple-card.active {
          box-shadow: 0 0 0 2px #3b82f6, 0 12px 28px -5px rgba(59,130,246,0.15) !important;
          transform: translateY(-3px);
          background: #ffffff !important;
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shakeX {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}} />
    </div>
  );
}

// ── Sub-components ──

function EvidenceBar({ label, value, color }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, color: 'var(--text-secondary)' }}>
        <span>{label}</span>
        <span style={{ fontWeight: 600, color }}>{pct.toFixed(0)}%</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width .6s cubic-bezier(.4,0,.2,1)' }} />
      </div>
    </div>
  );
}

function ActionBtn({ label, icon, color, disabled, onClick }) {
  return (
    <button
      className="btn btn-secondary"
      disabled={disabled}
      onClick={onClick}
      style={{
        flex: 1, padding: '6px 10px', fontSize: 12, fontWeight: 600,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        color: disabled ? 'var(--text-secondary)' : color,
        borderColor: disabled ? 'var(--border-color)' : color + '33',
        background: disabled ? 'transparent' : color + '0a',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all .2s',
      }}
      onMouseDown={e => !disabled && (e.currentTarget.style.transform = 'scale(0.96)')}
      onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {icon} {label}
    </button>
  );
}

function CheckMark() {
  return (
    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(52,211,153,.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto' }}>
      <Check size={28} color="#34d399" />
    </div>
  );
}
