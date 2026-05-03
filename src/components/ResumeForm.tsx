"use client";
import React, { useState } from 'react';

export default function ResumeForm() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', linkedin: '', education: '', skills: '', experience: '', projects: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [atsScore, setAtsScore] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setAtsScore(null);
    try {
      // 1. Enhance and Score via Gemini
      const enhanceRes = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: JSON.stringify(formData) })
      });
      const enhanceData = await enhanceRes.json();
      if (enhanceData.error) throw new Error(enhanceData.error);
      
      const { result } = enhanceData;
      setAtsScore(result.ats_score);

      // 2. Generate DOCX
      const docxRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: result.enhanced_content, format: 'docx' })
      });
      const docxData = await docxRes.json();
      if (docxData.error) throw new Error(docxData.error);

      // 3. Trigger Download
      if (docxData.result) {
        const link = document.createElement('a');
        link.href = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${docxData.result}`;
        link.download = 'Optimized_Resume.docx';
        link.click();
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to process resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '900px', margin: '2rem auto' }}>
      <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Manual Entry</h2>
      
      {atsScore && (
        <div style={{ background: 'var(--accent)', color: '#000', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 'bold' }}>
          Final ATS Score: {atsScore}/100
        </div>
      )}
      {error && (
        <div style={{ background: 'var(--error)', color: '#fff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>Full Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required
                 style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.75rem', color: '#fff' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required
                 style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.75rem', color: '#fff' }} />
        </div>
        <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>Education (Degree, Institution, Years)</label>
          <textarea name="education" value={formData.education} onChange={handleChange} rows={3}
                 style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.75rem', color: '#fff', fontFamily: 'inherit' }} />
        </div>
        <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>Skills (Comma separated)</label>
          <textarea name="skills" value={formData.skills} onChange={handleChange} rows={2}
                 style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.75rem', color: '#fff', fontFamily: 'inherit' }} />
        </div>
        <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>Work Experience</label>
          <textarea name="experience" value={formData.experience} onChange={handleChange} rows={4}
                 style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.75rem', color: '#fff', fontFamily: 'inherit' }} />
        </div>

        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button type="submit" className="btn-primary" style={{ minWidth: '200px' }} disabled={loading}>
            {loading ? "Optimizing..." : "Generate AI Resume (DOCX)"}
          </button>
        </div>
      </form>
    </div>
  );
}
