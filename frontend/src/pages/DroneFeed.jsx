import React, { useState, useEffect, useRef } from 'react';
import { 
    Upload, Cpu, ScanSearch, CheckCircle2, Image as ImageIcon, MapPin, 
    Database, ChevronRight, X, Loader2, Radio, Wifi, Camera, Crosshair, 
    Battery, Gauge 
} from 'lucide-react';

const mockExtractedData = [
    { id: 1, type: 'Building', confidence: 0.94, area: '120 sqm', coords: '28.6139° N, 77.2090° E' },
    { id: 2, type: 'Road Segment', confidence: 0.88, area: '45m length', coords: '28.6140° N, 77.2091° E' },
    { id: 3, type: 'Vegetation', confidence: 0.91, area: '340 sqm', coords: '28.6142° N, 77.2085° E' },
];

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

    // Upload & Pipeline State
    const [selectedImage, setSelectedImage] = useState(null);
    const [pipelineStatus, setPipelineStatus] = useState('idle'); // idle, running, complete
    const [activeStep, setActiveStep] = useState(0);
    const [showPushModal, setShowPushModal] = useState(false);
    
    // Telemetry updates
    useEffect(() => {
        let interval;
        if (connectionStatus === 'connected') {
            interval = setInterval(() => {
                setTelemetry(prev => ({
                    ...prev,
                    lat: prev.lat + (Math.random() - 0.5) * 0.0001,
                    lng: prev.lng + (Math.random() - 0.5) * 0.0001,
                    alt: Math.max(10, prev.alt + (Math.random() - 0.5) * 2),
                    speed: Math.max(0, prev.speed + (Math.random() - 0.5) * 5),
                    battery: Math.max(0, prev.battery - 0.05),
                    frame: prev.frame + 15
                }));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [connectionStatus]);

    // Pipeline simulation
    useEffect(() => {
        if (pipelineStatus === 'running') {
            const steps = [
                { time: 1500, step: 1 }, 
                { time: 3000, step: 2 }, 
                { time: 2000, step: 3 }, 
            ];
            
            let totalTime = 0;
            steps.forEach(({ time, step }) => {
                totalTime += time;
                setTimeout(() => setActiveStep(step), totalTime - time);
            });
            
            setTimeout(() => {
                setPipelineStatus('complete');
                setActiveStep(4);
            }, totalTime);
        }
    }, [pipelineStatus]);
    
    const handleConnect = () => {
        setConnectionStatus('connecting');
        setTimeout(() => {
            setConnectionStatus('connected');
        }, 2000);
    };
    
    const handleCaptureFrame = () => {
        setSelectedImage('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMmQzNzQ4Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZpbGw9IiNmZmYiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Q2FwdHVyZWQgRnJhbWU8L3RleHQ+PC9zdmc+');
        setMode('upload');
        setPipelineStatus('running');
        setActiveStep(0);
    };

    const handleUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => setSelectedImage(event.target.result);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const startPipeline = () => {
        if (!selectedImage) return;
        setPipelineStatus('running');
        setActiveStep(0);
    };

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
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100vh); }
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
                        onClick={() => setMode('upload')}
                        style={{
                            background: mode === 'upload' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                            color: mode === 'upload' ? '#60a5fa' : 'var(--text-secondary, #94a3b8)',
                            border: mode === 'upload' ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
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
                        <Upload size={16} /> Upload Orthomosaic
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
                                        placeholder="RTSP or WebRTC URL"
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
                                        {/* Simulated Video Feed Background */}
                                        <img 
                                            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                                            alt="Satellite view" 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                                        />
                                        
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
                        // UPLOAD & PREVIEW MODE
                        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '600px' }}>
                            {!selectedImage ? (
                                <div style={{
                                    border: '2px dashed var(--border-color, #334155)',
                                    borderRadius: '12px',
                                    padding: '4rem 2rem',
                                    textAlign: 'center',
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    background: 'rgba(255,255,255,0.02)'
                                }} onClick={() => document.getElementById('imageUpload').click()}>
                                    <input 
                                        type="file" 
                                        id="imageUpload" 
                                        style={{ display: 'none' }} 
                                        accept="image/jpeg, image/png, image/tiff"
                                        onChange={handleUpload}
                                    />
                                    <ImageIcon size={48} style={{ color: 'var(--text-secondary, #94a3b8)', marginBottom: '1rem' }} />
                                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary, #f8fafc)' }}>Upload Orthomosaic</h3>
                                    <p style={{ margin: 0, color: 'var(--text-secondary, #94a3b8)', fontSize: '0.9rem' }}>
                                        Drag & drop or click to select GeoTIFF, PNG, or JPG
                                    </p>
                                </div>
                            ) : (
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                    <div style={{ 
                                        flex: 1, 
                                        borderRadius: '12px', 
                                        overflow: 'hidden', 
                                        border: '1px solid var(--border-color, #334155)',
                                        position: 'relative'
                                    }}>
                                        <img src={selectedImage} alt="Selected" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        
                                        {/* Overlays when pipeline complete */}
                                        {pipelineStatus === 'complete' && (
                                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
                                                {/* Simulated bounding boxes */}
                                                <div style={{ position: 'absolute', top: '20%', left: '30%', width: '15%', height: '15%', border: '2px solid var(--accent-primary, #3b82f6)', background: 'rgba(59, 130, 246, 0.2)' }}></div>
                                                <div style={{ position: 'absolute', top: '60%', left: '50%', width: '10%', height: '25%', border: '2px solid var(--accent-primary, #3b82f6)', background: 'rgba(59, 130, 246, 0.2)' }}></div>
                                                <div style={{ position: 'absolute', top: '40%', left: '70%', width: '20%', height: '10%', border: '2px solid var(--status-green, #10b981)', background: 'rgba(16, 185, 129, 0.2)' }}></div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {pipelineStatus === 'idle' && (
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', gap: '1rem' }}>
                                            <button 
                                                onClick={() => setSelectedImage(null)}
                                                style={{
                                                    background: 'transparent',
                                                    color: 'var(--text-primary, #f8fafc)',
                                                    border: '1px solid var(--border-color, #334155)',
                                                    padding: '0.75rem 1.5rem',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                onClick={startPipeline}
                                                style={{
                                                    background: 'var(--accent-primary, #3b82f6)',
                                                    color: '#fff',
                                                    border: 'none',
                                                    padding: '0.75rem 1.5rem',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    fontWeight: 500
                                                }}
                                            >
                                                <Cpu size={18} /> Run Inference
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar Pipeline */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                                isActive={pipelineStatus === 'running' && activeStep === 0}
                                isComplete={activeStep > 0}
                            />
                            <PipelineStep 
                                icon={ScanSearch} 
                                title="Model Inference" 
                                desc="YOLOv8 footprint detection" 
                                isActive={pipelineStatus === 'running' && activeStep === 1}
                                isComplete={activeStep > 1}
                            />
                            <PipelineStep 
                                icon={MapPin} 
                                title="Vectorization" 
                                desc="Polygon extraction & geo-registration" 
                                isActive={pipelineStatus === 'running' && activeStep === 2}
                                isComplete={activeStep > 2}
                            />
                        </div>
                        
                        {pipelineStatus === 'complete' && (
                            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--status-green, #10b981)', borderRadius: '8px' }}>
                                <p style={{ margin: 0, color: 'var(--status-green, #10b981)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                                    <CheckCircle2 size={18} /> Processing Complete
                                </p>
                                <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary, #94a3b8)', fontSize: '0.85rem' }}>
                                    Successfully extracted 24 polygons.
                                </p>
                            </div>
                        )}
                    </div>
                    
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
                                    {mockExtractedData.length} items
                                </span>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', maxHeight: '250px', overflowY: 'auto' }}>
                                {mockExtractedData.map(item => (
                                    <div key={item.id} style={{ background: 'var(--bg-secondary, #1e293b)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color, #334155)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <strong style={{ color: 'var(--text-primary, #f8fafc)', fontSize: '0.9rem' }}>{item.type}</strong>
                                            <span style={{ color: 'var(--status-green, #10b981)', fontSize: '0.8rem' }}>{(item.confidence * 100).toFixed(0)}% conf</span>
                                        </div>
                                        <div style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '0.8rem' }}>
                                            {item.area} • {item.coords}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <button 
                                onClick={() => setShowPushModal(true)}
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
                                <Database size={18} /> Push to Database
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Push Modal */}
            {showPushModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 50
                }}>
                    <div style={{
                        background: 'var(--bg-primary, #0f172a)',
                        border: '1px solid var(--border-color, #334155)',
                        borderRadius: '12px',
                        padding: '2rem',
                        width: '100%',
                        maxWidth: '400px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, color: 'var(--text-primary, #f8fafc)' }}>Sync to Naksha Database</h3>
                            <button onClick={() => setShowPushModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary, #94a3b8)', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <p style={{ color: 'var(--text-secondary, #94a3b8)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                            Are you sure you want to push 24 extracted features to the main spatial database? This will make them available in the Map Viewer.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button 
                                onClick={() => setShowPushModal(false)}
                                style={{ flex: 1, background: 'var(--bg-secondary, #1e293b)', color: 'var(--text-primary, #f8fafc)', border: '1px solid var(--border-color, #334155)', padding: '0.75rem', borderRadius: '6px', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    alert('Successfully pushed to database!');
                                    setShowPushModal(false);
                                }}
                                style={{ flex: 1, background: 'var(--accent-primary, #3b82f6)', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '6px', cursor: 'pointer' }}
                            >
                                Confirm Push
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
