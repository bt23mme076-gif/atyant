import React, { useEffect, useState } from 'react';
import { Copy } from 'lucide-react';
import './IITDirectory.css';

const iitList = [
  'Indian Institute of Technology Bombay',
  'Indian Institute of Technology Delhi',
  'Indian Institute of Technology Kanpur',
  'Indian Institute of Technology Kharagpur',
  'Indian Institute of Technology Madras',
  'Indian Institute of Technology Roorkee',
  // Add more IITs as per your sheet tabs
];

const SHEET_ID = '1XClZg0lO7whLCO5TSOGZ5w7Asqs3wzmbUv-wVJjqhjE';

const IITDirectory = () => {
  const [professors, setProfessors] = useState([]);
  const [selectedCampus, setSelectedCampus] = useState(iitList[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const fetchProfessors = async (campus) => {
    setLoading(true);
    try {
      // Sheet tab name should match campus name or be mapped accordingly
      const tabName = encodeURIComponent(campus);
      const url = `https://opensheet.elk.sh/${SHEET_ID}/${tabName}`;
      const res = await fetch(url);
      const data = await res.json();
      setProfessors(data);
    } catch (e) {
      setProfessors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessors(selectedCampus);
  }, [selectedCampus]);

  const filteredProfessors = professors.filter(prof => {
    const area = prof.academicarea || prof.academicaarea || '';
    return (
      (prof.name || prof.Name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleCopyEmail = (email, idx) => {
    navigator.clipboard.writeText(email);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1200);
  };

  return (
    <div className="iit-directory-container">
      <h1 className="iit-directory-title">IIT Faculty Directory</h1>
      <div className="iit-directory-controls">
        <select
          className="campus-select"
          value={selectedCampus}
          onChange={e => setSelectedCampus(e.target.value)}
        >
          {iitList.map(iit => (
            <option key={iit} value={iit}>{iit}</option>
          ))}
        </select>
      </div>
      <div className="iit-directory-controls">
        <input
          type="text"
          placeholder="Search by Name or Academic Area"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      {loading ? (
        <div className="iit-directory-grid">
          {[1,2,3,4,5,6].map(n => (
            <div key={n} className="skeleton"></div>
          ))}
        </div>
      ) : (
        <div className="iit-directory-grid">
          {filteredProfessors.length > 0 ? filteredProfessors.map((prof, idx) => {
            const name = prof.name || prof.Name || 'Unknown Name';
            const email = prof.email || prof.Email || 'No Email Provided';
            const academicarea = prof.academicarea || prof.academicaarea || 'Not Provided';
            return (
              <div className="iit-directory-card" key={idx}>
                <div className="card-header">
                  <span className="prof-name">{name}</span>
                  <span className="department-badge">{academicarea}</span>
                </div>
                <div className="campus-tag">{selectedCampus.replace('Indian Institute of Technology ', 'IIT ')}</div>
                <div className="email-section">
                  <span className="email-label">Official Email</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <a href={`mailto:${email}`}>{email}</a>
                    <button
                      className="copy-btn"
                      onClick={() => handleCopyEmail(email, idx)}
                      title="Copy Email"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        marginLeft: 4,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Copy size={18} color="#2563eb" />
                    </button>
                    {copiedIndex === idx && (
                      <span className="copied-msg">Copied!</span>
                    )}
                  </span>
                </div>
              </div>
            );
          }) : (
            <p className="col-span-full text-center text-gray-500">No professors found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default IITDirectory;