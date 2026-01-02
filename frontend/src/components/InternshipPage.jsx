import React, { useState, useContext, useEffect } from 'react';
import { Download, Mail, ExternalLink, Search, Filter, Building2, GraduationCap, ChevronLeft, ChevronRight, Quote, Lock } from 'lucide-react';
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

  // ========== IIT & IIM FACULTY DATA =========
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

  // ✅ ADD LOADING CHECK BEFORE RETURN
  if (loading) {
    return <LoadingSpinner fullScreen={true} message="Loading Internship Portal..." />;
  }

  return (
    <div className="internship-page">
      {/* ✅ SEO FOR INTERNSHIP PAGE */}
      <SEO 
        title="Research Internship Portal | IIT & IIM Faculty Directory"
        description="Find research internship opportunities at IITs & IIMs. Access faculty contacts, email templates, and step-by-step cold emailing guide. Get internship at top institutions."
        keywords="IIT internship, IIM internship, research internship India, cold email professor, faculty directory IIT, summer internship IIT, winter internship IIM, VNIT internship guide"
        url="https://atyant.in/internships"
      />

      {/* ========== HERO SECTION ========== */}
      <div className="internship-hero">
        <div className="hero-content">
          <GraduationCap size={64} className="hero-icon" />
          <h1>Research Internship Portal</h1>
          <p>Connect with faculty at IITs & IIMs - Focus on Core & Non-Core Branches</p>
          
          {/* ✅ Use user from context */}
          {isLoggedIn && user && (
            <div style={{ 
              marginBottom: '16px', 
              color: '#4ade80', 
              fontSize: '1rem',
              fontWeight: '600' 
            }}>
              ✅ Welcome {user.name}!
            </div>
          )}
          
          {/* Download Button */}
          <button 
            onClick={handleDownloadTemplate}
            className={`download-template-btn ${!isLoggedIn ? 'locked' : ''}`}
          >
            {isLoggedIn ? <Download size={20} /> : <Lock size={20} />}
            <span>{isLoggedIn ? 'Download Email Template' : 'Login to Download Template'}</span>
          </button>

          {!isLoggedIn && (
            <p style={{ marginTop: '12px', color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem' }}>
              🔒 Login required to download template and access faculty links
            </p>
          )}
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
                  onClick={(e) => handleProtectedLink(data.url, e)}
                  className={`view-all-btn ${!isLoggedIn ? 'locked' : ''}`}
                >
                  {isLoggedIn ? 'View All Faculty' : 'Login to View'}
                  {isLoggedIn ? <ExternalLink size={16} /> : <Lock size={16} />}
                </a>
              </div>

              <div className="departments-list">
                <h4>Departments:</h4>
                {Object.entries(data.departments).map(([dept, url]) => (
                  <a
                    key={dept}
                    href={url}
                    onClick={(e) => handleProtectedLink(url, e)}
                    className={`department-link ${!isLoggedIn ? 'locked' : ''}`}
                  >
                    <span>{dept}</span>
                    {isLoggedIn ? <ExternalLink size={14} /> : <Lock size={14} />}
                  </a>
                ))}
              </div>

              <div className="card-footer">
                <Mail size={16} />
                <span>{isLoggedIn ? 'Use email template to reach out' : 'Login to access links'}</span>
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

      {/* ========== TESTIMONIALS ========== */}
      <div className="testimonials-section">
        <h2>🎓 Success Stories from Real Students</h2>
        <p className="testimonials-subtitle">
          Learn from students who successfully secured internships at top institutions
        </p>

        <div className="testimonial-slider">
          {/* Previous Button */}
          <button 
            className="slider-btn"
            onClick={prevTestimonial}
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={24} />
          </button>

          {/* ✅ ADD SWIPE HANDLERS HERE */}
          <div 
            className={`testimonial-card-active ${swiped ? 'swiped' : ''}`}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="testimonial-header">
              <img
                src={testimonials[currentTestimonial].image}
                alt={testimonials[currentTestimonial].name}
                className="testimonial-avatar"
              />
              <div className="testimonial-info">
                <h3>{testimonials[currentTestimonial].name}</h3>
                <p className="college-tag">
                  {testimonials[currentTestimonial].college}
                </p>
                <p className="branch-tag">
                  {testimonials[currentTestimonial].branch}
                </p>
                <span className="intern-badge">
                  <GraduationCap size={14} />
                  Interned at {testimonials[currentTestimonial].internAt}
                </span>
              </div>
            </div>

            <div className="testimonial-content">
              <Quote className="quote-icon" size={40} />
              <p className="review-text">
                {testimonials[currentTestimonial].review}
              </p>
              
              <div className="tips-box">
                <h4>
                  💡 Pro Tip:
                </h4>
                <p>{testimonials[currentTestimonial].tips}</p>
              </div>
            </div>
          </div>

          {/* Next Button */}
          <button 
            className="slider-btn"
            onClick={nextTestimonial}
            aria-label="Next testimonial"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Dots Navigation */}
        <div className="slider-dots">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentTestimonial ? 'active' : ''}`}
              onClick={() => setCurrentTestimonial(index)}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ========== SKILLS REQUIRED SECTION ========== */}
      <div className="skills-section">
        <h2>🎯 Skills Required for Internships</h2>
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
      </div>

      {/* ========== EXAMPLE SECTION ========== */}
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