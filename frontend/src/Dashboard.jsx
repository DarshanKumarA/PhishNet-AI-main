import { useState, useEffect } from 'react';
import axios from 'axios'; // We need axios back to talk to the server
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Trash2, Activity, ShieldCheck, AlertTriangle, TrendingUp, Clock, PieChart as PieIcon } from 'lucide-react';

// StatCard Component
const StatCard = ({ title, value, icon: Icon, color, subtext }) => {
  return (
    <div className="card" style={{ 
      borderTop: `4px solid ${color}`, 
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
        <div>
          <p style={{ margin: 0, color: '#6a7486', fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase' }}>{title}</p>
          <h3 style={{ margin: '5px 0 0 0', fontSize: '2.2rem', fontWeight: '700', color: '#333' }}>{value}</h3>
        </div>
        <div style={{ background: `${color}15`, padding: '10px', borderRadius: '10px' }}>
          {Icon && <Icon size={24} color={color} />}
        </div>
      </div>
      {subtext && <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>{subtext}</p>}
    </div>
  );
};

const Dashboard = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // DYNAMIC URL CONFIGURATION
  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  // CHANGED: Fetch from API so we see Extension scans too!
  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/history`);
      // Reverse the array to show newest first
      setHistory(res.data.reverse());
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if(confirm("Are you sure you want to clear all scan history?")) {
      try {
        await axios.delete(`${API_BASE}/history`);
        setHistory([]);
      } catch (err) {
        console.error("Failed to delete history", err);
      }
    }
  };

  useEffect(() => {
    fetchHistory();
    
    // Optional: Auto-refresh every 5 seconds to see new extension scans live
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  // Calculate Statistics
  const totalScans = history.length;
  const safeScans = history.filter(h => h.is_safe).length;
  const maliciousScans = totalScans - safeScans;
  const avgConfidence = totalScans > 0 
    ? (history.reduce((acc, curr) => acc + (curr.confidence || 0), 0) / totalScans * 100).toFixed(1)
    : 0;

  const pieData = [
    { name: 'Safe', value: safeScans, color: '#28a745' },
    { name: 'Malicious', value: maliciousScans, color: '#dc3545' }
  ];

  if (loading) return <div style={{textAlign:'center', padding:'3rem', color:'#666'}}>Loading intelligence data...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0A3981', margin: 0 }}>Security Overview</h2>
          <p style={{ color: '#6a7486', margin: 0 }}>Real-time threat intelligence statistics</p>
        </div>
        {totalScans > 0 && (
          <button onClick={clearHistory} className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
            <Trash2 size={14}/> Clear Logs
          </button>
        )}
      </div>

      {/* STATS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard 
          title="Total Scans" 
          value={totalScans} 
          icon={Activity} 
          color="#1F509A" 
          subtext="Lifetime scan count"
        />
        <StatCard 
          title="Safe URLs" 
          value={safeScans} 
          icon={ShieldCheck} 
          color="#28a745" 
          subtext="Verified legitimate sites"
        />
        <StatCard 
          title="Threats" 
          value={maliciousScans} 
          icon={AlertTriangle} 
          color="#dc3545" 
          subtext="Phishing & Malware detected"
        />
        <StatCard 
          title="Avg Confidence" 
          value={`${avgConfidence}%`} 
          icon={TrendingUp} 
          color="#E38E49" 
          subtext="Model prediction certainty"
        />
      </div>

      {totalScans === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ background: '#f0f4f8', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <Activity size={40} color="#1F509A"/>
          </div>
          <h3 style={{color: '#0A3981'}}>No Data Available</h3>
          <p style={{color: '#666'}}>Start scanning URLs to generate security insights.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
          
          {/* CHART SECTION */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
              <PieIcon size={20} color="#1F509A" />
              <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#333' }}>Threat Distribution</h3>
            </div>
            
            <div style={{ flex: 1, minHeight: '300px', width: '100%' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RECENT SCANS LIST */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
              <Clock size={20} color="#1F509A" />
              <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#333' }}>Recent Activity Log</h3>
            </div>
            
            <div style={{ overflowY: 'auto', maxHeight: '350px', paddingRight: '5px' }}>
              {history.slice(0, 10).map((scan, idx) => (
                <div key={idx} style={{ 
                  padding: '12px', 
                  marginBottom: '8px',
                  background: '#f8faff', 
                  borderRadius: '8px',
                  borderLeft: `4px solid ${scan.is_safe ? '#28a745' : '#dc3545'}`,
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'transform 0.2s',
                  cursor: 'default'
                }}>
                  <div style={{ overflow: 'hidden', maxWidth: '70%' }}>
                    <div style={{ 
                      fontFamily: 'monospace', 
                      color: '#333', 
                      fontSize: '0.9rem', 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis' 
                    }}>
                      {scan.url}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px', display: 'flex', gap: '10px' }}>
                      <span>{new Date(scan.timestamp).toLocaleTimeString()}</span>
                      <span>•</span>
                      <span>{scan.method}</span>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: '700', 
                      color: scan.is_safe ? '#28a745' : '#dc3545',
                      background: scan.is_safe ? '#e6f7ed' : '#ffebeb',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      letterSpacing: '0.5px'
                    }}>
                      {scan.prediction.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Dashboard;