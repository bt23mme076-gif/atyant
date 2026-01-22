import React, { useState } from 'react';
import { Search, Building2, ExternalLink, Briefcase, Link2, LayoutGrid } from 'lucide-react';
import './IIMLinksPage.css';

// Move institutions outside the component to avoid recreation on every render
const institutions = {
  'IIM Ahmedabad': {
    url: 'https://www.iima.ac.in/faculty-research/faculty-directory',
    departments: {
      'Economics': 'https://www.iimb.ac.in/faculty-economics',
      'Entrepreneurship': 'https://www.iimb.ac.in/entrepreneurship',
      'Marketing': 'https://www.iimb.ac.in/marketing',
      'Strategic Management': 'https://www.iimb.ac.in/strategy',
      'Finance & Accounting': 'https://www.iimb.ac.in/finance-account',
    }
  },
  'IIM Bangalore': {
    url: 'https://www.iimb.ac.in/index.php/faculty',
    departments: {
      'Finance': 'https://www.iimb.ac.in/finance-account',
      'Marketing': 'https://www.iimb.ac.in/marketing',
      'Entrepreneurship': 'https://www.iimb.ac.in/entrepreneurship',
    }
  },
  'IIM Calcutta': {
    url: 'https://www.iimcal.ac.in/faculty/faculty-directory',
    departments: {
      'Finance': 'https://www.iimcal.ac.in/faculty/finance-and-control',
      'Marketing': 'https://www.iimcal.ac.in/faculty/marketing',
      'Economics': 'https://www.iimcal.ac.in/faculty/economics',
    }
  },
  'IIM Indore': {
    url: 'https://www.iimidr.ac.in/faculty/',
    departments: {
      'Economics': 'https://iimidr.ac.in/faculty/full-time-faculty/',
      'Finance & Accounting': 'https://www.iimidr.ac.in/faculty/?area=Finance%20and%20Accounting',
      'Marketing': 'https://www.iimidr.ac.in/faculty/?area=Marketing',
      'Strategic Management': 'https://www.iimidr.ac.in/faculty/?area=Strategic%20Management',
      'Organizational Behaviour': 'https://www.iimidr.ac.in/faculty/?area=Organizational%20Behaviour',
    }
  },
  'IIM Lucknow': {
    url: 'https://www.iiml.ac.in/faculty-list-by-area',
    departments: {
      'Finance': 'https://www.iiml.ac.in/faculty-list-by-specilization?n=Ng==',
      'Marketing': 'https://www.iiml.ac.in/faculty-list-by-specilization?n=MTA=',
      'Operations Management': 'https://www.iiml.ac.in/faculty-list-by-specilization?n=MTE=',
      'Economics': 'https://www.iiml.ac.in/faculty-list-by-specilization?n=Mg==',
      'Information Systems': 'https://www.iiml.ac.in/faculty-list-by-specilization?n=OA==',
    }
  },
  'IIM Nagpur': {
    url: 'https://www.iimnagpur.ac.in/faculty.php',
    departments: {
      'Finance & Accounting': 'https://www.iimnagpur.ac.in/faculty.php?area=Finance%20and%20Accounting',
      'Marketing': 'https://www.iimnagpur.ac.in/faculty.php?area=Marketing',
      'Operations Management': 'https://www.iimnagpur.ac.in/faculty.php?area=Operations%20Management',
      'Strategy & Entrepreneurship': 'https://www.iimnagpur.ac.in/faculty.php?area=Strategy',
      'Organizational Behaviour': 'https://www.iimnagpur.ac.in/faculty.php?area=Organizational%20Behaviour',
    }
  },
};

import { useMemo } from 'react';

const IIMLinksPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Memoize filteredIIMs to avoid unnecessary recalculation and rerenders
  const filteredIIMs = useMemo(() => {
    return Object.entries(institutions).filter(([name]) =>
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="iim-links-root">
      {/* Header Section */}
      <header className="iim-hero-section">
        <div className="hero-glass-container">
          <Briefcase size={48} className="hero-accent-icon" />
          <h1>IIM Faculty & Research Areas</h1>
          <div className="iim-subtitle">All India Institutes of Management – Explore faculty and research areas for every IIM campus.</div>
          <p>Explore specialized management areas and faculty directories across top IIMs.</p>
          <a
            href="https://docs.google.com/spreadsheets/d/1pR125k42O8nitBgYna26zwWp1CDxWmXHgXAxb5wc5e4/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="download-iim-gmail-btn"
            style={{
              display: 'inline-block',
              marginTop: '24px',
              padding: '12px 28px',
              background: 'linear-gradient(90deg, #10b981 60%, #34d399 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1.05rem',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(16,185,129,0.12)',
              textDecoration: 'none',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
          >
            Download All IIM Prof Gmail
          </a>
        </div>
      </header>

      {/* Sticky Search Bar */}
      <div className="iim-search-bar-sticky">
        <div className="iim-search-box">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Search IIM (e.g. Ahmedabad, Lucknow)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="iim-content-wrapper">
        <div className="stats-indicator">
          <LayoutGrid size={16} />
          <span>Showing <strong>{filteredIIMs.length}</strong> IIM Institutions</span>
        </div>
        <section className="iim-section-header">
          <h2>All IIMs & Management Research Areas</h2>
        </section>
        <div className="iim-cards-grid">
          {filteredIIMs.map(([name, data]) => (
            <div className="iim-glass-card" key={name}>
              <div className="card-header">
                <div className="name-group">
                  <Building2 className="inst-icon" size={22} />
                  <h2>{name}</h2>
                </div>
                <a href={data.url} target="_blank" rel="noopener noreferrer" className="portal-btn">
                  Directory <ExternalLink size={14} />
                </a>
              </div>

              <div className="card-body">
                <h3>Management Areas</h3>
                <div className="area-tags-container">
                  {Object.entries(data.departments).map(([area, url]) => (
                    <a 
                      key={area} 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="area-tag"
                    >
                      <Link2 size={12} />
                      {area}
                    </a>
                  ))}
                </div>
              </div>

              <div className="card-footer">
                <span>Updated Research Links 2026</span>
              </div>
            </div>
          ))}
        </div>

        {filteredIIMs.length === 0 && (
          <div className="no-match-state">
             <Search size={50} />
             <p>No IIM matches your search term.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default IIMLinksPage;