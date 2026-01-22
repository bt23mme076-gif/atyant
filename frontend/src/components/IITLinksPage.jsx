import React, { useState } from 'react';
import { Search, Building2, ExternalLink, GraduationCap, School, Link2 } from 'lucide-react';
import './IITLinksPage.css';

const institutions = {
  'IIT Bombay': {
    url: 'https://www.scribd.com/document/345976450/IIT-Bombay-Faculties-List',
    departments: {
      'Metallurgical Engineering': 'https://www.iitb.ac.in/mems/en/people/faculty',
      'Chemical Engineering': 'https://www.che.iitb.ac.in/faculty-directory',
      'Civil Engineering': 'https://www.civil.iitb.ac.in/faculty',
      'Aerospace Engineering': 'https://www.aero.iitb.ac.in/home/people/faculty',
      'Environmental Science': 'https://www.esed.iitb.ac.in/faculty-directory',
      'Energy Science': 'https://www.ese.iitb.ac.in/faculty',
    }
  },
  'IIT Delhi': {
    url: 'https://home.iitd.ac.in/faculty.php',
    departments: {
      'Textile Technology': 'https://textile.iitd.ac.in/faculty',
      'Chemical Engineering': 'https://chemistry.iitd.ac.in/faculty',
      'Civil Engineering': 'https://civil.iitd.ac.in/index.php?lmenuid=faculty',
      'Materials Science': 'https://mse.iitd.ac.in/faculty',
      'Applied Mechanics': 'https://am.iitd.ac.in/faculty',
      'Biotechnology': 'https://beb.iitd.ac.in/faculty.html'
    }
  },
  'IIT Madras': {
    url: 'https://www.iitm.ac.in/faculty',
    departments: {
      'Engineering Design': 'https://www.iitm.ac.in/faculty',
      'Chemical Engineering': 'https://www.iitm.ac.in/faculty',
      'Civil Engineering': 'https://www.iitm.ac.in/faculty',
      'Materials Science': 'https://www.iitm.ac.in/faculty',
      'Ocean Engineering': 'https://www.iitm.ac.in/faculty',
      'Biotechnology': 'https://www.iitm.ac.in/faculty'
    }
  },
  'IIT Kanpur': {
    url: 'https://www.iitk.ac.in/dofa/current-faculty',
    departments: {
      'Materials Science': 'https://www.iitk.ac.in/mse/faculty',
      'Chemical Engineering': 'https://www.iitk.ac.in/che/faculty',
      'Civil Engineering': 'https://www.iitk.ac.in/ce/faculty',
      'Industrial Engineering': 'https://www.iitk.ac.in/ime/faculty',
      'Aerospace Engineering': 'https://www.iitk.ac.in/aero/faculty',
      'Biological Sciences': 'https://www.iitk.ac.in/bsbe/faculty',
    }
  },
  'IIT Kharagpur': {
    url: 'https://www.iitkgp.ac.in/faclistbydepartment',
    departments: {
      'Metallurgical Engineering': 'https://www.iitkgp.ac.in/department/MT',
      'Mining Engineering': 'https://iitkgp.irins.org/faculty/index/Department+of+Mining+Engineering',
      'Chemical Engineering': 'https://www.iitkgp.ac.in/department/CH/faculty/ch-bhaskar',
      'Civil Engineering': 'https://www.iitkgp.ac.in/department/CE/faculty/ce-lsr',
      'Agricultural Engineering': 'https://www.iitkgp.ac.in/department/AG/faculty',
      'Biotechnology': 'https://www.iitkgp.ac.in/department/BT/faculty/bt-amitk',
    }
  },
  'IIT Roorkee': {
    url: 'https://iitr.ac.in/Administration/List%20of%20Faculty.html',
    departments: {
      'Metallurgical Engineering': 'https://iitr.ac.in/Departments/Metallurgical%20and%20Materials%20Engineering%20Department/People/Faculty/index.html',
      'Chemical Engineering': 'https://iitr.ac.in/Departments/Chemical%20Engineering%20Department/People/Faculty/index.html',
      'Civil Engineering': 'https://civil.iitr.ac.in/faculty.aspx',
      'Bioscience and Bio Eng': 'https://iitr.ac.in/Departments/Biosciences%20and%20Bioengineering%20Department/People/Faculty/index.html',
      'Architecture': 'https://iitr.ac.in/Departments/Architecture%20and%20Planning%20Department/People/Faculty/index.html',
      'Earth Sciences': 'https://iitr.ac.in/Departments/Earth%20Sciences%20Department/People/Faculty/index.html',
    }
  },
  'IIT Guwahati': {
    url: 'https://www.iitg.ac.in/iitg_faculty_all',
    departments: {
      'Chemical Engineering': 'https://www.iitg.ac.in/iitg_faculty_all',
      'Civil Engineering': 'https://www.iitg.ac.in/iitg_faculty_all',
      'Biosciences': 'https://www.iitg.ac.in/iitg_faculty_all',
      'Chemistry': 'https://www.iitg.ac.in/iitg_faculty_all',
      'Design': 'https://www.iitg.ac.in/iitg_faculty_all',
    }
  },
  'IIT Indore': {
    url: 'https://www.iiti.ac.in',
    departments: {
      'Metallurgy Engineering': 'https://mems.iiti.ac.in/faculty',
      'Civil Engineering': 'https://ce.iiti.ac.in/faculty.php',
      'Chemistry': 'https://chemistry.iiti.ac.in/faculty',
      'Astronomy': 'https://iiti.irins.org/faculty/index/Department+of+Astronomy%2C+Astrophysics+and+Space+Engineering',
      'Biosciences': 'https://bsbe.iiti.ac.in/main/faculty',
    }
  },
  'IIT Hyderabad': {
    url: 'https://www.iith.ac.in/people/faculty/',
    departments: {
      'Materials Science': 'https://www.iith.ac.in/people/faculty/#profile',
      'Chemical Engineering': 'https://www.iith.ac.in/people/faculty/#profile',
      'Civil Engineering': 'https://www.iith.ac.in/people/faculty/#profile',
      'Biotechnology': 'https://www.iith.ac.in/people/faculty/#profile',
      'Climate Change': 'https://www.iith.ac.in/people/faculty/#profile',    
    }
  },
  'IIT BHU': {
    url: 'https://www.iitbhu.ac.in/dept/all',
    departments: {
      'Metallurgical Engineering': 'https://www.iitbhu.ac.in/dept/met/faculty',
      'Ceramic Engineering': 'https://www.iitbhu.ac.in/dept/cer/faculty',
      'Mining Engineering': 'https://www.iitbhu.ac.in/dept/min/faculty',
      'Chemical Engineering': 'https://www.iitbhu.ac.in/dept/che/faculty',
      'Civil Engineering': 'https://www.iitbhu.ac.in/dept/civ/faculty',
      'Pharmaceutical Engineering': 'https://www.iitbhu.ac.in/dept/phe/faculty',
    }
  },
  'IIT Mandi': {
    url: 'https://www.iitmandi.ac.in/allfaculty',
    departments: {
      'Civil Engineering': 'https://www.iitmandi.ac.in/schools/school_ce.php',
      'Materials Science': 'https://www.iitmandi.ac.in/schools/smse/people.php',
      'Bio Engineering': 'https://www.iitmandi.ac.in/schools/sbme/people.php',
      'Chemistry': 'https://www.iitmandi.ac.in/schools/sbs/people.php',
    }
  },
  'IIT Ropar': {
    url: 'https://www.iitrpr.ac.in/metallurgy/People/facilities',
    departments: {
      'Chemical Engineering': 'https://www.iitrpr.ac.in/chemical/People/faculty.php',
      'Civil Engineering': 'https://www.iitrpr.ac.in/civil/?member_category=faculty',
      'Metallurgy': 'https://mme.iitrpr.ac.in/people/faculty',
      'Chemistry': 'https://www.iitrpr.ac.in/chemistry/faculty.html',
    }
  },
};

const IITLinksPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter only IITs that match search
  const filteredIITs = Object.entries(institutions).filter(([name]) =>
    name.startsWith('IIT') && name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="iit-links-root">
      {/* Header Section */}
      <header className="iit-header-section">
        <div className="header-glass">
          <GraduationCap size={48} className="icon-main" />
          <h1>IIT Branch-wise Faculty Directory</h1>
          <p>Find direct links to professors and researchers across all top IITs.</p>
          
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Search by IIT Name (e.g. Bombay, Kanpur)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Grid Section */}
      <div className="iit-cards-container">
        <div className="stats-row">
          <span>Found <b>{filteredIITs.length}</b> Institutions</span>
        </div>
        
        <div className="iit-cards-grid">
          {filteredIITs.map(([name, data]) => (
            <div className="iit-glass-card" key={name}>
              <div className="card-top">
                <div className="title-wrapper">
                  <School className="inst-icon" size={24} />
                  <h2>{name}</h2>
                </div>
                <a href={data.url} target="_blank" rel="noopener noreferrer" className="external-badge">
                  Main Portal <ExternalLink size={14} />
                </a>
              </div>

              <div className="card-body">
                <h3><Building2 size={16} /> Branch Links</h3>
                <div className="branch-grid">
                  {Object.entries(data.departments).map(([dept, url]) => (
                    <a 
                      key={dept} 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="branch-tag"
                    >
                      <Link2 size={12} className="link-icon" />
                      {dept}
                    </a>
                  ))}
                </div>
              </div>

              <div className="card-bottom">
                <span>Verified Faculty Directory</span>
              </div>
            </div>
          ))}
        </div>

        {filteredIITs.length === 0 && (
          <div className="no-results-view">
             <Search size={64} />
             <p>No results found for "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IITLinksPage;