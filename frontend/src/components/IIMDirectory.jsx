import React, { useState, useEffect } from 'react';
import './IIMDirectory.css';

const IIMDirectory = () => {
    const [copiedIndex, setCopiedIndex] = useState(null);

    // Copy email to clipboard and show feedback
    const handleCopyEmail = (email, index) => {
      navigator.clipboard.writeText(email);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1200);
    };
  const [professors, setProfessors] = useState([]);
  const [selectedCampus, setSelectedCampus] = useState('Indian Institute of Management Ahmedabad'); // Default Selection
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // List of IIMs as per your spreadsheet tabs
  const iimList = [
  'Indian Institute of Management Ahmedabad',   // IIM A [web:4]
  'Indian Institute of Management Bangalore',   // IIM B [web:4]
  'Indian Institute of Management Calcutta',    // IIM C [web:4]
  'Indian Institute of Management Lucknow',     // IIM L [web:4]
  'Indian Institute of Management Raipur',      // IIM R (ya Ranchi, jo tum use karo) [web:4]
  'Indian Institute of Management Nagpur',      // IIM NAG [web:4][web:15]

  'Indian Institute of Management Indore',      // IIM I [web:4]
  'Indian Institute of Management Kozhikode',   // IIM K [web:4]
  'Indian Institute of Management Mumbai',      // IIM M (former NITIE) [web:4][web:14]
  'Indian Institute of Management Shillong',    // IIM S (ya Sambalpur, context pe depend) [web:4][web:17]
  'Indian Institute of Management Udaipur',     // IIM U [web:4]
  'Indian Institute of Management Tiruchirappalli', // IIM T [web:4]

  'Indian Institute of Management Rohtak',      // IIM RHT [web:4]
  'Indian Institute of Management Amritsar',    // IIM AMR [web:4][web:17]
  'Indian Institute of Management Bodh Gaya',   // IIM BG [web:4][web:17]
  'Indian Institute of Management Sirmaur',     // IIM SIR [web:4][web:17]
  'Indian Institute of Management Visakhapatnam'// IIM V [web:4][web:17]
];


  // Data fetch karne ka function
  const fetchProfessors = async (campus) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/iim/professors/${campus}`);
      const data = await response.json();
      console.log("Backend Data:", data); // ✅ Check if data is array or object
      if (Array.isArray(data)) {
        setProfessors(data);
      } else {
        console.error("Data array nahi hai:", data);
        setProfessors([]); // Error handle karein
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Jab bhi campus change ho, naya data fetch karein
  useEffect(() => {
    fetchProfessors(selectedCampus);
  }, [selectedCampus]);

  // Search filter logic - Case-insensitive and safe
  const filteredProfessors = professors.filter(prof => {
    const profacademicarea = prof.academicarea || prof.academicarea || "";
    return profacademicarea.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="iim-directory-container">
      <h1 className="iim-directory-title">IIM Faculty Directory</h1>

      {/* Campus Dropdown First */}
      <div className="iim-directory-controls">
        <select
          className="campus-select"
          value={selectedCampus}
          onChange={e => setSelectedCampus(e.target.value)}
        >
          <option value="" disabled>Select IIM Campus</option>
          {iimList.map(iim => (
            <option key={iim} value={iim}>{iim}</option>
          ))}
        </select>
      </div>

      {/* Only show search and results if a campus is selected */}
      {selectedCampus && (
        <>
          <div className="iim-directory-controls">
            <input
              type="text"
              placeholder="Search by Academic Area"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="iim-directory-grid">
              {[1,2,3,4,5,6].map(n => (
                <div key={n} className="skeleton"></div>
              ))}
            </div>
          ) : (
            <div className="iim-directory-grid">
              {filteredProfessors.length > 0 ? filteredProfessors.map((prof, index) => {
                const name = prof.name || prof.Name || "Unknown Name";
                const email = prof.email || prof.Email || "No Email Provided";
                // Check both possible field names for academic area
                const academicarea = prof.academicarea || prof.academicaarea || "Not Provided";
                return (
                  <div key={index} className="iim-directory-card">
                    {/* Header Block with Name and Department */}
                    <div className="card-header">
                      <h3 className="prof-name">{name}</h3>
                      {academicarea && <span className="department-badge">{academicarea}</span>}
                    </div>
                    <p className="campus-tag">{selectedCampus}</p>
                    <div className="email-section" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <span className="email-label">Official Email</span>
                      <a href={`mailto:${email}`} className="email-link">{email}</a>
                      <button
                        className="copy-email-btn"
                        title="Copy Email"
                        onClick={() => handleCopyEmail(email, index)}
                        style={{background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: '4px'}}
                      >
                        {/* SVG Copy Icon */}
                        <svg height="18" width="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="6" y="6" width="10" height="12" rx="2" stroke="#174ea6" strokeWidth="1.5" fill="#e0f7fa"/>
                          <rect x="2" y="2" width="10" height="12" rx="2" stroke="#90cdf4" strokeWidth="1.2" fill="#fff"/>
                        </svg>
                      </button>
                      {copiedIndex === index && (
                        <span className="copied-msg" style={{color: '#10b981', fontSize: '0.85rem', marginLeft: '6px'}}>Copied!</span>
                      )}
                    </div>
                  </div>
                );
              }) : (
                <p className="col-span-full text-center text-gray-500">No professors found.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default IIMDirectory;