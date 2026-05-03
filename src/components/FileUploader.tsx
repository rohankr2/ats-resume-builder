"use client";
import React, { useState } from 'react';

type Props = {
  onEnhanced?: (data: any) => void;
  onDocxReady?: (base64: string) => void;
};

export default function FileUploader({ onEnhanced, onDocxReady }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState("");
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const submitFile = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setAtsScore(null);
    setSuggestions([]);
    try {
      setStatusText("Parsing PDF safely...");
      
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = err => reject(err);
      });

      const parseRes = await fetch('/api/parsePdf', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileData: fileBase64, fileName: file.name }) 
      });
      const parseData = await parseRes.json();
      if (parseData.error) throw new Error(parseData.error);
      
      const parsedText = parseData.text;

      setStatusText("AI evaluating and optimizing ATS phrasing...");
      const enhanceRes = await fetch('/api/enhance', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: parsedText })
      });
      const enhanceData = await enhanceRes.json();
      if (enhanceData.error) throw new Error(enhanceData.error);
      const { result } = enhanceData;
      setAtsScore(result.ats_score);
      setSuggestions(result.suggestions || []);
      
      // Send the beautifully formatted structure back up to Live Dashboard
      if (onEnhanced && result.enhanced_content) {
        onEnhanced(result.enhanced_content);
      }

      setStatusText("Generating final document assets...");
      const docxRes = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: result.enhanced_content, format: 'docx' })
      });
      const docxData = await docxRes.json();
      if (docxData.error) throw new Error(docxData.error);

      if (docxData.result) {
         // Instead of auto-downloading, pass it to the preview UI
         if (onDocxReady) {
            onDocxReady(docxData.result);
         }
      }
      setStatusText("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong during processing.");
      setStatusText("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '3rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
      <h2 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>Upload Existing Resume</h2>
      <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>
        We support PDF documents. Our AI will automatically extract text, optimize terminology for ATS parsers, and generate a new live preview dynamically on your screen.
      </p>

      {atsScore && (
        <div style={{ background: 'var(--accent)', color: '#000', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 'bold' }}>
          Original ATS Score Evaluated: {atsScore}/100
        </div>
      )}
      {atsScore !== null && atsScore < 80 && suggestions && suggestions.length > 0 && (
        <div className="animate-fade-in" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--accent)', color: '#fff', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'left' }}>
          <h3 style={{ color: 'var(--accent)', marginBottom: '1rem', fontSize: '1.1rem' }}>Suggestions Implemented by Engine:</h3>
          <ul style={{ paddingLeft: '1.5rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {suggestions.map((sug, i) => (
              <li key={i}>{sug}</li>
            ))}
          </ul>
        </div>
      )}
      {error && (
        <div style={{ background: 'var(--error)', color: '#fff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}
      {statusText && (
        <div style={{ background: 'var(--secondary)', color: '#fff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {statusText}
        </div>
      )}
      
      <div style={{ border: '2px dashed var(--glass-border)', padding: '3rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}>
        <input type="file" accept=".pdf" onChange={handleUpload} style={{ display: 'none' }} id="resume-upload" />
        <label htmlFor="resume-upload" className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-block' }}>
          Browse Files
        </label>
        {file && <div style={{ color: 'var(--accent)', marginTop: '1.5rem', fontWeight: 500 }}>Selected: {file.name}</div>}
      </div>

      <button onClick={submitFile} disabled={!file || loading} className="btn-primary" 
              style={{ marginTop: '2rem', width: '100%', opacity: (!file || loading) ? 0.5 : 1, cursor: (!file || loading) ? 'not-allowed' : 'pointer' }}>
        {loading ? "Processing..." : "Process & Preview Setup"}
      </button>
    </div>
  );
}
