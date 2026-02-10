import React, { useState, useContext, useEffect } from 'react';
import { useEffect as useEffectReact, useState as useStateReact } from 'react';
import { Download, Mail, ExternalLink, Search, Filter, Building2, GraduationCap, ChevronLeft, ChevronRight, Quote, Lock, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import SEO from './SEO';
import LoadingSpinner from './LoadingSpinner';
import './InternshipPage.css';

const InternshipPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isLoggedIn = !!user;
  
  // ✅ ADD LOADING STATE
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstitute, setSelectedInstitute] = useState('all');
  const [institutionType, setInstitutionType] = useState('all');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  // ✅ ADD THESE NEW STATES FOR SWIPE
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Add this to remove the "Swipe" hint after first swipe:
  const [swiped, setSwiped] = useState(false);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // ✅ ADD STATE FOR COLLAPSIBLE STEPS
  const [expandedSteps, setExpandedSteps] = useState([]);

  const toggleStep = (stepNumber) => {
    setExpandedSteps(prev => 
      prev.includes(stepNumber) 
        ? prev.filter(s => s !== stepNumber)
        : [...prev, stepNumber]
    );
  };

  // ✅ ADD useEffect FOR INITIAL LOADING
  useEffect(() => {
    // Simulate initial page load
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800); // 800ms loading time

    return () => clearTimeout(timer);
  }, []);

  // ========== PROTECTED LINK HANDLER ==========
  const handleProtectedLink = (url, e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      const shouldLogin = window.confirm(
        '🔒 Login Required!\n\nYou need to login to access faculty links.\n\nClick OK to go to login page.'
      );
      
      if (shouldLogin) {
        navigate('/login', { 
          state: { from: '/internships' } 
        });
      }
      return;
    }

    // If logged in, open link
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // ========== PROTECTED DOWNLOAD ==========
  const handleDownloadTemplate = () => {
    if (!isLoggedIn) {
      const shouldLogin = window.confirm(
        '🔒 Login Required!\n\nYou need to login to download email template.\n\nClick OK to go to login page.'
      );
      
      if (shouldLogin) {
        navigate('/login', { 
          state: { from: '/internships' } 
        });
      }
      return;
    }

    // Download template code...
    const emailTemplate = `(1) GENERALIZED IIM EMAIL 

Subject: Request for Summer/Winter Internship Opportunity in [Professor's Domain]

Respected Prof. [Name],

I hope you are doing well. I am [Your Name], a 2nd yr B.Tech MME student.
I am writing to express my interest in a Summer/Winter Research Internship (May–July 2026) in [Professor's Domain]. I have explored your work on [2–3 specific topics], and I find your perspective on [one concept] particularly insightful. I would be grateful for the opportunity to learn from your approach and contribute to your research.
Through [Your Club / 180 Degrees Consulting], I have gained experience in organizational analysis, behavioural insights, structured problem-solving, and data-driven decision-making. I also use analytical tools like Python and Power BI to support research-oriented tasks.

My resume is attached here: [Drive Link]

I would appreciate the opportunity to contribute to your work.
Looking forward to your response.

Best regards,
[Your Name]
Contact: [Contact Number]
LinkedIn: [LinkedIn Profile]


---

(2) GENERALIZED IIT EMAIL

Subject: Inquiry Regarding Summer Research Internship (June–July 2026)

Respected Prof. [Name],

I hope you are doing well. I am [Your Name], a 2nd yr B.Tech MME student.
I am writing to express my interest in a Summer Research Internship (June–July 2026) under your guidance. I have explored your research in [Professor's Domain], especially [1–2 specific topics], and I am fascinated by the scientific depth and experimental approaches involved. I am eager to gain hands-on research exposure in your group.
I have been strengthening my fundamentals in [thermo/transport/materials/data analysis/modelling etc.], and I am motivated to contribute to meaningful research in your lab.

My resume is attached here: [Drive Link]

Thank you for your time and consideration.
I look forward to your response.

Warm regards,
[Your Name]
Contact: [Contact Number]


---

(3) EXAMPLE IIM EMAIL — AMAN 

Subject: Research Internship Inquiry for Summer 2025

Respected Prof. Agarwal,

I hope you are doing well. I am Aman, a 2nd yr B.Tech Metallurgical and Materials Engineering student at Visvesvaraya National Institute of Technology (VNIT), Nagpur.
I am writing to express my interest in a Summer Research Internship (June–July 2025) under your guidance. I am deeply interested in your research on International Business Dispute Resolution and Arbitration, and your work in International Commercial Arbitration and Corporate Governance particularly resonates with me. I would be grateful for the opportunity to explore this field further under your mentorship.
I have experience in research, data analysis (SQL, Power BI, Python), and consulting, and I am currently an Associate at 180 Degrees Consulting VNIT, where I have worked on projects involving business strategy, organizational assessment, and market research. I believe this experience aligns well with the structured and analytical approach needed in your research area.

My resume is attached for your reference. I would appreciate the opportunity to discuss how I can contribute to your ongoing work.
Thank you for your time and consideration.

Yours sincerely,
Aman
B.Tech, MME
Visvesvaraya National Institute of Technology, Nagpur
Email: [Email ID]
Contact: [Contact Number]
Resume Link: [Resume Link]


---

(4) EXAMPLE IIT EMAIL — ANSH

Subject: Inquiry Regarding Summer Research Opportunity (June–July 2025)

Respected Prof. Tanushree H. Choudhury,

I hope you are doing well. I am Ansh, a 2nd yr B.Tech Chemical Engineering student at Visvesvaraya National Institute of Technology (VNIT), Nagpur. I am writing to express my interest in a Summer Research Internship (June–July 2025) under your guidance.
I am particularly interested in your research on synthesizing oxide nanostructures through solution-based techniques, especially the development of tailored morphologies with enhanced thermal stability. The science behind these materials and their tunable properties fascinates me, and I am eager to gain hands-on experience in this field.

My resume is attached for your reference. I would be grateful for any opportunity to contribute to your ongoing research activities.
Thank you for your time and consideration. I look forward to your response.

Warm regards,
Ansh
B.Tech, MME
Visvesvaraya National Institute of Technology, Nagpur
Contact: [Contact Number]
Resume Link: [Resume Link]
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

  // ========== ALUMNI TESTIMONIALS DATA ==========
  const testimonials = [
    {
      name: "Astha Sharma",
      college: "VNIT Nagpur",
      branch: "Metallurgical Engineering",
      internAt: "IIT Delhi - Materials Science Lab",
      gender: "male",
      image: "https://res.cloudinary.com/dny6dtmox/image/upload/v1769103408/Screenshot_2026-01-22_230637_fzbexi.png",
      review: "Cold emailing worked like magic! I sent 60 emails and got 4 positive responses. The key is personalization - mention their recent papers and explain why you're genuinely interested.",
      tips: "Start 4 months before summer. Research the professor's work deeply. Your email should show you've done homework, not just copy-paste template."
    },
    {
      name: "Riya Rai",
      college: "VNIT Nagpur",
      branch: "Civil Engineering",
      internAt: "IIT Kanpur - Structural Engineering",
      gender: "male",
      image: "https://res.cloudinary.com/dny6dtmox/image/upload/v1769103294/Screenshot_2026-01-22_230421_rz9gjl.png",
      review: "Being from NIT, I was nervous about reaching IIT professors. But professors care about passion, not college name. I got internship at IIT Kanpur by showing my genuine interest in earthquake-resistant structures.",
      tips: "Don't hesitate because of your college tag. Show your projects, skills, and enthusiasm. Quality of email matters more than sender's college."
    },
    {
      name: "Hemant Kumar",
      college: "BIT Mesra",
      branch: "Chemical Engineering",
      internAt: "IIM Bangalore - Operations Research",
      gender: "male",
      image: "https://res.cloudinary.com/dny6dtmox/image/upload/v1769103060/Screenshot_2026-01-22_230043_sgbpwe.png",
      review: "Got IIM-B internship from a tier-2 college! The trick? I sent a 1-page project proposal along with my email showing how I can contribute to their ongoing research on supply chain optimization.",
      tips: "For IIM internships, highlight analytical skills, data projects, and business acumen. Attach a crisp project proposal - shows initiative and seriousness."
    },
    {
      name: "Shubham Singh",
      college: "IIT Roorkee",
      branch: "Biotechnology",
      internAt: "IIT Hyderabad - Biotech Lab",
      gender: "male",
      image: "https://res.cloudinary.com/dny6dtmox/image/upload/v1769102541/Screenshot_2026-01-22_225213_tjnjvr.png",
      review: "Even from IIT, getting internship isn't automatic. I personalized each email, mentioned specific research papers, and followed up politely after 10 days. Persistence pays off!",
      tips: "Send follow-up emails professionally. Something like: 'Hope you received my previous email. I'm still very interested in contributing to your lab.' Keep it short and respectful."
    },
    {
      name: "Prachi Sharma",
      college: "Manipal Institute of Technology",
      branch: "Environmental Engineering",
      internAt: "IIT Bombay - Climate Change Research",
      gender: "female",
      image: "https://res.cloudinary.com/dny6dtmox/image/upload/v1769102308/Screenshot_2026-01-22_224817_osm9ee.png",
      review: "As a girl from private college, I was doubtful. But IIT-B prof loved my passion for climate research! Gender and college don't matter - your interest and skills do. Got internship in first attempt!",
      tips: "Don't underestimate yourself. Highlight relevant coursework, online certifications, and personal projects. Professors value dedication over pedigree."
    },
    {
      name: "Roshni Verma",
      college: "NIT Trichy",
      branch: "Industrial Engineering",
      internAt: "IIM Ahmedabad - Strategy Consulting",
      gender: "female",
      image: "https://res.cloudinary.com/dny6dtmox/image/upload/v1769103152/Screenshot_2026-01-22_225454_diggrn.png",
      review: "Cracked IIM-A internship by showing my work with college consulting club. They appreciated practical experience. Your extracurriculars matter - clubs, competitions, case studies - mention them all!",
      tips: "For management internships, showcase leadership roles, case competitions, and analytical projects. IIMs look for well-rounded candidates, not just academics."
    }
  ];

  // ✅ ADD THESE SWIPE HANDLERS
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe || isRightSwipe) {
      setSwiped(true); // ✅ Hide swipe hint
    }
    
    if (isLeftSwipe) {
      nextTestimonial();
    }
    if (isRightSwipe) {
      prevTestimonial();
    }
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => 
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => 
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };



  // ========== NEW IIM & IIT FILTER LOGIC =========
  // Example: Replace with your actual data source or API fetch
  const [category, setCategory] = useState('IIT'); // 'IIT' or 'IIM'
  const [college, setCollege] = useState('');
  const [professors, setProfessors] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Simulate fetching college list on category change
  useEffectReact(() => {
    // Use the same official names as in IIMDirectory/IITDirectory
    if (category === 'IIT') {
      setColleges([
        'Indian Institute of Technology Bhilai',
        'Indian Institute of Technology (BHU) Varanasi',
        'Indian Institute of Technology Bhubaneswar',
        'Indian Institute of Technology Bombay',
        'Indian Institute of Technology Delhi',
        'Indian Institute of Technology (ISM) Dhanbad',
        'Indian Institute of Technology Dharwad',
        'Indian Institute of Technology Gandhinagar',
        'Indian Institute of Technology Goa',
        'Indian Institute of Technology Guwahati',
        'Indian Institute of Technology Hyderabad',
        'Indian Institute of Technology Indore',
        'Indian Institute of Technology Jammu',
        'Indian Institute of Technology Jodhpur',
        'Indian Institute of Technology Kanpur',
        'Indian Institute of Technology Kharagpur',
        'Indian Institute of Technology Madras',
        'Indian Institute of Technology Mandi',
        'Indian Institute of Technology Palakkad',
        'Indian Institute of Technology Patna',
        'Indian Institute of Technology Roorkee',
        'Indian Institute of Technology Ropar',
        'Indian Institute of Technology Tirupati',
        // Add more IITs as per your sheet tabs
      ]);
    } else {
      setColleges([
        'Indian Institute of Management Ahmedabad',
        'Indian Institute of Management Bangalore',
        'Indian Institute of Management Calcutta',
        'Indian Institute of Management Lucknow',
        'Indian Institute of Management Raipur',
        'Indian Institute of Management Nagpur',
        'Indian Institute of Management Indore',
        'Indian Institute of Management Kozhikode',
        'Indian Institute of Management Mumbai',
        'Indian Institute of Management Shillong',
        'Indian Institute of Management Udaipur',
        'Indian Institute of Management Tiruchirappalli',
        'Indian Institute of Management Rohtak',
        'Indian Institute of Management Amritsar',
        'Indian Institute of Management Bodh Gaya',
        'Indian Institute of Management Sirmaur',
        'Indian Institute of Management Visakhapatnam'
      ]);
    }
    setCollege('');
    setProfessors([]);
  }, [category]);

  // Protected college selection handler
  const handleCollegeSelect = (e) => {
    const selected = e.target.value;
    if (!isLoggedIn && selected) {
      const shouldLogin = window.confirm(
        '🔒 Login Required!\n\nYou need to login to view faculty emails.\n\nClick OK to go to login page.'
      );
      if (shouldLogin) {
        navigate('/login', { state: { from: '/internships' } });
      }
      return;
    }
    setCollege(selected);
  };

  // Fetch professors for selected college/category
  useEffectReact(() => {
    if (!college) {
      setProfessors([]);
      return;
    }
    setLoadingEmails(true);
    // IIT: fetch from Google Sheet, IIM: fetch from backend
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const fetchProfessors = async () => {
      try {
        let data = [];
        if (category === "IIT") {
          // Use opensheet.elk.sh for IITs (tab name = college)
          const SHEET_ID = '1XClZg0lO7whLCO5TSOGZ5w7Asqs3wzmbUv-wVJjqhjE';
          const tabName = encodeURIComponent(college);
          const url = `https://opensheet.elk.sh/${SHEET_ID}/${tabName}`;
          const res = await fetch(url);
          data = await res.json();
        } else {
          // IIM: fetch from backend (tab name = college)
          const url = `${API_URL}/api/iim/professors/${encodeURIComponent(college)}`;
          const res = await fetch(url);
          data = await res.json();
        }
        if (Array.isArray(data)) {
          setProfessors(data);
        } else {
          setProfessors([]);
        }
      } catch (e) {
        setProfessors([]);
      } finally {
        setLoadingEmails(false);
      }
    };
    fetchProfessors();
  }, [college, category]);



  // ========== SKILLS REQUIRED DATA ==========
  const skillsData = {
    IIT: [
      { skill: 'Python/MATLAB', icon: '🐍', description: 'Data analysis & simulation' },
      { skill: 'Lab Techniques', icon: '🔬', description: 'Hands-on experimental skills' },
      { skill: 'CAD/SolidWorks', icon: '📐', description: 'Design & modeling tools' },
      { skill: 'Research Aptitude', icon: '📚', description: 'Literature review & critical thinking' },
      { skill: 'Technical Writing', icon: '✍️', description: 'Reports & documentation' },
      { skill: 'Problem Solving', icon: '🧩', description: 'Analytical & logical reasoning' },
      { skill: 'Domain Knowledge', icon: '🎓', description: 'Core subject fundamentals' },
      { skill: 'Excel/Origin', icon: '📊', description: 'Data visualization & analysis' }
    ],
    IIM: [
      { skill: 'Excel/Power BI', icon: '📊', description: 'Data analysis & dashboards' },
      { skill: 'SQL/Python', icon: '💻', description: 'Database & scripting' },
      { skill: 'Case Analysis', icon: '📋', description: 'Business problem solving' },
      { skill: 'Research Methods', icon: '🔍', description: 'Qualitative & quantitative' },
      { skill: 'Presentation Skills', icon: '🎤', description: 'Communicate insights effectively' },
      { skill: 'Business Acumen', icon: '💼', description: 'Market & strategy understanding' },
      { skill: 'Analytical Thinking', icon: '🧠', description: 'Data-driven decision making' },
      { skill: 'Communication', icon: '💬', description: 'Written & verbal proficiency' }
    ]
  };

  // ========== SEO STRUCTURED DATA ==========
  const generateSchemaMarkup = () => {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": "https://atyant.in/internships",
          "url": "https://atyant.in/internships",
          "name": "IIT IIM Research Internship Portal - Direct Faculty Contact",
          "description": "Get research internships at IIT & IIM through direct cold emailing. Access 1000+ professor emails, email templates, and proven strategies from successful students.",
          "isPartOf": {
            "@id": "https://atyant.in/#website"
          },
          "about": {
            "@type": "Thing",
            "name": "Research Internships at IIT and IIM"
          },
          "breadcrumb": {
            "@id": "https://atyant.in/internships#breadcrumb"
          }
        },
        {
          "@type": "BreadcrumbList",
          "@id": "https://atyant.in/internships#breadcrumb",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://atyant.in/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Research Internships",
              "item": "https://atyant.in/internships"
            }
          ]
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How to get research internship at IIT?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "To get a research internship at IIT: 1) Select the IIT and professor whose research interests you, 2) Write a personalized cold email mentioning their specific research work, 3) Attach your resume with relevant projects, 4) Follow up politely after 7-10 days, 5) Send 50-70 emails for better response rate."
              }
            },
            {
              "@type": "Question",
              "name": "Can NIT students get internships at IIT?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! IIT professors value passion and skills over college name. NIT students regularly secure IIT internships by: demonstrating genuine research interest, showing relevant skills/projects, writing personalized emails that prove you've studied their work, and maintaining professionalism throughout."
              }
            },
            {
              "@type": "Question",
              "name": "How to write cold email for IIM internship?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Write effective IIM cold emails by: 1) Using a clear subject mentioning internship and domain, 2) Addressing professor respectfully, 3) Showing knowledge of their specific research/publications, 4) Highlighting relevant skills like data analysis, consulting, business research, 5) Keeping it concise (150-200 words), 6) Attaching resume with measurable achievements."
              }
            },
            {
              "@type": "Question",
              "name": "What is the success rate of cold emailing for internships?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Cold emailing success rate ranges from 5-10% for research internships. Students typically send 60-80 emails and receive 4-8 positive responses. Success increases with: personalized content, early timing (4 months before summer), relevant skills showcase, and following up strategically."
              }
            }
          ]
        },
        {
          "@type": "HowTo",
          "name": "How to Get Research Internship at IIT or IIM Through Cold Emailing",
          "description": "Step-by-step guide to secure research internships at premier institutions like IIT and IIM through effective cold emailing strategy",
          "step": [
            {
              "@type": "HowToStep",
              "position": 1,
              "name": "Select Target Institution and Professor",
              "text": "Choose IIT/IIM based on research interest. Browse faculty profiles, read recent publications, and identify professors whose work aligns with your interests."
            },
            {
              "@type": "HowToStep",
              "position": 2,
              "name": "Research Professor's Work",
              "text": "Study 2-3 recent papers, understand their research methodology, and identify specific aspects that genuinely interest you. This shows authentic engagement."
            },
            {
              "@type": "HowToStep",
              "position": 3,
              "name": "Craft Personalized Email",
              "text": "Write concise email (150-200 words) with: clear subject, respectful greeting, specific mention of their research, your relevant skills/projects, and resume link."
            },
            {
              "@type": "HowToStep",
              "position": 4,
              "name": "Send at Optimal Time",
              "text": "Send emails 4 months before intended internship period. Best days are Tuesday-Thursday, time between 9-11 AM when professors check emails."
            },
            {
              "@type": "HowToStep",
              "position": 5,
              "name": "Follow Up Strategically",
              "text": "If no response in 7-10 days, send polite follow-up referencing original email. Maximum 1-2 follow-ups per professor."
            }
          ],
          "totalTime": "P3M"
        },
        {
          "@type": "ItemList",
          "name": "Student Success Stories",
          "itemListElement": testimonials.map((testimonial, index) => ({
            "@type": "Review",
            "position": index + 1,
            "author": {
              "@type": "Person",
              "name": testimonial.name
            },
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": "5",
              "bestRating": "5"
            },
            "reviewBody": testimonial.review,
            "itemReviewed": {
              "@type": "Service",
              "name": "IIT IIM Internship Cold Email Strategy"
            }
          }))
        }
      ]
    };
  };

  // ✅ ADD LOADING CHECK BEFORE RETURN
  if (loading) {
    return <LoadingSpinner fullScreen={true} message="Loading Internship Portal..." />;
  }

  return (
    <>
      {/* SEO Component */}
      <SEO 
        title="IIT IIM Research Internship | Professor Emails & Templates"
        description="Get research internships at IIT & IIM. Access 1000+ professor emails across all IITs & IIMs, proven email templates, and strategies from successful students. Direct cold emailing guide for core & non-core branches."
        keywords="IIT internship, IIM internship, research internship IIT, IIT summer internship, IIM summer internship, cold emailing professors, professor email IIT, faculty contact IIT IIM, research internship India, NIT to IIT internship, engineering internship IIT, business internship IIM, how to get IIT internship, IIT professor email list, IIM faculty emails"
        url="https://atyant.in/internships"
        image="https://res.cloudinary.com/dny6dtmox/image/upload/v1738764320/internship-og-image.png"
      />
      
      {/* Schema.org Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(generateSchemaMarkup())}
      </script>

      <article className="internship-page" itemScope itemType="https://schema.org/WebPage">
      {/* ========== HERO SECTION ========== */}
      <header className="internship-hero" role="banner">
        <div className="hero-content">
          <GraduationCap size={64} className="hero-icon" aria-hidden="true" />
          <h1 itemProp="name">IIT & IIM Research Internship Portal</h1>
          <p itemProp="description">Direct access to 1000+ professor emails at IITs & IIMs - For Core & Non-Core Branches</p>
          {isLoggedIn && user && (
            <div style={{ marginBottom: '16px', color: '#4ade80', fontSize: '1rem', fontWeight: '600' }}>
              ✅ Welcome {user.name}!
            </div>
          )}
          <button 
            onClick={handleDownloadTemplate}
            className={`download-template-btn ${!isLoggedIn ? 'locked' : ''}`}
            aria-label={isLoggedIn ? 'Download IIT IIM internship email templates' : 'Login required to download email templates'}
          >
            {isLoggedIn ? <Download size={20} aria-hidden="true" /> : <Lock size={20} aria-hidden="true" />}
            <span>{isLoggedIn ? 'Download Email Template' : 'Login to Download Template'}</span>
          </button>
          {!isLoggedIn && (
            <p style={{ marginTop: '12px', color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem' }}>
              🔒 Login required to download template and access faculty links
            </p>
          )}
        </div>
      </header>

      {/* ========== PROFESSOR DIRECTORY SECTION ========== */}
      <section className="faculty-directory-combined filter-section-prominent" aria-label="IIT IIM Faculty Directory">
        <h2 className="sr-only">Search IIT and IIM Professor Emails by Institution</h2>
        <div className="faculty-directory-filter-bar" role="search">
          <label htmlFor="category-select">Institution Type: </label>
          <select
            id="category-select"
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="filter-dropdown"
            aria-label="Select institution type - IIT or IIM"
          > 
            <option value="IIT">IIT (Indian Institute of Technology)</option>
            <option value="IIM">IIM (Indian Institute of Management)</option>
          </select>
          <label htmlFor="college-select">Select Institution: </label>
          <select
            id="college-select"
            value={college}
            onChange={handleCollegeSelect}
            className="filter-dropdown"
            aria-label="Select specific IIT or IIM institution"
          >
            <option value="">-- Choose {category} --</option>
            {colleges.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="faculty-directory-content">
          {category && !college && (
            <h2 className="professor-directory-info-heading" style={{marginTop: 24, marginBottom: 18, fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.01em'}}>
              Select a college to view all official professor email addresses and use the search to filter by name or academic area.
            </h2>
          )}
          {college && (
            <>
              <div className="iim-directory-controls" style={{marginBottom: 16}}>
                <input
                  type="text"
                  placeholder="Search by Name or Academic Area"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="filter-dropdown"
                  style={{maxWidth: 400, width: '100%'}}
                />
              </div>
            </>
          )}
          {loadingEmails ? (
            <div className="email-list-loading">Loading emails...</div>
          ) : (
            college && (
              <div className="professor-card-list">
                <h3 className="email-list-title">All Professors ({college})</h3>
                <div className="professor-card-grid">
                  {professors
                    .filter(prof => {
                      const name = prof.name || prof.Name || '';
                      const area = prof.academicarea || prof.academicaarea || '';
                      return (
                        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        area.toLowerCase().includes(searchTerm.toLowerCase())
                      );
                    })
                    .map((prof, idx) => {
                      const name = prof.name || prof.Name || 'Unknown Name';
                      const email = prof.email || prof.Email || 'No Email Provided';
                      const academicarea = prof.academicarea || prof.academicaarea || '';
                      return (
                        <div key={idx} className="professor-card">
                          <div className="professor-card-header">
                            <span className="professor-card-number">{idx + 1}.</span>
                            <span className="professor-card-name" title={name}>{name}</span>
                          </div>
                          <span className="department-badge">{academicarea || ""}</span>
                          <div className="professor-card-email-row">
                            <span className="professor-card-email-label">Official Email</span>
                            <a href={`mailto:${email}`} className="professor-card-email">{email}</a>
                            <button
                              className="email-copy-btn"
                              onClick={() => {
                                navigator.clipboard.writeText(email);
                                setCopiedIndex(idx);
                                setTimeout(() => setCopiedIndex(null), 1200);
                              }}
                              title="Copy Email"
                            >
                              <svg height="18" width="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="6" y="6" width="10" height="12" rx="2" stroke="#174ea6" strokeWidth="1.5" fill="#e0f7fa"/>
                                <rect x="2" y="2" width="10" height="12" rx="2" stroke="#90cdf4" strokeWidth="1.2" fill="#fff"/>
                              </svg>
                            </button>
                            {copiedIndex === idx && (
                              <span className="copied-msg">Copied!</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
                {professors.length === 0 && <div className="email-list-empty">No professors/emails found for this college.</div>}
              </div>
            )
          )}
        </div>
      </section>
      
      {/* ========== HOW TO COLD EMAIL - STEP BY STEP ========== */}
      <section className="how-to-section" itemScope itemType="https://schema.org/HowTo" aria-labelledby="cold-email-guide">
        <h2 id="cold-email-guide" itemProp="name">📧 How to Cold Email Professors - Complete Step-by-Step Guide for IIT IIM Internships</h2>
        <meta itemProp="description" content="Proven 6-step strategy to write effective cold emails to IIT and IIM professors for research internships" />
        <p className="steps-instruction">👇 Click on each step below to expand and see detailed instructions</p>
        <div className="steps-container" itemProp="step" itemScope itemType="https://schema.org/HowToSection">
          
          <article className={`step-card ${expandedSteps.includes(1) ? 'expanded' : ''}`} itemProp="step" itemScope itemType="https://schema.org/HowToStep">
            <div className="step-header" onClick={() => toggleStep(1)}>
              <div className="step-number" aria-label="Step 1">1</div>
              <h3 itemProp="name">🌐 Visit College Website</h3>
              <ChevronDown className={`step-chevron ${expandedSteps.includes(1) ? 'rotated' : ''}`} size={20} />
            </div>
            {expandedSteps.includes(1) && (
              <div className="step-content">
                <p itemProp="text">Go to the department page of your target IIT/IIM</p>
                <ul>
                  <li>Navigate to "Faculty" or "People" section</li>
                  <li>Look for professors in your field of interest</li>
                  <li>Example: <code>www.iitb.ac.in → Chemical Engg → Faculty</code></li>
                </ul>
              </div>
            )}
          </article>

          <article className={`step-card ${expandedSteps.includes(2) ? 'expanded' : ''}`} itemProp="step" itemScope itemType="https://schema.org/HowToStep">
            <div className="step-header" onClick={() => toggleStep(2)}>
              <div className="step-number" aria-label="Step 2">2</div>
              <h3 itemProp="name">🔍 Search Professor in Your Domain</h3>
              <ChevronDown className={`step-chevron ${expandedSteps.includes(2) ? 'rotated' : ''}`} size={20} />
            </div>
            {expandedSteps.includes(2) && (
              <div className="step-content">
                <p itemProp="text">Find professors whose research matches your interest</p>
                <ul>
                  <li>Click on professor's profile page</li>
                  <li>Read their bio and current projects</li>
                  <li>Check recent publications (Google Scholar)</li>
                </ul>
              </div>
            )}
          </article>

          <article className={`step-card ${expandedSteps.includes(3) ? 'expanded' : ''}`} itemProp="step" itemScope itemType="https://schema.org/HowToStep">
            <div className="step-header" onClick={() => toggleStep(3)}>
              <div className="step-number" aria-label="Step 3">3</div>
              <h3 itemProp="name">📋 Copy Their Research Interests</h3>
              <ChevronDown className={`step-chevron ${expandedSteps.includes(3) ? 'rotated' : ''}`} size={20} />
            </div>
            {expandedSteps.includes(3) && (
              <div className="step-content">
                <p itemProp="text">Note down specific research topics from their profile</p>
                <ul>
                  <li>Copy 2-3 specific research areas</li>
                  <li>Note recent paper titles (last 2 years)</li>
                  <li>Example: "Nanomaterials for Energy Storage"</li>
                </ul>
              </div>
            )}
          </article>

          <article className={`step-card ${expandedSteps.includes(4) ? 'expanded' : ''}`} itemProp="step" itemScope itemType="https://schema.org/HowToStep">
            <div className="step-header" onClick={() => toggleStep(4)}>
              <div className="step-number" aria-label="Step 4">4</div>
              <h3 itemProp="name">✍️ Personalize Your Email</h3>
              <ChevronDown className={`step-chevron ${expandedSteps.includes(4) ? 'rotated' : ''}`} size={20} />
            </div>
            {expandedSteps.includes(4) && (
              <div className="step-content">
                <p itemProp="text">Customize the email template with their research</p>
                <ul>
                  <li>Mention specific paper/project that interested you</li>
                  <li>Explain why their work fascinates you (2-3 lines)</li>
                  <li>Connect it with your skills/experience</li>
                </ul>
              </div>
            )}
          </article>

          <article className={`step-card ${expandedSteps.includes(5) ? 'expanded' : ''}`} itemProp="step" itemScope itemType="https://schema.org/HowToStep">
            <div className="step-header" onClick={() => toggleStep(5)}>
              <div className="step-number" aria-label="Step 5">5</div>
              <h3 itemProp="name">📎 Attach Tailored Resume</h3>
              <ChevronDown className={`step-chevron ${expandedSteps.includes(5) ? 'rotated' : ''}`} size={20} />
            </div>
            {expandedSteps.includes(5) && (
              <div className="step-content">
                <p itemProp="text">Update resume to highlight relevant skills</p>
                <ul>
                  <li>Add relevant coursework matching their research</li>
                  <li>Highlight projects in similar domain</li>
                  <li>Keep it 1 page, use clean format</li>
                </ul>
              </div>
            )}
          </article>

          <article className={`step-card ${expandedSteps.includes(6) ? 'expanded' : ''}`} itemProp="step" itemScope itemType="https://schema.org/HowToStep">
            <div className="step-header" onClick={() => toggleStep(6)}>
              <div className="step-number" aria-label="Step 6">6</div>
              <h3 itemProp="name">📧 Send Email & Follow Up</h3>
              <ChevronDown className={`step-chevron ${expandedSteps.includes(6) ? 'rotated' : ''}`} size={20} />
            </div>
            {expandedSteps.includes(6) && (
              <div className="step-content">
                <p itemProp="text">Send during working hours, follow up politely</p>
                <ul>
                  <li>Best time: Tuesday-Thursday, 10 AM - 4 PM</li>
                  <li>Subject line: Clear & specific</li>
                  <li>Follow up after 7-10 days if no response</li>
                  <li>Send 50+ emails, expect 2-3 replies</li>
                </ul>
              </div>
            )}
          </article>

        </div>
      </section>


      {/* ========== SKILLS REQUIRED SECTION ========== */}
      <section className="skills-section" aria-labelledby="skills-heading">
        <h2 id="skills-heading">🎯 Skills Required for Internships</h2>
        <p className="skills-subtitle">
          Essential skills that increase your chances of getting selected
        </p>

        <div className="skills-container">
          {/* IIT Skills */}
          <div className="skills-category">
            <div className="category-header iit-header">
              <GraduationCap size={28} />
              <h3>For IIT Research Internships</h3>
            </div>
            <div className="skills-grid">
              {skillsData.IIT.map((item, index) => (
                <div key={index} className="skill-card">
                  <div className="skill-icon">{item.icon}</div>
                  <h4>{item.skill}</h4>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
            <div className="category-footer">
              <p>💡 <strong>Pro Tip:</strong> Mention relevant coursework, projects, or certifications in your email</p>
            </div>
          </div>

          {/* IIM Skills */}
          <div className="skills-category">
            <div className="category-header iim-header">
              <Building2 size={28} />
              <h3>For IIM Management Internships</h3>
            </div>
            <div className="skills-grid">
              {skillsData.IIM.map((item, index) => (
                <div key={index} className="skill-card">
                  <div className="skill-icon">{item.icon}</div>
                  <h4>{item.skill}</h4>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
            <div className="category-footer">
              <p>💡 <strong>Pro Tip:</strong> Highlight consulting club experience, case competitions, and business projects</p>
            </div>
          </div>
        </div>

        {/* Skills Enhancement Tips */}
        <div className="skills-tips">
          <h3>📚 How to Build These Skills?</h3>
          <div className="tips-grid">
            <div className="tip-card">
              <h4>🎓 Online Courses</h4>
              <p>Coursera, edX, NPTEL for technical skills</p>
            </div>
            <div className="tip-card">
              <h4>🏆 Competitions</h4>
              <p>Hackathons, case competitions, research events</p>
            </div>
            <div className="tip-card">
              <h4>🔬 College Projects</h4>
              <p>Work on real-world problems in your domain</p>
            </div>
            <div className="tip-card">
              <h4>👥 Clubs & Teams</h4>
              <p>Join technical/consulting clubs, contribute actively</p>
            </div>
          </div>
        </div>
      </section>
      {/* ========== TESTIMONIALS ========== */}
      <section className="testimonials-section" aria-labelledby="success-stories">
        <h2 id="success-stories">🎓 Success Stories from Real Students</h2>
        <p className="testimonials-subtitle">
          Learn from students who successfully secured research internships at IIT and IIM through cold emailing
        </p>

        <div className="testimonial-slider" role="region" aria-label="Student testimonials carousel">
          {/* Previous Button */}
          <button 
            className="slider-btn"
            onClick={prevTestimonial}
            aria-label="View previous student success story"
            title="Previous testimonial"
          >
            <ChevronLeft size={24} aria-hidden="true" />
          </button>

          {/* ✅ ADD SWIPE HANDLERS HERE */}
          <article 
            className={`testimonial-card-active ${swiped ? 'swiped' : ''}`}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            itemScope 
            itemType="https://schema.org/Review"
            role="article"
            aria-label={`Success story from ${testimonials[currentTestimonial].name}`}
          >
            <div className="testimonial-header">
              <img
                src={testimonials[currentTestimonial].image}
                alt={`${testimonials[currentTestimonial].name} - ${testimonials[currentTestimonial].college} student who got internship at ${testimonials[currentTestimonial].internAt}`}
                className="testimonial-avatar"
                loading="lazy"
                itemProp="image"
              />
              <div className="testimonial-info" itemProp="author" itemScope itemType="https://schema.org/Person">
                <h3 itemProp="name">{testimonials[currentTestimonial].name}</h3>
                <p className="college-tag" itemProp="affiliation">
                  🏛️ {testimonials[currentTestimonial].college}
                </p>
                <p className="branch-tag" itemProp="jobTitle">
                  {testimonials[currentTestimonial].branch}
                </p>
                <span className="intern-badge">
                  <GraduationCap size={14} aria-hidden="true" />
                  Interned at {testimonials[currentTestimonial].internAt}
                </span>
              </div>
            </div>

            <div className="testimonial-content">
              <Quote className="quote-icon" size={40} aria-hidden="true" />
              <p className="review-text" itemProp="reviewBody">
                {testimonials[currentTestimonial].review}
              </p>
              <meta itemProp="reviewRating" itemScope itemType="https://schema.org/Rating" content="5" />
              
              <div className="tips-box">
                <h4>
                  💡 Pro Tip:
                </h4>
                <p>{testimonials[currentTestimonial].tips}</p>
              </div>
            </div>
          </article>

          {/* Next Button */}
          <button 
            className="slider-btn"
            onClick={nextTestimonial}
            aria-label="View next student success story"
            title="Next testimonial"
          >
            <ChevronRight size={24} aria-hidden="true" />
          </button>
        </div>

        {/* Dots Navigation */}
        <div className="slider-dots" role="tablist" aria-label="Testimonial navigation">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentTestimonial ? 'active' : ''}`}
              onClick={() => setCurrentTestimonial(index)}
              aria-label={`View testimonial ${index + 1} of ${testimonials.length}`}
              aria-current={index === currentTestimonial ? 'true' : 'false'}
              role="tab"
            />
          ))}
        </div>
      </section>

      {/* ========== EXAMPLE SECTION ========== */}
      <section className="example-section" aria-labelledby="email-examples">
        <div className="example-box">
          <h2 id="email-examples">💡 Email Personalization: Good vs Bad Examples</h2>
          <div className="example-content">
            <article className="bad-example">
              <span className="badge bad" aria-label="Bad example">❌ Generic</span>
              <p>"I am interested in doing an internship in your lab."</p>
            </article>
            <article className="good-example">
              <span className="badge good" aria-label="Good example">✅ Personalized</span>
              <p>"I read your recent publication on 'Graphene-based sensors for biomedical applications' in Nature Materials (2024). Your approach to functionalizing graphene sheets particularly intrigued me, as I have worked on similar nanomaterial synthesis in my recent project on carbon nanotubes."</p>
            </article>
          </div>
        </div>
      </section>
    </article>
    </>
  );
};

export default InternshipPage;