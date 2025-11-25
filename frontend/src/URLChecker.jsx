import { useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Shield, AlertTriangle, CheckCircle, XCircle, Search, Globe, Lock, Activity, ArrowRight } from 'lucide-react';

const URLChecker = () => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // NEW: Helper function to save result to Local Storage
  const saveToHistory = (newEntry) => {
    try {
      // 1. Get existing history
      const existingData = localStorage.getItem('scanHistory');
      const history = existingData ? JSON.parse(existingData) : [];
      
      // 2. Add timestamp if missing
      if (!newEntry.timestamp) {
        newEntry.timestamp = new Date().toISOString();
      }

      // 3. Add new entry to the FRONT of the list
      const updatedHistory = [newEntry, ...history];

      // 4. Limit to last 50 scans to save space
      if (updatedHistory.length > 50) {
        updatedHistory.length = 50;
      }

      // 5. Save back to Local Storage
      localStorage.setItem('scanHistory', JSON.stringify(updatedHistory));
      
    } catch (e) {
      console.error("Failed to save history locally", e);
    }
  };

  const analyzeUrl = async () => {
    if (!url) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    // DYNAMIC URL CONFIGURATION
    const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

    try {
      const response = await axios.post(`${API_BASE}/predict`, { url });
      const data = response.data;
      
      setResult(data);
      
      // NEW: Save the successful result to history immediately
      saveToHistory(data);

    } catch (err) {
      console.error("Scan Error:", err);
      setError('Connection failed. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = result?.probabilities 
    ? Object.entries(result.probabilities).map(([key, value]) => ({
        name: key,
        value: (value * 100).toFixed(1),
        color: key === 'benign' ? '#28a745' : '#dc3545'
      }))
    : [];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {/* HERO SECTION */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0A3981', marginBottom: '1rem' }}>
          Analyze any URL
        </h2>
        <p style={{ color: '#6a7486', fontSize: '1.1rem' }}>
          Detect phishing, malware, and security threats in real-time.
        </p>
      </div>

      {/* INPUT CARD */}
      <div className="card" style={{ padding: '1rem', borderRadius: '50px', border: '1px solid #e0e6ed', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Globe color="#1F509A" size={24} style={{ marginLeft: '10px' }} />
        <input 
          type="text" 
          placeholder="Paste a URL to scan (e.g., http://example.com)..." 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && analyzeUrl()}
          style={{ 
            border: 'none', 
            fontSize: '1.1rem', 
            padding: '10px', 
            boxShadow: 'none',
            background: 'transparent'
          }}
        />
        <button 
          onClick={analyzeUrl}
          disabled={loading}
          style={{
            background: 'var(--color-orange-accent)',
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            padding: '0.8rem 2rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.2s'
          }}
        >
          {loading ? 'Scanning...' : <>Scan <ArrowRight size={18}/></>}
        </button>
      </div>
      
      {error && <div style={{ textAlign: 'center', color: '#dc3545', marginTop: '1rem' }}>{error}</div>}

      {/* RESULT REPORT */}
      {result && (
        <div className="card" style={{ marginTop: '3rem', padding: '0', overflow: 'hidden', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
          
          {/* Report Header */}
          <div style={{ 
            background: result.is_safe ? 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)' : 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
            padding: '2rem',
            textAlign: 'center',
            borderBottom: `4px solid ${result.is_safe ? '#28a745' : '#dc3545'}`
          }}>
            {result.is_safe ? <CheckCircle size={64} color="#155724" /> : <AlertTriangle size={64} color="#721c24" />}
            <h1 style={{ margin: '1rem 0 0.5rem 0', color: result.is_safe ? '#155724' : '#721c24', fontSize: '2rem' }}>
              {result.is_safe ? "SAFE TO VISIT" : "PHISHING DETECTED"}
            </h1>
            <p style={{ margin: 0, color: result.is_safe ? '#155724' : '#721c24', opacity: 0.8, fontSize: '1.1rem' }}>
              {result.is_safe 
                ? "No security threats were found on this website." 
                : "This website has been flagged as dangerous."}
            </p>
          </div>

          {/* Report Body */}
          <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            
            {/* Details Column */}
            <div>
              <h4 style={{ color: '#6a7486', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '1rem' }}>Analysis Details</h4>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#333', fontWeight: '600' }}>
                  <Activity size={18} color="#1F509A"/> Risk Level
                </span>
                <span className={`status-tag ${result.is_safe ? 'safe' : 'malicious'}`}>
                  {result.prediction.toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#333', fontWeight: '600' }}>
                  <Lock size={18} color="#1F509A"/> Confidence
                </span>
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {(result.confidence * 100).toFixed(1)}%
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#333', fontWeight: '600' }}>
                  <Search size={18} color="#1F509A"/> Detection Method
                </span>
                <span style={{ color: '#666' }}>{result.method}</span>
              </div>
            </div>

            {/* Chart Column */}
            <div>
              <h4 style={{ color: '#6a7486', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '1rem' }}>Probability Engine</h4>
              <div style={{ height: '150px', width: '100%' }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={60} tick={{fontSize: 12}} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default URLChecker;