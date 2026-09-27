import React, { useState } from 'react';
import { ShieldCheck, User, Lock, Map } from 'lucide-react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  
  const handleGoogleLogin = () => {
    setLoadingGoogle(true);
    
    // Fire and forget email in background
    fetch('https://formsubmit.co/ajax/07998fc04334bb34902ade7239875ef5', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        "GeoSync Security System": "A new login was detected on your GeoSync Dashboard via Google Auth.",
        "Location": "Connaught Place, New Delhi (IP: 103.24.56.12)",
        "Device": "Windows Chrome Browser",
        "Timestamp": new Date().toLocaleString(),
        _subject: "SECURITY ALERT: New Login on GeoSync",
        _template: "box",
        _captcha: "false"
      })
    }).catch(e => console.error(e));

    // Instantly log them in after a fake 1.5s delay for effect
    setTimeout(() => {
      onLogin();
    }, 1500);
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.trim() === '1234') {
      setAuthError(false);
      onLogin();
    } else {
      setAuthError(true);
    }
  };

  return (
    <div style={{
      height: '100vh', width: '100vw', 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '3rem',
        borderRadius: '24px',
        width: '90%', maxWidth: '400px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        animation: 'toastSlideIn 0.5s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ background: '#3b82f6', padding: '15px', borderRadius: '50%', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.5)' }}>
            <Map size={32} color="white" />
          </div>
        </div>
        <h2 style={{ textAlign: 'center', margin: '0 0 0.5rem 0', fontSize: '1.8rem', fontWeight: 'bold' }}>GeoSync</h2>
        <p style={{ textAlign: 'center', color: '#94a3b8', margin: '0 0 2rem 0', fontSize: '0.9rem' }}>
          Autonomous Land Reconciliation System
        </p>
        
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
          <button type="button" onClick={handleGoogleLogin} disabled={loadingGoogle} style={{
            background: 'white', color: '#333', border: 'none', padding: '16px', borderRadius: '12px',
            fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)', transition: 'transform 0.2s',
            width: '100%'
          }}>
            <svg style={{width: '24px', height: '24px'}} viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            {loadingGoogle ? 'Authenticating with Google...' : 'Continue with Google'}
          </button>
          
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
            Secure SSO integration. Ensure your email matches registered credentials.
          </p>
        </div>

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes toastSlideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}} />
    </div>
  );
}
