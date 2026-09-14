import React, { useEffect, useState } from 'react';
import { Check, X, AlertOctagon, Loader2, ChevronRight, Shield, Eye, Zap, MapPin } from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:8000/api';

export default function ReviewQueue({ userRole, refreshKey, selectedMatchId, onSelectMatch, onReviewSubmit }) {
  const [entities, setEntities] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // entity id being actioned

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

  useEffect(() => { fetchData(); }, [refreshKey]);

  const handleAction = async (e, entityId, actionType) => {
    e.stopPropagation();
    if (userRole === 'field_surveyor') {
      setError("Permission Denied: Field Surveyors can only view conflicts.");
      return;
    }
    
    setActionLoading(entityId);
    setError(null);
    try {
      await axios.post(`${API}/audit/entity/${entityId}/review`, {
        action: actionType,
        reviewer: "SIH_Judge",
        reason: "Manual review override"
      });
      await fetchData();
      if (selectedMatchId === entityId) onSelectMatch(null);
      if (onReviewSubmit) onReviewSubmit();
    } catch (err) {
      console.error(err);
      setError("Error saving review to the provenance ledger.");
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-glass)', backdropFilter: 'blur(16px)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={18} color="var(--accent-primary)" />
          Review Queue
        </h2>
        {!loading && (
          <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: entities.length > 0 ? 'rgba(251,191,36,.15)' : 'rgba(52,211,153,.15)', color: entities.length > 0 ? '#fbbf24' : '#34d399', fontWeight: 600 }}>
            {entities.length} pending
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
                  className={`panel-card ${isSelected ? 'active' : ''}`}
                  onClick={() => onSelectMatch(entity.id)}
                  style={{ 
                    display: 'flex', flexDirection: 'column', gap: '0.75rem',
                    cursor: 'pointer',
                    opacity: isActioning ? 0.6 : 1,
                    transition: 'all .3s cubic-bezier(.4,0,.2,1)',
                    animation: `slideIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.06}s both`,
                    borderLeft: isSelected ? '3px solid var(--accent-primary)' : '3px solid transparent',
                  }}
                >
                  {/* Top row: ID + badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <h3 style={{ fontSize: '0.95rem', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={14} style={{ opacity: .5 }} />
                      Entity #{entity.id}
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
                    <EvidenceBar label="Spatial" value={entity.spatial_evidence} color="#60a5fa" />
                    <EvidenceBar label="Attribute" value={entity.attribute_evidence} color="#a78bfa" />
                  </div>

                  {/* Confidence reason */}
                  {entity.confidence_reason && (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '8px 10px', background: 'rgba(255,255,255,.03)', borderRadius: 6, borderLeft: '2px solid var(--border-color)', lineHeight: 1.5 }}>
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
                    <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                      {entity.attributes.owner_name && (
                        <div style={{ flex: 1, padding: '6px 8px', borderRadius: 6, background: 'rgba(96,165,250,.08)', border: '1px solid rgba(96,165,250,.15)' }}>
                          <span style={{ opacity: .5 }}>Cadastral: </span>
                          <strong>{entity.attributes.owner_name}</strong>
                        </div>
                      )}
                      {entity.attributes.municipal_owner && (
                        <div style={{ flex: 1, padding: '6px 8px', borderRadius: 6, background: 'rgba(167,139,250,.08)', border: '1px solid rgba(167,139,250,.15)' }}>
                          <span style={{ opacity: .5 }}>Municipal: </span>
                          <strong>{entity.attributes.municipal_owner}</strong>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 8, paddingTop: 4, borderTop: '1px solid rgba(255,255,255,.04)' }}>
                    <ActionBtn 
                      label="Accept" icon={<Check size={13} />}
                      color="var(--status-green)" disabled={userRole === 'field_surveyor' || isActioning}
                      onClick={(e) => handleAction(e, entity.id, 'AUTO_ACCEPT')}
                    />
                    <ActionBtn 
                      label="Reject" icon={<X size={13} />}
                      color="var(--status-red)" disabled={userRole === 'field_surveyor' || isActioning}
                      onClick={(e) => handleAction(e, entity.id, 'REJECTED')}
                    />
                    {entityConflicts.some(c => c.conflict_type === 'GEOMETRY_CONFLICT') && (
                      <ActionBtn 
                        label="Auto-Fix" icon={<Zap size={13} />}
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
