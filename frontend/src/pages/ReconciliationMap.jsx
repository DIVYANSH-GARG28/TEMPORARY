import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, useMapEvents, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Play, Search, Loader2, Trash2, MapPin, Navigation, Layers, Zap } from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:8000/api';

// ─── Map sub-components ────────────────────────────────────────

function FitBounds({ geojson }) {
  const map = useMap();
  useEffect(() => {
    if (!geojson?.features?.length) return;
    import('leaflet').then(L => {
      const layer = L.geoJSON(geojson);
      const bounds = layer.getBounds();
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
    });
  }, [geojson, map]);
  return null;
}

function FlyToFeature({ geojson, selectedId }) {
  const map = useMap();
  useEffect(() => {
    if (!selectedId || !geojson?.features) return;
    import('leaflet').then(L => {
      const hits = geojson.features.filter(f => f.properties.id === selectedId);
      if (!hits.length) return;
      const layer = L.geoJSON({ type: 'FeatureCollection', features: hits });
      const bounds = layer.getBounds();
      if (bounds.isValid()) map.flyToBounds(bounds, { padding: [100, 100], duration: 1.2 });
    });
  }, [selectedId, geojson, map]);
  return null;
}

function FlyToCoords({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo([coords.lat, coords.lon], 17, { duration: 1.5 });
  }, [coords, map]);
  return null;
}

function BoundsTracker({ onChange }) {
  const map = useMapEvents({ moveend: () => onChange(map.getBounds()) });
  useEffect(() => { if (map) onChange(map.getBounds()); }, [map]);
  return null;
}

// ─── Status + styling helpers ──────────────────────────────────

const STATUS_COLORS = {
  AUTO_ACCEPT: '#34d399',
  PENDING_REVIEW: '#fbbf24',
  REJECTED: '#f87171',
};
const SOURCE_COLORS = { cadastral: '#60a5fa', municipal: '#a78bfa' };

function styleFeature(feature, selectedId) {
  const { status, source, id } = feature.properties;
  const fill = STATUS_COLORS[status] || 'rgba(255,255,255,0.15)';
  const stroke = SOURCE_COLORS[source] || '#fff';
  const isSelected = selectedId && id === selectedId;
  const isDimmed = selectedId && id !== selectedId;

  if (isSelected) return { fillColor: fill, fillOpacity: 0.7, color: '#fff', weight: 3.5, opacity: 1 };
  if (isDimmed) return { fillColor: fill, fillOpacity: 0.06, color: stroke, weight: 0.8, opacity: 0.25, dashArray: source === 'municipal' ? '5,4' : '' };
  return { fillColor: fill, fillOpacity: 0.35, color: stroke, weight: 1.5, opacity: 0.85, dashArray: source === 'municipal' ? '5,4' : '' };
}

// ─── Main component ────────────────────────────────────────────

export default function ReconciliationMap({ onMatchComplete, selectedMatchId, refreshKey }) {
  const [geojson, setGeojson] = useState(null);
  const [bounds, setBounds] = useState(null);
  const [isMatching, setIsMatching] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);

  // Search state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [flyCoords, setFlyCoords] = useState(null);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimer = useRef(null);

  // Toast state
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'info') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  // ── Data fetching ──
  const fetchGeoJSON = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/reconciliation/geojson`);
      setGeojson(data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchGeoJSON(); }, [refreshKey, fetchGeoJSON]);

  // ── Live search with debounce ──
  const handleQueryChange = (val) => {
    setQuery(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (val.trim().length < 3) { setResults([]); setShowDropdown(false); return; }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await axios.get(`https://nominatim.openstreetmap.org/search`, {
          params: { format: 'json', q: val, limit: 6, countrycodes: 'in' }
        });
        setResults(data);
        setShowDropdown(data.length > 0);
      } catch { setResults([]); }
      setSearching(false);
    }, 400);
  };

  const selectResult = (r) => {
    setFlyCoords({ lat: +r.lat, lon: +r.lon });
    setQuery(r.display_name.split(',').slice(0, 2).join(', '));
    setShowDropdown(false);
    setResults([]);
  };

  // ── Actions ──
  const INGEST_HEADERS = { headers: { 'X-API-Key': 'sih-demo-key' } };

  const ingestArea = async () => {
    if (!bounds) return;
    setIsIngesting(true);
    showToast('Fetching real building data from OpenStreetMap…', 'info');
    try {
      const payload = {
        min_lat: bounds.getSouth(), min_lon: bounds.getWest(),
        max_lat: bounds.getNorth(), max_lon: bounds.getEast()
      };
      const { data } = await axios.post(`${API}/ingest/area`, payload, INGEST_HEADERS);
      showToast(`Ingested ${data.cadastral_count} cadastral + ${data.municipal_count} municipal records`, 'success');
      await fetchGeoJSON();
      if (onMatchComplete) onMatchComplete();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Ingestion failed – try a smaller / denser area', 'error');
    } finally {
      setIsIngesting(false);
    }
  };

  const runEngine = async () => {
    setIsMatching(true);
    showToast('Running multi-evidence reconciliation engine…', 'info');
    try {
      const { data } = await axios.post(`${API}/reconciliation/trigger`);
      showToast(data.message, 'success');
      await fetchGeoJSON();
      if (onMatchComplete) onMatchComplete();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Engine failed', 'error');
    } finally {
      setIsMatching(false);
    }
  };

  const resetDemo = async () => {
    try {
      await axios.post(`${API}/ingest/reset`, {}, INGEST_HEADERS);
      setGeojson(null);
      if (onMatchComplete) onMatchComplete();
      showToast('Database wiped', 'success');
    } catch { showToast('Reset failed', 'error'); }
  };

  // ── Popup builder ──
  const onEachFeature = (feature, layer) => {
    const p = feature.properties;
    const conf = typeof p.confidence === 'number' ? p.confidence.toFixed(1) : p.confidence;
    layer.bindPopup(`
      <div style="font-family:'Inter',system-ui,sans-serif;min-width:200px;line-height:1.6">
        <div style="font-weight:700;font-size:14px;border-bottom:1px solid #e2e8f0;padding-bottom:6px;margin-bottom:6px">Entity #${p.id}</div>
        <div><span style="opacity:.6">Source</span> <span style="color:${SOURCE_COLORS[p.source] || '#fff'};text-transform:capitalize;font-weight:600">${p.source}</span></div>
        <div><span style="opacity:.6">Status</span> <span style="font-weight:600">${(p.status || '').replace(/_/g, ' ')}</span></div>
        ${p.match_type ? `<div><span style="opacity:.6">Type</span> ${p.match_type.replace(/_/g, ' ')}</div>` : ''}
        <div><span style="opacity:.6">Confidence</span> <strong>${conf}%</strong></div>
      </div>
    `);
    layer.on({
      mouseover: e => e.target.setStyle({ fillOpacity: 0.8, weight: 3 }),
      mouseout: e => e.target.setStyle(styleFeature(feature, selectedMatchId)),
    });
  };

  // ── Render ──
  const featureCount = geojson?.features?.length || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>

      {/* ── Search bar ── */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)', position: 'relative', zIndex: 1100 }}>
        <div style={{ position: 'relative', maxWidth: 480 }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 24, padding: '0 4px 0 14px', transition: 'box-shadow .2s' }}>
            <Search size={15} style={{ opacity: .45, flexShrink: 0 }} />
            <input
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
              onFocus={() => results.length && setShowDropdown(true)}
              placeholder="Search any place in India…"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', padding: '8px 10px', color: 'var(--text-primary)', fontSize: 14 }}
            />
            {searching && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite', marginRight: 8, opacity: .5 }} />}
            {query && (
              <button onClick={() => { setQuery(''); setResults([]); setShowDropdown(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px 8px', fontSize: 16 }}>×</button>
            )}
          </div>

          {showDropdown && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,.18)', maxHeight: 240, overflowY: 'auto' }}>
              {results.map((r, i) => (
                <div key={i} onClick={() => selectResult(r)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', fontSize: 13, color: 'var(--text-primary)', transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-primary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <MapPin size={14} style={{ opacity: .4, flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.display_name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', flexWrap: 'wrap', gap: 10, borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>Geospatial View</h2>
          {featureCount > 0 && <span style={{ fontSize: 12, opacity: .5 }}>{featureCount} features</span>}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 6, marginRight: 6 }}>
            {[['#34d399','Auto'], ['#fbbf24','Review'], ['#f87171','Conflict']].map(([c,l]) => (
              <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 8px', borderRadius: 20, background: c + '18', color: c, fontWeight: 600 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />{l}
              </span>
            ))}
          </div>

          <ToolbarButton icon={<Trash2 size={14}/>} label="Reset" onClick={resetDemo} variant="ghost" />
          <ToolbarButton icon={<Navigation size={14}/>} label="Ingest Area" onClick={ingestArea} loading={isIngesting} variant="secondary" />
          <ToolbarButton icon={<Zap size={14}/>} label="Run Engine" onClick={runEngine} loading={isMatching} variant="primary" />
        </div>
      </div>

      {/* ── Map ── */}
      <div style={{ flex: 1, position: 'relative', width: '100%' }}>
        {/* Crosshair */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 32, height: 32, zIndex: 1000, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', width: 1.5, height: '100%', left: '50%', transform: 'translateX(-50%)', background: 'rgba(239,68,68,.45)' }} />
          <div style={{ position: 'absolute', height: 1.5, width: '100%', top: '50%', transform: 'translateY(-50%)', background: 'rgba(239,68,68,.45)' }} />
        </div>

        <MapContainer center={[28.6139, 77.2090]} zoom={16} style={{ height: '100%', width: '100%', background: '#0f172a' }}>
          <BoundsTracker onChange={setBounds} />
          <FlyToCoords coords={flyCoords} />

          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Street Map">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OSM" />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satellite">
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="&copy; Esri" />
            </LayersControl.BaseLayer>
          </LayersControl>

          {geojson?.features?.length > 0 && (
            <>
              <GeoJSON key={`${featureCount}-${selectedMatchId || ''}-${refreshKey}`} data={geojson} style={f => styleFeature(f, selectedMatchId)} onEachFeature={onEachFeature} />
              <FitBounds geojson={geojson} />
              <FlyToFeature geojson={geojson} selectedId={selectedMatchId} />
            </>
          )}
        </MapContainer>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
          padding: '10px 20px', borderRadius: 10,
          background: toast.type === 'success' ? '#059669' : toast.type === 'error' ? '#dc2626' : '#2563eb',
          color: '#fff', fontSize: 13, fontWeight: 500, boxShadow: '0 4px 20px rgba(0,0,0,.3)',
          animation: 'slideUp .3s ease', maxWidth: '80%', textAlign: 'center'
        }}>
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { opacity:0; transform: translateX(-50%) translateY(16px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }
      `}</style>
    </div>
  );
}

// ─── Toolbar button sub-component ──────────────────────────────

function ToolbarButton({ icon, label, onClick, loading, variant = 'ghost' }) {
  const styles = {
    primary: { background: 'var(--accent-primary)', color: '#fff', border: 'none', boxShadow: '0 2px 8px rgba(59,130,246,.35)' },
    secondary: { background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' },
    ghost: { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' },
  };
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px',
        borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: loading ? 'wait' : 'pointer',
        transition: 'all .2s', opacity: loading ? .7 : 1,
        ...styles[variant]
      }}
      onMouseDown={e => !loading && (e.currentTarget.style.transform = 'scale(0.96)')}
      onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : icon}
      {loading ? 'Working…' : label}
    </button>
  );
}
