import React, { useState } from 'react';
import { Download, Mail, ExternalLink, Search, Filter, Building2, GraduationCap, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import './InternshipPage.css';

const InternshipPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstitute, setSelectedInstitute] = useState('all');
  const [institutionType, setInstitutionType] = useState('all');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // ========== ALUMNI TESTIMONIALS DATA ==========
  const testimonials = [
    {
      name: "Astha Sharma",
      college: "VNIT Nagpur",
      branch: "Metallurgical Engineering",
      internAt: "IIT Delhi - Materials Science Lab",
      gender: "male",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aryan&gender=male",
      review: "Cold emailing worked like magic! I sent 60 emails and got 4 positive responses. The key is personalization - mention their recent papers and explain why you're genuinely interested.",
      tips: "Start 4 months before summer. Research the professor's work deeply. Your email should show you've done homework, not just copy-paste template."
    },
    {
      name: "Riya Rai",
      college: "VNIT Nagpur",
      branch: "Civil Engineering",
      internAt: "IIT Kanpur - Structural Engineering",
      gender: "male",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nitin&gender=male",
      review: "Being from NIT, I was nervous about reaching IIT professors. But professors care about passion, not college name. I got internship at IIT Kanpur by showing my genuine interest in earthquake-resistant structures.",
      tips: "Don't hesitate because of your college tag. Show your projects, skills, and enthusiasm. Quality of email matters more than sender's college."
    },
    {
      name: "Hemant Kumar",
      college: "BIT Mesra",
      branch: "Chemical Engineering",
      internAt: "IIM Bangalore - Operations Research",
      gender: "male",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hemant&gender=male",
      review: "Got IIM-B internship from a tier-2 college! The trick? I sent a 1-page project proposal along with my email showing how I can contribute to their ongoing research on supply chain optimization.",
      tips: "For IIM internships, highlight analytical skills, data projects, and business acumen. Attach a crisp project proposal - shows initiative and seriousness."
    },
    {
      name: "Shubham Singh",
      college: "IIT Roorkee",
      branch: "Biotechnology",
      internAt: "IIT Hyderabad - Biotech Lab",
      gender: "male",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Shubham&gender=male",
      review: "Even from IIT, getting internship isn't automatic. I personalized each email, mentioned specific research papers, and followed up politely after 10 days. Persistence pays off!",
      tips: "Send follow-up emails professionally. Something like: 'Hope you received my previous email. I'm still very interested in contributing to your lab.' Keep it short and respectful."
    },
    {
      name: "Prachi Sharma",
      college: "Manipal Institute of Technology",
      branch: "Environmental Engineering",
      internAt: "IIT Bombay - Climate Change Research",
      gender: "female",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Prachi&gender=female",
      review: "As a girl from private college, I was doubtful. But IIT-B prof loved my passion for climate research! Gender and college don't matter - your interest and skills do. Got internship in first attempt!",
      tips: "Don't underestimate yourself. Highlight relevant coursework, online certifications, and personal projects. Professors value dedication over pedigree."
    },
    {
      name: "Roshni Verma",
      college: "NIT Trichy",
      branch: "Industrial Engineering",
      internAt: "IIM Ahmedabad - Strategy Consulting",
      gender: "female",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roshni&gender=female",
      review: "Cracked IIM-A internship by showing my work with college consulting club. They appreciated practical experience. Your extracurriculars matter - clubs, competitions, case studies - mention them all!",
      tips: "For management internships, showcase leadership roles, case competitions, and analytical projects. IIMs look for well-rounded candidates, not just academics."
    }
  ];

  // ========== TESTIMONIAL NAVIGATION ==========
  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // ========== IIT & IIM FACULTY DATA (LOWER BRANCHES FOCUSED) ==========
  const institutions = {
    'IIT Bombay': {
      url: 'https://www.iitb.ac.in/en/about-iit-bombay/people/faculty-lists',
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
        'Textile Technology': 'https://textile.iitd.ac.in/people/faculty',
        'Chemical Engineering': 'https://chemical.iitd.ac.in/people/faculty',
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
      url: 'https://www.iitk.ac.in/new/faculty',
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
        'Metallurgical Engineering': 'https://www.iitkgp.ac.in/department/MT/faculty',
        'Mining Engineering': 'https://www.iitkgp.ac.in/department/MN/faculty',
        'Chemical Engineering': 'https://www.iitkgp.ac.in/department/CH/faculty',
        'Civil Engineering': 'https://www.iitkgp.ac.in/department/CE/faculty',
        'Agricultural Engineering': 'https://www.iitkgp.ac.in/department/AG/faculty',
        'Biotechnology': 'https://www.iitkgp.ac.in/department/BT/faculty',
      }
    },
    'IIT Roorkee': {
      url: 'https://www.iitr.ac.in/academics/faculty.html',
      departments: {
        'Metallurgical Engineering': 'https://www.iitr.ac.in/departments/MT/pages/People+Faculty_List.html',
        'Chemical Engineering': 'https://www.iitr.ac.in/departments/CH/pages/People+Faculty_List.html',
        'Civil Engineering': 'https://www.iitr.ac.in/departments/CE/pages/People+Faculty_List.html',
        'Paper Technology': 'https://www.iitr.ac.in/departments/PT/pages/People+Faculty_List.html',
        'Architecture': 'https://www.iitr.ac.in/departments/AR/pages/People+Faculty_List.html',
        'Earth Sciences': 'https://www.iitr.ac.in/departments/ES/pages/People+Faculty_List.html',
      }
    },
    'IIT Guwahati': {
      url: 'https://www.iitg.ac.in/people/faculty',
      departments: {
        'Chemical Engineering': 'https://www.iitg.ac.in/che/faculty.html',
        'Civil Engineering': 'https://www.iitg.ac.in/civil/faculty.html',
        'Biosciences': 'https://www.iitg.ac.in/biotech/faculty.html',
        'Chemistry': 'https://www.iitg.ac.in/chem/faculty.html',
        'Design': 'https://www.iitg.ac.in/design/faculty.html',
      }
    },
    'IIT Indore': {
      url: 'https://www.iiti.ac.in/page/faculty',
      departments: {
        'Metallurgy Engineering': 'https://www.iiti.ac.in/page/mme-faculty',
        'Civil Engineering': 'https://www.iiti.ac.in/page/ce-faculty',
        'Chemistry': 'https://www.iiti.ac.in/page/chemistry-faculty',
        'Astronomy': 'https://www.iiti.ac.in/page/astronomy-faculty',
        'Biosciences': 'https://www.iiti.ac.in/page/bio-faculty',
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
    'IIM Ahmedabad': {
      url: 'https://www.iima.ac.in/faculty-research/faculty-directory',
      departments: {
        'Economics': 'https://www.iima.ac.in/web/faculty/area/economics',
        'Strategic Management': 'https://www.iima.ac.in/web/faculty/area/strategic-management',
        'Public Policy': 'https://www.iima.ac.in/web/faculty/area/public-systems-group',
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
      url: 'https://www.iimcal.ac.in/users/faculty',
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
        'Economics': 'https://www.iiml.ac.in/faculty-list-by-specilization?n=Mg=',
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

  // ========== EMAIL TEMPLATE DOWNLOAD ==========
  const downloadEmailTemplate = () => {
    const emailTemplate = `For IIM Internship 

Subject - Request for Summer/Winter Internship Opportunity in <Prof Domain>.

Subject: Inquiry Regarding Summer Internship Opportunity (June–July 202*)

Respected Prof. <Name>
I hope you are doing well. I am <your name>, a <your> -year B.Tech student at VNIT Nagpur, pursuing <Department> Engineering. with a strong interest in entrepreneurship, applying data-driven strategies to real-world problems.

I am writing to express my interest in a Summer/Winter Research Internship under your guidance in the <Research interest from the professor profile from college website>. I am particularly interested in <specific research topic only two-three>.

At 180 Degrees Consulting VNIT("Use Your College Club if not use this, it is universal club"), I have worked on projects involving organizational analysis, behavioral research, and data-driven decision-making. I am also skilled in Python, Power BI, and analytics.

I am available for the internship anytime between *th May to *th July 2026.

My resume is available here for your reference:
<Use Drive link >
I would be grateful for the opportunity to contribute to your research. Looking forward to your response.

Best regards,
<Your Name>
B.Tech, VNIT Nagpur
Contact: +91 987654321
LinkedIn: www.linkedin.com/in/**yourlink**283    


For IIT Internship 

Summer Internship Opportunity Under Your Guidance.

Subject: Inquiry Regarding Summer Research Opportunity (June–July 202*)
Respected Prof. <Name>
I hope this email finds you well. My name is <Your Name>, second-year B.Tech student at <College Name>. I am writing to express my keen interest in working under your guidance during the Summer term (June–July) of 202*.
I am particularly interested in your research on <Research interest from the professor profile from college website>. The study of these materials and their tunable properties fascinates me, and I am eager to gain hands-on experience in this field.
I have attached my CV for your reference. I would be grateful for the opportunity to discuss any potential openings in your lab. Thank you for your time and consideration. I look forward to your response.
Warm Regards,
<Name>
Visvesvaraya National Institute of Technology
S. Ambazari Rd, Nagpur 440010
Contact: +91 987654321
Resume link [ Drive Link ]
`;

    const blob = new Blob([emailTemplate], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Internship_Email_Template_Atyant.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // ========== FILTER INSTITUTIONS ==========
  const filteredInstitutions = Object.entries(institutions).filter(([name, data]) => {
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesInstitute = selectedInstitute === 'all' || name === selectedInstitute;
    
    const matchesType = 
      institutionType === 'all' || 
      (institutionType === 'iit' && name.startsWith('IIT')) ||
      (institutionType === 'iim' && name.startsWith('IIM'));
    
    return matchesSearch && matchesInstitute && matchesType;
  });

  return (
    <div className="internship-page">
      {/* ========== HERO SECTION ========== */}
      <div className="internship-hero">
        <div className="hero-content">
          <GraduationCap size={64} className="hero-icon" />
          <h1>Research Internship Portal</h1>
          <p>Connect with faculty at IITs & IIMs - Focus on Core & Lower Branches</p>
          
          <button className="download-template-btn" onClick={downloadEmailTemplate}>
            <Download size={20} />
            Download Email Template
          </button>
        </div>
      </div>

     
      {/* ========== SEARCH & FILTER ========== */}
      <div className="internship-filters">
        <div className="filters-container">
          
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search institutions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="type-filter-buttons">
            <button 
              className={`type-btn ${institutionType === 'all' ? 'active' : ''}`}
              onClick={() => setInstitutionType('all')}
            >
              <Building2 size={18} />
              All Institutions
            </button>
            <button 
              className={`type-btn iit-btn ${institutionType === 'iit' ? 'active' : ''}`}
              onClick={() => setInstitutionType('iit')}
            >
              <GraduationCap size={18} />
              IITs Only
            </button>
            <button 
              className={`type-btn iim-btn ${institutionType === 'iim' ? 'active' : ''}`}
              onClick={() => setInstitutionType('iim')}
            >
              <Building2 size={18} />
              IIMs Only
            </button>
          </div>

          <select 
            value={selectedInstitute}
            onChange={(e) => setSelectedInstitute(e.target.value)}
            className="filter-select"
          >
            <option value="all">Select Institution</option>
            <optgroup label="IITs">
              {Object.keys(institutions)
                .filter(name => name.startsWith('IIT'))
                .map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
            </optgroup>
            <optgroup label="IIMs">
              {Object.keys(institutions)
                .filter(name => name.startsWith('IIM'))
                .map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
            </optgroup>
          </select>

          <div className="results-count">
            <span className="count-badge">{filteredInstitutions.length}</span>
            <span className="count-text">
              {filteredInstitutions.length === 1 ? 'Institution' : 'Institutions'} Found
            </span>
          </div>

        </div>
      </div>

      {/* ========== HOW TO COLD EMAIL - STEP BY STEP ========== */}
      <div className="how-to-section">
        <h3>📧 How to Cold Email - Step by Step Guide</h3>
        <div className="steps-container">
          
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>🌐 Visit College Website</h4>
              <p>Go to the department page of your target IIT/IIM</p>
              <ul>
                <li>Navigate to "Faculty" or "People" section</li>
                <li>Look for professors in your field of interest</li>
                <li>Example: <code>www.iitb.ac.in → Chemical Engg → Faculty</code></li>
              </ul>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>🔍 Search Professor in Your Domain</h4>
              <p>Find professors whose research matches your interest</p>
              <ul>
                <li>Click on professor's profile page</li>
                <li>Read their bio and current projects</li>
                <li>Check recent publications (Google Scholar)</li>
              </ul>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>📋 Copy Their Research Interests</h4>
              <p>Note down specific research topics from their profile</p>
              <ul>
                <li>Copy 2-3 specific research areas</li>
                <li>Note recent paper titles (last 2 years)</li>
                <li>Example: "Nanomaterials for Energy Storage"</li>
              </ul>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">4</div>
            <div className="step-content">
              <h4>✍️ Personalize Your Email</h4>
              <p>Customize the email template with their research</p>
              <ul>
                <li>Mention specific paper/project that interested you</li>
                <li>Explain why their work fascinates you (2-3 lines)</li>
                <li>Connect it with your skills/experience</li>
              </ul>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">5</div>
            <div className="step-content">
              <h4>📎 Attach Tailored Resume</h4>
              <p>Update resume to highlight relevant skills</p>
              <ul>
                <li>Add relevant coursework matching their research</li>
                <li>Highlight projects in similar domain</li>
                <li>Keep it 1 page, use clean format</li>
              </ul>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">6</div>
            <div className="step-content">
              <h4>📧 Send Email & Follow Up</h4>
              <p>Send during working hours, follow up politely</p>
              <ul>
                <li>Best time: Tuesday-Thursday, 10 AM - 4 PM</li>
                <li>Subject line: Clear & specific</li>
                <li>Follow up after 7-10 days if no response</li>
                <li>Send 50+ emails, expect 2-3 replies</li>
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* ========== INSTITUTIONS LIST ========== */}
      <div className="institutions-section">
        <h2>
          <Building2 size={28} />
          Faculty Directory - Core Branches
        </h2>
        
        <div className="institutions-grid">
          {filteredInstitutions.map(([name, data]) => (
            <div key={name} className="institution-card">
              <div className="institution-header">
                <h3>{name}</h3>
                <a 
                  href={data.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="view-all-btn"
                >
                  View All Faculty <ExternalLink size={16} />
                </a>
              </div>

              <div className="departments-list">
                <h4>Departments:</h4>
                {Object.entries(data.departments).map(([dept, url]) => (
                  <a
                    key={dept}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="department-link"
                  >
                    <span>{dept}</span>
                    <ExternalLink size={14} />
                  </a>
                ))}
              </div>

              <div className="card-footer">
                <Mail size={16} />
                <span>Use email template to reach out</span>
              </div>
            </div>
          ))}
        </div>

        {filteredInstitutions.length === 0 && (
          <div className="no-results">
            <Search size={48} />
            <p>No institutions found matching your search</p>
          </div>
        )}
      </div>

       {/* ========== ALUMNI TESTIMONIALS SLIDER ========== */}
      <div className="testimonials-section">
        <h2>🎓 Success Stories from Our Alumni</h2>
        <p className="testimonials-subtitle">Real students, Real internships, Real advice</p>
        
        <div className="testimonial-slider">
          <button className="slider-btn prev" onClick={prevTestimonial} aria-label="Previous testimonial">
            <ChevronLeft size={24} />
          </button>

          <div className="testimonial-card-active">
            <div className="testimonial-header">
              <img 
                src={testimonials[currentTestimonial].image} 
                alt={`${testimonials[currentTestimonial].name} - ${testimonials[currentTestimonial].gender}`}
                className="testimonial-avatar"
              />
              <div className="testimonial-info">
                <h3>{testimonials[currentTestimonial].name}</h3>
                <p className="college-tag">{testimonials[currentTestimonial].college}</p>
                <p className="branch-tag">{testimonials[currentTestimonial].branch}</p>
                <div className="intern-badge">
                  <GraduationCap size={16} />
                  <span>Interned at: {testimonials[currentTestimonial].internAt}</span>
                </div>
              </div>
            </div>

            <div className="testimonial-content">
              <Quote className="quote-icon" size={32} />
              <p className="review-text">{testimonials[currentTestimonial].review}</p>
              
              <div className="tips-box">
                <h4>💡 Pro Tip:</h4>
                <p>{testimonials[currentTestimonial].tips}</p>
              </div>
            </div>
          </div>

          <button className="slider-btn next" onClick={nextTestimonial} aria-label="Next testimonial">
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="slider-dots">
          {testimonials.map((testimonial, index) => (
            <button
              key={index}
              className={`dot ${index === currentTestimonial ? 'active' : ''}`}
              onClick={() => setCurrentTestimonial(index)}
              aria-label={`View testimonial from ${testimonial.name}`}
            />
          ))}
        </div>
      </div>

      {/* ========== EXAMPLE SECTION AT END ========== */}
      <div className="example-section">
        <div className="example-box">
          <h4>💡 Example: Personalization</h4>
          <div className="example-content">
            <div className="bad-example">
              <span className="badge bad">❌ Generic</span>
              <p>"I am interested in doing an internship in your lab."</p>
            </div>
            <div className="good-example">
              <span className="badge good">✅ Personalized</span>
              <p>"I read your recent publication on 'Graphene-based sensors for biomedical applications' in Nature Materials (2024). Your approach to functionalizing graphene sheets particularly intrigued me, as I have worked on similar nanomaterial synthesis in my recent project on carbon nanotubes."</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default InternshipPage;