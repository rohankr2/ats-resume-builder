"use client";

import React, { useState } from 'react';
import FileUploader from '../components/FileUploader';
import ResumeForm from '../components/ResumeForm';
import Image from 'next/image';

export default function Home() {
  const [mode, setMode] = useState<'upload' | 'manual'>('upload');
  const [enhancedData, setEnhancedData] = useState<any>(null);
  const [docxBase64, setDocxBase64] = useState<string | null>(null);

  const handleDownload = () => {
    if (!docxBase64) return;
    const link = document.createElement('a');
    link.href = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${docxBase64}`;
    link.download = `ATS_Optimized_Resume.docx`;
    link.click();
  };

  return (
    <main className="dashboard-layout">
      {/* Sidebar Panel containing the Tools */}
      <section className="interaction-panel">
        <header className="brand-header">
          <div className="logo-orb"></div>
          <h1>AI Resume Pro</h1>
          <p className="subtitle">By ATS Optimization Engine</p>
        </header>

        <div className="mode-switch">
          <button className={mode === 'upload' ? 'active tab' : 'tab'} onClick={() => { setMode('upload'); setEnhancedData(null); }}>
            Smart Upload
          </button>
          <button className={mode === 'manual' ? 'active tab' : 'tab'} onClick={() => { setMode('manual'); setEnhancedData(null); }}>
            Manual Builder
          </button>
        </div>

        <div className="component-container fade-in">
          {mode === 'upload' ? 
            <FileUploader onEnhanced={setEnhancedData} onDocxReady={setDocxBase64} /> : 
            <ResumeForm />
          }
        </div>
      </section>

      {/* Dynamic Right Panel */}
      <section className="hero-panel fade-in delay-1" style={{ 
          alignItems: enhancedData ? 'flex-start' : 'center', 
          justifyContent: enhancedData ? 'flex-start' : 'center', 
          background: enhancedData ? 'linear-gradient(to bottom, #05070a, #0b0f19)' : '#000', 
          overflowY: 'auto',
          padding: enhancedData ? '3rem 2rem' : '0'
        }}>
        {!enhancedData ? (
          <>
            <div className="hero-content">
              <h2>Beat the ATS Instantly.</h2>
              <p>
                Evaluate and reconstruct your existing resume against real-world Applicant Tracking System filters. 
                Powered by Gemini AI, you will receive real-time keyword insights, professional phrasing enhancements, 
                and a fully formatted document export.
              </p>
            </div>
            <div className="hero-image-wrapper">
              <Image 
                src="/hero-image.png" 
                alt="AI Resume Parsing Concept" 
                fill 
                className="hero-image" 
                priority
                style={{ objectFit: 'cover' }}
              />
              <div className="hero-overlay"></div>
            </div>
          </>
        ) : (
          <div className="resume-preview-container animate-fade-in" style={{ width: '100%', maxWidth: '900px', margin: '0 auto', color: '#fff', zIndex: 10, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '2rem', color: 'var(--accent)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span style={{ display: 'inline-block', width: '12px', height: '12px', background: 'var(--accent)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent)', animation: 'pulse 2s infinite' }}></span>
                  Live AI Blueprint
                </h2>
                <p style={{ color: 'var(--secondary)', margin: '0.5rem 0 0 0' }}>Structural optimization verified by ATS Engine.</p>
              </div>
              {docxBase64 && (
                <button onClick={handleDownload} className="btn-primary" style={{ padding: '0.8rem 1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>Download Blueprint as DOCX</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                </button>
              )}
            </div>
            
            {/* Unique Wireframe/Blueprint wrapper */}
            <div style={{ position: 'relative' }}>
                {/* Tech Accents */}
                <div style={{ position: 'absolute', top: -15, left: -15, width: 40, height: 40, borderTop: '2px solid var(--accent)', borderLeft: '2px solid var(--accent)', opacity: 0.8 }}></div>
                <div style={{ position: 'absolute', bottom: -15, right: -15, width: 40, height: 40, borderBottom: '2px solid var(--accent)', borderRight: '2px solid var(--accent)', opacity: 0.8 }}></div>
                
                <div style={{ 
                    background: 'rgba(10, 14, 23, 0.7)', 
                    backdropFilter: 'blur(15px)', 
                    padding: '4rem', 
                    borderRadius: '2px', 
                    border: '1px solid rgba(0, 210, 255, 0.15)', 
                    boxShadow: '0 25px 50px rgba(0,0,0,0.5), inset 0 0 100px rgba(0,210,255,0.02)',
                    position: 'relative'
                }}>
                  {/* Subtle Grid Background inside Blueprint */}
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none', backgroundImage: 'linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

                  <div style={{ textAlign: 'center', marginBottom: '3.5rem', position: 'relative', zIndex: 1 }}>
                    <h1 style={{ margin: 0, fontSize: '2.8rem', letterSpacing: '-1px', fontWeight: 800 }}>{enhancedData.personal?.name || "Anonymous Algorithm"}</h1>
                    <p style={{ color: 'var(--accent)', opacity: 0.8, margin: '1rem 0 0 0', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                      {enhancedData.personal?.email && <span>[{enhancedData.personal.email}]</span>}
                      {enhancedData.personal?.phone && <span>[{enhancedData.personal.phone}]</span>}
                      {enhancedData.personal?.linkedin && <span>[{enhancedData.personal.linkedin}]</span>}
                    </p>
                  </div>

                  {enhancedData.summary && (
                    <div style={{ marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
                      <h3 style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--accent)' }}>//</span> Executive Summary
                      </h3>
                      <p style={{ lineHeight: 1.8, color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem' }}>{enhancedData.summary}</p>
                    </div>
                  )}
                  
                  {enhancedData.skills && enhancedData.skills.length > 0 && (
                    <div style={{ marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
                      <h3 style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <span style={{ color: 'var(--accent)' }}>//</span> Technical Stack
                      </h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                        {enhancedData.skills.map((s: string, i: number) => (
                            <span key={i} style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--accent)', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.85rem', fontFamily: 'monospace', border: '1px solid rgba(0, 210, 255, 0.2)' }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {enhancedData.experience && enhancedData.experience.length > 0 && (
                    <div style={{ marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
                      <h3 style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                        <span style={{ color: 'var(--accent)' }}>//</span> Career Trajectory
                      </h3>
                      {enhancedData.experience.map((exp: any, i: number) => (
                        <div key={i} style={{ marginBottom: '2.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                              <strong style={{ fontSize: '1.2rem', color: '#fff' }}>{exp.title}</strong>
                              <span style={{ color: 'var(--accent)', fontSize: '0.85rem', fontFamily: 'monospace', padding: '0.2rem 0.6rem', background: 'rgba(0,210,255,0.1)', borderRadius: '4px' }}>{exp.dates}</span>
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.2rem', fontWeight: 500, fontSize: '0.95rem', letterSpacing: '0.5px' }}>{exp.company}</div>
                            <div style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, paddingLeft: '1.5rem', borderLeft: '2px solid rgba(0,210,255,0.3)', fontSize: '0.95rem' }}>
                              {exp.description.split('\n').map((line: string, idx: number) => {
                                const trimmed = line.trim();
                                if (!trimmed) return null;
                                const isBullet = trimmed.startsWith('-') || trimmed.startsWith('•');
                                return (
                                  <div key={idx} style={{ position: 'relative', marginBottom: '0.6rem' }}>
                                    {isBullet && <span style={{ position: 'absolute', left: '-1.5rem', color: 'var(--accent)' }}>›</span>}
                                    <span>{isBullet ? trimmed.substring(1).trim() : trimmed}</span>
                                  </div>
                                );
                              })}
                            </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {enhancedData.education && enhancedData.education.length > 0 && (
                    <div style={{ marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
                      <h3 style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                        <span style={{ color: 'var(--accent)' }}>//</span> Academic Background
                      </h3>
                      {enhancedData.education.map((edu: any, i: number) => (
                        <div key={i} style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <strong style={{ color: '#fff', display: 'block', marginBottom: '0.4rem', fontSize: '1.1rem' }}>{edu.degree}</strong>
                              <span style={{ color: 'rgba(255,255,255,0.5)' }}>{edu.institution}</span>
                            </div>
                            <span style={{ color: 'var(--accent)', fontSize: '0.85rem', fontFamily: 'monospace' }}>{edu.dates}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {enhancedData.projects && enhancedData.projects.length > 0 && (
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <h3 style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                        <span style={{ color: 'var(--accent)' }}>//</span> Applied Initiatives
                      </h3>
                      {enhancedData.projects.map((proj: any, i: number) => (
                        <div key={i} style={{ marginBottom: '2rem' }}>
                            <strong style={{ color: '#fff', display: 'block', marginBottom: '0.8rem', fontSize: '1.1rem' }}>{proj.title}</strong>
                            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, margin: 0, fontSize: '0.95rem' }}>{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
