import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, Search } from 'lucide-react';
import URLChecker from './URLChecker';
import Dashboard from './Dashboard';

// Navigation Component (Redesigned as Top Bar)
const TopBar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid #e0e6ed',
      padding: '0.8rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1F509A 0%, #0A3981 100%)',
          padding: '8px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Shield size={24} color="white" />
        </div>
        <div>
          {/* UPDATED NAME HERE */}
          <h1 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0A3981', margin: 0, lineHeight: 1 }}>
            PHISH<span style={{ color: '#E38E49' }}>NET</span>
          </h1>
          <p style={{ fontSize: '0.75rem', color: '#6a7486', margin: 0, letterSpacing: '0.05em' }}>
            AI THREAT INTELLIGENCE
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <button className={`btn ${isActive('/') ? 'btn-primary' : 'btn-secondary'}`} style={{ 
            padding: '0.5rem 1rem', 
            fontSize: '0.9rem',
            background: isActive('/') ? 'var(--primary-gradient)' : 'transparent',
            color: isActive('/') ? 'white' : '#6a7486',
            border: isActive('/') ? 'none' : '1px solid transparent'
          }}>
            <LayoutDashboard size={16} /> Dashboard
          </button>
        </Link>
        
        <Link to="/check" style={{ textDecoration: 'none' }}>
          <button className={`btn ${isActive('/check') ? 'btn-primary' : 'btn-secondary'}`} style={{ 
            padding: '0.5rem 1rem', 
            fontSize: '0.9rem',
            background: isActive('/check') ? 'var(--primary-gradient)' : 'transparent',
            color: isActive('/check') ? 'white' : '#6a7486',
            border: isActive('/check') ? 'none' : '1px solid transparent'
          }}>
            <Search size={16} /> URL Scanner
          </button>
        </Link>
      </div>
    </nav>
  );
};

const Footer = () => (
  <footer style={{
    textAlign: 'center',
    padding: '2rem',
    color: '#6a7486',
    fontSize: '0.85rem',
    borderTop: '1px solid #e0e6ed',
    marginTop: 'auto',
    background: '#fff'
  }}>
    <p>© 2025 PhishNet AI. Powered by LightGBM & FastAPI.</p>
  </footer>
);

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <TopBar />
        <main style={{ flex: 1, padding: '2rem 1rem' }}>
          <div className="container" style={{ maxWidth: '1100px' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/check" element={<URLChecker />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;