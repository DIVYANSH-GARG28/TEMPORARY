import React, { useState } from 'react';
import { Search, MapPin, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { translations } from '../translations';
import axios from 'axios';

const API = 'http://localhost:8000/api';

export default function CitizenPortal({ lang = 'en' }) {
  const [propertyId, setPropertyId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const t = translations[lang]?.citizen || translations['en'].citizen;

  const handleSearch = async () => {
    if (!propertyId) return;
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await axios.get(`${API}/citizen/property/${propertyId}`);
      setResult(response.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError(lang === 'hi' ? 'कोई रिकॉर्ड नहीं मिला। कृपया संपत्ति आईडी जांचें।' : 'No record found. Please check your Property ID.');
      } else {
        setError(lang === 'hi' ? 'सर्वर से संपर्क करने में त्रुटि।' : 'Error contacting the server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <ShieldCheck size={48} color="var(--accent-primary)" style={{ margin: '0 auto 1rem' }} />
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          {t.title}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t.subtitle}
        </p>
      </div>

      <div className="panel-card" style={{ padding: '2rem', display: 'flex', gap: '1rem' }}>
        <input 
          type="text" 
          placeholder={t.placeholder}
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
          style={{ 
            flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', 
            background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '1rem'
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn btn-primary" onClick={handleSearch} style={{ padding: '0 2rem' }}>
          {loading ? '...' : <><Search size={20} /> {t.search}</>}
        </button>
      </div>

      {error && (
        <div className="panel-card" style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-red)', borderLeft: '4px solid var(--status-red)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
            <AlertTriangle size={20} /> Error
          </div>
          <div style={{ marginTop: '0.5rem' }}>{error}</div>
        </div>
      )}

      {result && result.type === 'aadhaar_profile' && (
        <div style={{ animation: 'slideIn 0.4s ease-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', borderLeft: '4px solid var(--accent-primary)' }}>
            <ShieldCheck size={32} color="var(--accent-primary)" />
            <div>
              <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.2rem' }}>DigiLocker / Aadhaar Authentication Success</h2>
              <div style={{ color: 'var(--text-secondary)' }}>Aadhaar Number: <strong>{result.aadhaar_number}</strong></div>
            </div>
          </div>
          
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)' }}>Linked Properties ({result.properties.length})</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {result.properties.map(prop => (
              <div key={prop.id} className="panel-card" style={{ borderTop: `4px solid ${prop.safe ? 'var(--status-green)' : 'var(--status-red)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
                    <MapPin size={24} /> Parcel #{prop.id}
                  </h2>
                  <span className={`badge ${prop.safe ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                    {prop.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t.owner}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{prop.owner}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t.area}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{prop.area}</div>
                  </div>
                </div>

                <div style={{ 
                  padding: '1rem', borderRadius: '8px', 
                  background: prop.safe ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: prop.safe ? 'var(--status-green)' : 'var(--status-red)',
                  display: 'flex', gap: '1rem', alignItems: 'flex-start'
                }}>
                  {prop.safe ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
                  <div style={{ lineHeight: 1.5 }}>
                    <strong>{t.system}</strong><br/>
                    {prop.reason}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && result.type !== 'aadhaar_profile' && (
        <div className="panel-card" style={{ 
          borderTop: `4px solid ${result.safe ? 'var(--status-green)' : 'var(--status-red)'}`,
          animation: 'slideIn 0.4s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={24} /> Parcel #{result.id}
            </h2>
            <span className={`badge ${result.safe ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
              {result.status}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t.owner}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{result.owner}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t.area}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{result.area}</div>
            </div>
          </div>

          <div style={{ 
            padding: '1rem', borderRadius: '8px', 
            background: result.safe ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: result.safe ? 'var(--status-green)' : 'var(--status-red)',
            display: 'flex', gap: '1rem', alignItems: 'flex-start'
          }}>
            {result.safe ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
            <div style={{ lineHeight: 1.5 }}>
              <strong>{t.system}</strong><br/>
              {result.reason}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
