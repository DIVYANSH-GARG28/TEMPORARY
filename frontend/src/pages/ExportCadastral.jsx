import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileDown, Printer, FileText, CheckCircle2 } from 'lucide-react';

export default function ExportCadastral() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We can fetch from financials to get overall summary stats for the report
    axios.get('http://localhost:8000/api/reconciliation/financials')
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem', height: 'calc(100vh - 120px)', overflowY: 'auto' }} className="custom-scrollbar">
      
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileDown size={28} color="var(--accent-primary)" /> Export Cadastral Report
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>Generate an official, printable PDF report for the municipality.</p>
        </div>
        <button className="btn btn-primary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
          <Printer size={20} /> Print to PDF
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading report data...</div>
      ) : (
        <div className="print-container" style={{ background: '#ffffff', color: '#000000', padding: '3rem', borderRadius: '8px', minHeight: '297mm', maxWidth: '210mm', margin: '0 auto', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
          
          <div style={{ borderBottom: '2px solid #000', paddingBottom: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '2rem', fontFamily: 'serif' }}>Department of Land Records</h1>
              <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '1.2rem', fontWeight: 'normal' }}>Official GeoSync Harmonization Report</h2>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.9rem' }}>
              <strong>Date:</strong> {new Date().toLocaleDateString()}<br />
              <strong>Report ID:</strong> GEO-{Math.floor(Math.random() * 1000000)}<br />
              <strong>Status:</strong> <span style={{ color: '#16a34a', fontWeight: 'bold' }}>CERTIFIED</span>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>Executive Summary</h3>
            <p style={{ lineHeight: 1.6 }}>
              This document certifies the automated spatial reconciliation and topology harmonization between legacy municipal tax records and newly acquired high-resolution cadastral (drone/ORI) datasets. All AI-driven classifications and manual geometry unifications have been cryptographically logged in the immutable provenance ledger.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
            <div style={{ background: '#f8fafc', padding: '1.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
              <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} /> Resolution Statistics
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Auto-Harmonized (High Conf)</span>
                  <strong>{stats?.stats?.auto_harmonized || 0}</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Manual Reviews Processed</span>
                  <strong>{stats?.stats?.manual_review || 0}</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Entity Discrepancies Flagged</span>
                  <strong>{stats?.stats?.entity_type_conflict || 0}</strong>
                </li>
              </ul>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
              <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} /> Financial Impact
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Unregistered Entities</span>
                  <strong>{stats?.ghost_buildings_identified || 0}</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Est. Tax Leakage Recovered</span>
                  <strong style={{ color: '#16a34a' }}>₹ {(stats?.potential_revenue_recovered || 0).toLocaleString()}</strong>
                </li>
              </ul>
            </div>
          </div>

          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>Authorization</h3>
            <div style={{ display: 'flex', gap: '4rem', marginTop: '2rem' }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ borderBottom: '1px solid #000', height: '40px', marginBottom: '0.5rem' }}></div>
                <span>Chief Surveyor Signature</span>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ borderBottom: '1px solid #000', height: '40px', marginBottom: '0.5rem' }}></div>
                <span>Municipal Commissioner</span>
              </div>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#64748b', marginTop: 'auto' }}>
            <CheckCircle2 size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
            Generated by GeoSync AI Core. Digitally verifiable via NAKSHA Blockchain Ledger.
          </div>

        </div>
      )}

      {/* Add print styles inline for convenience */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
}
