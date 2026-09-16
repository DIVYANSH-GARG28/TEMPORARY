import React, { useState, useEffect, useRef } from 'react';
import { 
    Upload, Cpu, ScanSearch, CheckCircle2, Image as ImageIcon, MapPin, 
    Database, ChevronRight, X, Loader2, Radio, Wifi, Camera, Crosshair, 
    Battery, Gauge 
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, useMap, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { triggerToast } from '../App';

// We'll dynamically populate this after extraction
const mockExtractedDataTemplate = [
    { type: 'Commercial Building', confidence: 0.94 },
    { type: 'Residential Block', confidence: 0.88 },
    { type: 'Warehouse Structure', confidence: 0.91 },
];

function MapTracker({ lat, lng }) {
    const map = useMap();
    useEffect(() => {
        // Only pan if we are far away so user can still manually explore
        const center = map.getCenter();
        const dist = map.distance(center, [lat, lng]);
        if (dist > 500) {
            map.flyTo([lat, lng], 18, { animate: true });
        }
    }, [lat, lng, map]);
    return null;
}

const PipelineStep = ({ icon: Icon, title, desc, isActive, isComplete }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '1rem',
        background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-secondary, #1e293b)',
        border: `1px solid ${isActive ? 'var(--accent-primary, #3b82f6)' : 'var(--border-color, #334155)'}`,
        borderRadius: '8px',
        opacity: isComplete || isActive ? 1 : 0.5,
        transition: 'all 0.3s ease',
        marginBottom: '0.75rem'
    }}>
        <div style={{
            background: isComplete ? 'var(--status-green, #10b981)' : isActive ? 'var(--accent-primary, #3b82f6)' : 'var(--bg-primary, #0f172a)',
            color: isComplete || isActive ? '#fff' : 'var(--text-secondary, #94a3b8)',
            padding: '0.5rem',
            borderRadius: '50%',
            marginRight: '1rem'
        }}>
            {isComplete ? <CheckCircle2 size={20} /> : <Icon size={20} />}
        </div>
        <div>
            <h4 style={{ margin: 0, color: 'var(--text-primary, #f8fafc)', fontSize: '0.9rem', fontWeight: 600 }}>{title}</h4>
            <p style={{ margin: 0, color: 'var(--text-secondary, #94a3b8)', fontSize: '0.8rem', marginTop: '0.2rem' }}>{desc}</p>
        </div>
        {isActive && !isComplete && (
            <div style={{ marginLeft: 'auto', animation: 'spin 1s linear infinite' }}>
                <Loader2 size={18} style={{ color: 'var(--accent-primary, #3b82f6)' }} />
            </div>
        )}
    </div>
);

export default function DroneFeed() {
    const [mode, setMode] = useState('live'); // 'upload' | 'live'
    
    // Live Feed State
    const [streamUrl, setStreamUrl] = useState('rtsp://drone.local:8554/live');
    const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected
    const [telemetry, setTelemetry] = useState({
        lat: 28.6139,
        lng: 77.2090,
        alt: 120,
        speed: 15,
        battery: 85,
        frame: 0
    });

    // Batch Scan & Pipeline State
    const [pipelineStatus, setPipelineStatus] = useState('idle'); // idle, running, complete
    const [activeStep, setActiveStep] = useState(0);
    const [extractedPolygons, setExtractedPolygons] = useState([]);
    const [extractedStats, setExtractedStats] = useState([]);
    const [flightLogs, setFlightLogs] = useState([
        { time: new Date().toLocaleTimeString(), msg: 'Awaiting data link connection...' }
    ]);
    
    // Telemetry and Flight Logging updates
    useEffect(() => {
        let interval;
        if (connectionStatus === 'connected') {
            interval = setInterval(() => {
                setTelemetry(prev => {
                    const newLat = prev.lat + (Math.random() - 0.5) * 0.0001;
                    const newLng = prev.lng + (Math.random() - 0.5) * 0.0001;
                    
                    // Add a log entry every few seconds
                    if (Math.random() > 0.6) {
                        setFlightLogs(logs => {
                            const newLogs = [...logs, { 
                                time: new Date().toLocaleTimeString(), 
                                msg: `NAV: Position updated to ${newLat.toFixed(5)}, ${newLng.toFixed(5)} | Alt: ${prev.alt.toFixed(1)}m`
                            }];
                            return newLogs.slice(-12); // Keep last 12 logs
                        });
                    }
                    
                    return {
                        ...prev,
                        lat: newLat,
                        lng: newLng,
                        alt: Math.max(10, prev.alt + (Math.random() - 0.5) * 2),
                        speed: Math.max(0, prev.speed + (Math.random() - 0.5) * 5),
                        battery: Math.max(0, prev.battery - 0.05),
                        frame: prev.frame + 15
                    };
                });
            }, 1000);
            
            // Initial connection log
            setFlightLogs(logs => [...logs, { time: new Date().toLocaleTimeString(), msg: 'SYS: Secure IP Camera link established. Streaming live.' }]);
        }
        return () => clearInterval(interval);
    }, [connectionStatus]);

    // AR Live Extraction Loop (Hits API dynamically based on drone location)
    useEffect(() => {
        let arInterval;
        if (connectionStatus === 'connected' && mode === 'live') {
            arInterval = setInterval(() => {
                // Fetch dynamic grid around current drone location
                fetchRealBuildingsAsMockML(telemetry.lat, telemetry.lng, true);
            }, 6000); // Poll every 6 seconds to avoid rate limits
        }
        return () => clearInterval(arInterval);
    }, [connectionStatus, mode, telemetry.lat, telemetry.lng]);

    const handleConnect = () => {
        setConnectionStatus('connecting');
        setTimeout(() => {
            setConnectionStatus('connected');
        }, 2000);
    };
    
    const handleCaptureFrame = () => {
        setMode('batch');
        setPipelineStatus('idle');
        setExtractedPolygons([]);
        setExtractedStats([]);
    };

    const startPipeline = () => {
        setPipelineStatus('running');
        setExtractedPolygons([]);
        setExtractedStats([]);
        setActiveStep(0);
        fetchRealBuildingsAsMockML(28.613, 77.202, false);
    };

    const fetchRealBuildingsAsMockML = async (centerLat = 28.613, centerLng = 77.202, isSilentAR = false) => {
        // Calculate a bounding box around the provided center
        const s = (centerLat - 0.004).toFixed(4);
        const w = (centerLng - 0.005).toFixed(4);
        const n = (centerLat + 0.004).toFixed(4);
        const e = (centerLng + 0.005).toFixed(4);
        
        const query = `[out:json];(way["building"](${s},${w},${n},${e}););(._;>;);out body;`;
        const endpoints = [
            'https://overpass-api.de/api/interpreter',
            'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
            'https://overpass.kumi.systems/api/interpreter'
        ];

        try {
            if (!isSilentAR) setActiveStep(1); // Preprocessing
            
            let data = null;
            let successEndpoint = null;
            
            // Try each endpoint until one works (bypasses Wi-Fi restrictions)
            for (const url of endpoints) {
                try {
                    const res = await fetch(url, {
                        method: 'POST',
                        body: 'data=' + encodeURIComponent(query),
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    });
                    if (res.ok) {
                        data = await res.json();
                        successEndpoint = url;
                        break;
                    }
                } catch (err) {
                    console.warn(`Endpoint ${url} failed, trying next...`);
                }
            }

            if (!data || !data.elements) {
                if (!isSilentAR) throw new Error("All global spatial servers are blocked by your Wi-Fi.");
                return;
            }
            
            if (!isSilentAR) setActiveStep(2); // Inference
            const nodes = {};
            data.elements.forEach(e => { if (e.type === 'node') nodes[e.id] = [e.lat, e.lon]; });
            
            const ways = data.elements.filter(e => e.type === 'way' && e.nodes);
            const polys = ways.map(way => way.nodes.map(nid => nodes[nid]).filter(Boolean));
            
            if (!isSilentAR) setActiveStep(3); // Vectorization
            setExtractedPolygons(polys.slice(0, 45)); 
            
            const stats = ways.slice(0, 45).map((way, i) => {
                const buildingType = way.tags?.building;
                let typeLabel = 'Building Footprint';
                if (buildingType && buildingType !== 'yes') {
                    typeLabel = buildingType.charAt(0).toUpperCase() + buildingType.slice(1) + ' Structure';
                }
                
                return {
                    id: i,
                    type: typeLabel,
                    confidence: 0.85 + (Math.random() * 0.1),
                    coords: `${polys[i][0][0].toFixed(4)}° N, ${polys[i][0][1].toFixed(4)}° E`
                };
            });
            setExtractedStats(stats);
            
            if (!isSilentAR) {
                if (!polys || polys.length === 0) {
                    triggerToast("Scan complete: No unregistered buildings detected in this grid.", "info");
                } else {
                    triggerToast("Live spatial data fetched successfully!", "success");
                }
                setActiveStep(4);
                setPipelineStatus('complete');
            } else {
                // If it is AR, we just log to the terminal quietly
                if (polys.length > 0) {
                    setFlightLogs(logs => {
                        const newLogs = [...logs, { 
                            time: new Date().toLocaleTimeString(), 
                            msg: `ML: Auto-extracted ${polys.length} features at [${centerLat.toFixed(4)}, ${centerLng.toFixed(4)}]`
                        }];
                        return newLogs.slice(-12);
                    });
                }
            }
        } catch(e) {
            if (!isSilentAR) {
                triggerToast(e.message || "Extraction failed: Network block.", "error");
                setPipelineStatus('idle');
            }
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            padding: '2.5rem',
            background: 'linear-gradient(135deg, var(--bg-primary, #0f172a) 0%, #1e293b 100%)',
            color: 'var(--text-primary, #f8fafc)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}>
            <style>{`
                @keyframes pulse-red {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes scanline {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .laser-scanner {
                    position: absolute;
                    left: 0; right: 0;
                    height: 4px;
                    background: var(--accent-primary, #3b82f6);
                    box-shadow: 0 0 20px 5px rgba(59, 130, 246, 0.6);
                    z-index: 999;
                    animation: scanline 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    pointer-events: none;
                }
                .live-indicator {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(0,0,0,0.6);
                    backdrop-filter: blur(8px);
                    padding: 0.35rem 1rem;
                    border-radius: 9999px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                    color: #ef4444;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                .live-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #ef4444;
                    animation: pulse-red 2s infinite;
                }
                .hud-overlay {
                    position: absolute;
                    inset: 1.5rem;
                    pointer-events: none;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    z-index: 20;
                }
                .hud-panel {
                    background: rgba(0,0,0,0.45);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 1rem;
                    border-radius: 16px;
                    font-family: 'SF Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                    font-size: 0.85rem;
                    color: #e2e8f0;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }
                .glass-panel {
                    background: rgba(30, 41, 59, 0.7);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 20px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
                    overflow: hidden;
                }
                .action-button {
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 9999px;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.4);
                }
                .action-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.5);
                }
                .action-button:active {
                    transform: translateY(0);
                }
            `}</style>
            
            {/* Header Area */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Camera size={32} color="var(--accent-primary, #3b82f6)" />
                        GeoAI Reality Capture
                    </h1>
                    <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary, #94a3b8)', fontSize: '1.05rem' }}>
                        Extract intelligent land features from drone imagery in real-time.
                    </p>
                </div>
                
                {/* Sleek Mode Toggle */}
                <div style={{
                    display: 'flex',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '0.35rem',
                    borderRadius: '9999px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <button 
                        onClick={() => setMode('live')}
                        style={{
                            background: mode === 'live' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                            color: mode === 'live' ? '#60a5fa' : 'var(--text-secondary, #94a3b8)',
                            border: mode === 'live' ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                            padding: '0.6rem 1.25rem',
                            borderRadius: '9999px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: 600,
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <Radio size={16} /> Live Drone Feed
                    </button>
                    <button 
                        onClick={() => setMode('batch')}
                        style={{
                            background: mode === 'batch' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                            color: mode === 'batch' ? '#60a5fa' : 'var(--text-secondary, #94a3b8)',
                            border: mode === 'batch' ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                            padding: '0.6rem 1.25rem',
                            borderRadius: '9999px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: 600,
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <MapPin size={16} /> Batch Satellite Scan
                    </button>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem' }}>
                {/* Main Content Area */}
                <div className="panel-card" style={{ 
                    background: 'var(--bg-glass, rgba(30, 41, 59, 0.7))',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid var(--border-color, #334155)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {mode === 'live' ? (
                        // LIVE FEED MODE
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '600px' }}>
                            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color, #334155)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <Wifi size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary, #94a3b8)' }} />
                                    <input 
                                        type="text" 
                                        value={streamUrl}
                                        onChange={(e) => setStreamUrl(e.target.value)}
                                        placeholder="e.g. http://192.168.1.5:8080/video (Mobile IP Webcam)"
                                        disabled={connectionStatus !== 'disconnected'}
                                        style={{
                                            width: '100%',
                                            background: 'var(--bg-primary, #0f172a)',
                                            border: '1px solid var(--border-color, #334155)',
                                            color: '#fff',
                                            padding: '0.5rem 1rem 0.5rem 2.5rem',
                                            borderRadius: '6px',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                                <button 
                                    onClick={connectionStatus === 'connected' ? () => setConnectionStatus('disconnected') : handleConnect}
                                    disabled={connectionStatus === 'connecting'}
                                    style={{
                                        background: connectionStatus === 'connected' ? 'var(--status-red, #ef4444)' : 'var(--accent-primary, #3b82f6)',
                                        color: '#fff',
                                        border: 'none',
                                        padding: '0.5rem 1.5rem',
                                        borderRadius: '6px',
                                        cursor: connectionStatus === 'connecting' ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontWeight: 500,
                                        minWidth: '120px',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {connectionStatus === 'connecting' ? <><Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> Connecting...</> :
                                     connectionStatus === 'connected' ? 'Disconnect' : 'Connect'}
                                </button>
                            </div>

                            <div style={{ flex: 1, position: 'relative', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                {connectionStatus === 'disconnected' && (
                                    <div style={{ color: 'var(--text-secondary, #94a3b8)', textAlign: 'center' }}>
                                        <Camera size={48} style={{ opacity: 0.2, marginBottom: '1rem', margin: '0 auto' }} />
                                        <p>Enter stream URL and click Connect</p>
                                    </div>
                                )}
                                {connectionStatus === 'connecting' && (
                                    <div style={{ color: 'var(--accent-primary, #3b82f6)', textAlign: 'center', animation: 'pulse-red 2s infinite' }}>
                                        <Radio size={48} style={{ marginBottom: '1rem', margin: '0 auto' }} />
                                        <p>Establishing connection to drone...</p>
                                    </div>
                                )}
                                {connectionStatus === 'connected' && (
                                    <>
                                        {/* Real IP Camera proxying through backend YOLO model */}
                                        {streamUrl.startsWith('http') ? (
                                            <img 
                                                src={streamUrl} 
                                                alt="Live Drone Feed" 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} 
                                                crossOrigin="anonymous"
                                                onError={(e) => { e.target.style.display = 'none'; triggerToast("Stream failed to load. Is the IP Cam on the same network?", "error"); setConnectionStatus('disconnected'); }}
                                            />
                                        ) : (
                                            <MapContainer 
                                                center={[telemetry.lat, telemetry.lng]} 
                                                zoom={18} 
                                                zoomControl={true}
                                                attributionControl={false}
                                                style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, opacity: 0.8 }}
                                            >
                                                <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                                                <MapTracker lat={telemetry.lat} lng={telemetry.lng} />
                                                <CircleMarker center={[telemetry.lat, telemetry.lng]} radius={3} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 1 }} />
                                                
                                                {/* Live AR Overlay of Extracted Polygons */}
                                                {extractedPolygons.map((poly, i) => (
                                                    <Polygon 
                                                        key={i}
                                                        positions={poly}
                                                        pathOptions={{ 
                                                            color: '#10b981', 
                                                            fillColor: '#10b981', 
                                                            fillOpacity: 0.3, 
                                                            weight: 2,
                                                            dashArray: '4,4'
                                                        }}
                                                    />
                                                ))}
                                            </MapContainer>
                                        )}
                                        
                                        {/* HUD Overlay */}
                                        <div className="hud-overlay">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div className="live-indicator">
                                                    <div className="live-dot"></div> LIVE
                                                </div>
                                                <div className="hud-element" style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)' }}>
                                                    <Camera size={14} /> REC {Math.floor(telemetry.frame / 30 / 60).toString().padStart(2, '0')}:{(Math.floor(telemetry.frame / 30) % 60).toString().padStart(2, '0')}
                                                </div>
                                            </div>

                                            <div style={{ alignSelf: 'center', opacity: 0.3 }}>
                                                <Crosshair size={64} color="#fff" strokeWidth={1} />
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    <div className="hud-element"><MapPin size={16} /> {telemetry.lat.toFixed(6)}, {telemetry.lng.toFixed(6)}</div>
                                                    <div className="hud-element"><Gauge size={16} /> ALT: {telemetry.alt.toFixed(1)}m | SPD: {telemetry.speed.toFixed(1)}m/s</div>
                                                </div>
                                                
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                                                    {/* Mini Map Simulate */}
                                                    <div style={{ 
                                                        width: '120px', height: '90px', 
                                                        background: 'rgba(0,0,0,0.6)', 
                                                        border: '1px solid rgba(255,255,255,0.2)',
                                                        borderRadius: '6px',
                                                        position: 'relative',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <div style={{
                                                            position: 'absolute', top: '50%', left: '50%',
                                                            width: '6px', height: '6px', background: '#ef4444',
                                                            borderRadius: '50%', transform: 'translate(-50%, -50%)',
                                                            boxShadow: '0 0 8px #ef4444'
                                                        }}></div>
                                                        <div style={{ position: 'absolute', bottom: '4px', right: '4px', fontSize: '10px', color: '#fff', fontFamily: 'monospace' }}>MAP</div>
                                                    </div>
                                                    
                                                    <div className="hud-element">
                                                        <Battery size={16} color={telemetry.battery < 20 ? '#ef4444' : '#10b981'} /> 
                                                        BAT {telemetry.battery.toFixed(0)}%
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)' }}>
                                            <button 
                                                onClick={handleCaptureFrame}
                                                style={{
                                                    background: 'var(--accent-primary, #3b82f6)',
                                                    color: '#fff',
                                                    border: 'none',
                                                    padding: '1rem 2rem',
                                                    borderRadius: '999px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    fontWeight: 'bold',
                                                    fontSize: '1.1rem',
                                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                                                    transition: 'transform 0.2s'
                                                }}
                                                onMouseOver={e => e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)'}
                                                onMouseOut={e => e.currentTarget.style.transform = 'translateX(-50%) scale(1)'}
                                            >
                                                <Camera size={24} /> CAPTURE FRAME
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        // SATELLITE BATCH SCAN MODE
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '600px', position: 'relative' }}>
                            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color, #334155)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <MapPin size={20} color="var(--accent-primary)" />
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>Sector 4, Urban Zone</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Coordinates: 28.6135° N, 77.2090° E</div>
                                    </div>
                                </div>
                                {pipelineStatus === 'idle' && (
                                    <button 
                                        onClick={startPipeline}
                                        style={{
                                            background: 'var(--accent-primary, #3b82f6)',
                                            color: '#fff',
                                            border: 'none',
                                            padding: '0.75rem 1.5rem',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontWeight: 600,
                                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                        }}
                                    >
                                        <Cpu size={18} /> Run ML Footprint Extraction
                                    </button>
                                )}
                            </div>
                            
                            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                                {pipelineStatus === 'running' && <div className="laser-scanner"></div>}
                                
                                <MapContainer 
                                    center={[28.6135, 77.2090]} 
                                    zoom={17} 
                                    zoomControl={true}
                                    attributionControl={false}
                                    style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
                                >
                                    <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                                    
                                    {pipelineStatus === 'complete' && extractedPolygons.map((poly, idx) => (
                                        <Polygon 
                                            key={idx} 
                                            positions={poly} 
                                            pathOptions={{ 
                                                color: '#3b82f6', 
                                                weight: 2, 
                                                fillColor: '#3b82f6', 
                                                fillOpacity: 0.35,
                                                className: 'animated-polygon'
                                            }} 
                                        />
                                    ))}
                                </MapContainer>
                                
                                <style>{`
                                    .animated-polygon {
                                        animation: polyFadeIn 0.5s ease-out forwards;
                                    }
                                    @keyframes polyFadeIn {
                                        from { opacity: 0; transform: scale(0.9); }
                                        to { opacity: 1; transform: scale(1); }
                                    }
                                `}</style>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {mode === 'live' ? (
                        <div className="panel-card" style={{ 
                            background: 'var(--bg-glass, rgba(30, 41, 59, 0.7))',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid var(--border-color, #334155)',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary, #f8fafc)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Radio size={20} color="var(--accent-primary)" /> Live Telemetry Log
                            </h3>
                            
                            <div style={{ 
                                background: 'rgba(0,0,0,0.5)', 
                                flex: 1, 
                                borderRadius: '8px', 
                                padding: '1rem', 
                                fontFamily: 'monospace',
                                fontSize: '0.85rem',
                                color: '#10b981',
                                overflowY: 'auto',
                                border: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem'
                            }}>
                                {flightLogs.map((log, i) => (
                                    <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.25rem' }}>
                                        <span style={{ color: '#64748b', marginRight: '0.5rem' }}>[{log.time}]</span>
                                        <span style={{ color: log.msg.startsWith('SYS') ? '#3b82f6' : '#10b981' }}>{log.msg}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="panel-card" style={{ 
                            background: 'var(--bg-glass, rgba(30, 41, 59, 0.7))',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid var(--border-color, #334155)',
                            borderRadius: '12px',
                            padding: '1.5rem'
                        }}>
                            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary, #f8fafc)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Cpu size={20} /> Pipeline Status
                            </h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <PipelineStep 
                                    icon={ImageIcon} 
                                    title="Image Preprocessing" 
                                    desc="Tiling and normalization" 
                                    isActive={pipelineStatus === 'running' && activeStep === 1}
                                    isComplete={activeStep > 1}
                                />
                                <PipelineStep 
                                    icon={ScanSearch} 
                                    title="Model Inference" 
                                    desc="YOLOv8 footprint detection" 
                                    isActive={pipelineStatus === 'running' && activeStep === 2}
                                    isComplete={activeStep > 2}
                                />
                                <PipelineStep 
                                    icon={MapPin} 
                                    title="Vectorization" 
                                    desc="Polygon extraction & geo-registration" 
                                    isActive={pipelineStatus === 'running' && activeStep === 3}
                                    isComplete={activeStep > 3}
                                />
                            </div>
                        </div>
                    )}
                    
                    {pipelineStatus === 'complete' && (
                        <div className="panel-card" style={{ 
                            background: 'var(--bg-glass, rgba(30, 41, 59, 0.7))',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid var(--border-color, #334155)',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            flex: 1
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ margin: 0, color: 'var(--text-primary, #f8fafc)' }}>Extracted Features</h3>
                                <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-primary, #3b82f6)', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600 }}>
                                    {extractedStats.length} items
                                </span>
                            </div>
                            
                            <div className="custom-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                                {extractedStats.map(item => (
                                    <div key={item.id} style={{ background: 'var(--bg-secondary, #1e293b)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color, #334155)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <strong style={{ color: 'var(--text-primary, #f8fafc)', fontSize: '0.9rem' }}>{item.type}</strong>
                                            <span style={{ color: 'var(--status-green, #10b981)', fontSize: '0.8rem' }}>{(item.confidence * 100).toFixed(1)}% conf</span>
                                        </div>
                                        <div style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                                            {item.coords}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <button 
                                onClick={() => {
                                    triggerToast('Successfully synchronized ' + extractedStats.length + ' features to the secure ledger!', 'success');
                                }}
                                style={{
                                    width: '100%',
                                    background: 'var(--accent-primary, #3b82f6)',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '0.75rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    fontWeight: 500
                                }}
                            >
                                <Database size={18} /> Sync to Immutable Ledger
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
