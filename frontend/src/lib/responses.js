export const MOCK_RESPONSES = {
  iim: {
    context: "VNIT Metallurgy → IIM · 3 paths found",
    analysis: "Many metallurgical engineering students from Tier-2 NITs successfully pivot to top Indian IIMs. Typically, scoring 99.2+ percentile in CAT and showing diverse extracurriculars bridges the gap. The data suggests that placing focus on specific quantitative skills heavily boosts chances.",
    callout: { label: "// Verified · VNIT → IIM Calcutta · 2024", quote: "I thought my branch would hold me back, but standardizing my CAT prep process allowed me to break through." },
    mentors: [
      { initials: "RK", name: "Rohan K.", role: "MBA Intern · IIM Calcutta", matchScore: 94, tags: ["VNIT", "IIMC"], isTopMatch: true },
      { initials: "PS", name: "Priya S.", role: "Consultant · MBB", matchScore: 88, tags: ["NIT", "IIMA"], isTopMatch: false },
      { initials: "AJ", name: "Amit J.", role: "Product Manager", matchScore: 82, tags: ["Core", "MBA"], isTopMatch: false }
    ],
    followUps: ["How did they balance college exams and CAT?", "What extracurriculars matter most?", "Which CAT sections are hardest?"]
  },
  tier3: {
    context: "Tier-3 → Product Company · 4 paths found",
    analysis: "Transitioning from a Tier-3 college to a product company usually requires strong competitive programming skills or open-source contributions. Startups and mid-tier product companies focus on your GitHub and real-world projects over college pedigree.",
    callout: { label: "// Verified · LPU → Amazon · 2023", quote: "I didn't have the IIT tag, so I let my Leetcode rating and 3 strong side projects speak for me." },
    mentors: [
      { initials: "NA", name: "Neha A.", role: "SDE-1 · Amazon", matchScore: 95, tags: ["Tier-3", "SDE"], isTopMatch: true },
      { initials: "VK", name: "Varun K.", role: "Frontend Dev · Swiggy", matchScore: 89, tags: ["Open Source", "React"], isTopMatch: false },
      { initials: "SM", name: "Sneha M.", role: "Backend Eng · Razorpay", matchScore: 84, tags: ["Node.js", "System Design"], isTopMatch: false }
    ],
    followUps: ["Should I focus on CP or Web Dev?", "How to get referrals?", "What projects stand out?"]
  },
  ml: {
    context: "Mechanical → AI/ML · 2 paths found",
    analysis: "Moving from Mechanical to AI/ML requires a strong mathematical foundation (which you have) combined with Python programming skills. Self-taught projects in computer vision or NLP, often done via minor projects or online masters, are common springboards.",
    callout: { label: "// Verified · NIT Trichy → Applied Scientist · 2022", quote: "I used my mech coursework to build physics-informed neural networks to stand out." },
    mentors: [
      { initials: "DP", name: "Deepak P.", role: "ML Engineer · Microsoft", matchScore: 92, tags: ["Mech", "PyTorch"], isTopMatch: true },
      { initials: "KR", name: "Kritika R.", role: "Data Scientist · Fractal", matchScore: 87, tags: ["Data Science", "Python"], isTopMatch: false },
      { initials: "AR", name: "Aryan R.", role: "AI Researcher", matchScore: 81, tags: ["Computer Vision"], isTopMatch: false }
    ],
    followUps: ["What math is needed for ML?", "Are certifications worth it?", "How to build an ML portfolio?"]
  },
  research: {
    context: "Tier-2 → Research Internship · 5 paths found",
    analysis: "Securing a research internship at an IIT or IISc requires cold-emailing professors directly with a strong statement of purpose. Highlight relevant coursework and any small standalone research projects you've already done.",
    callout: { label: "// Verified · Manipal → IISc Summer Fellow · 2023", quote: "I read the professor's recent papers and proposed a small extension to their work in my email." },
    mentors: [
      { initials: "SV", name: "Siddharth V.", role: "PhD Scholar · IISc", matchScore: 96, tags: ["Research", "IISc"], isTopMatch: true },
      { initials: "MN", name: "Meera N.", role: "Research Asst · IIT Bombay", matchScore: 90, tags: ["IIT", "Fellowship"], isTopMatch: false },
      { initials: "KS", name: "Karan S.", role: "MTech · IIT Delhi", matchScore: 85, tags: ["Gate", "MTech"], isTopMatch: false }
    ],
    followUps: ["How to write a cold email?", "When do applications open?", "Do grades matter for research?"]
  },
  linkedin: {
    context: "Student → Personal Brand · 3 paths found",
    analysis: "Building a LinkedIn presence as a 2nd year student should focus on documenting your learning journey. Instead of acting like an expert, share your daily struggles, projects, and insights. Consistency attracts recruiters over time.",
    callout: { label: "// Verified · SRMAP → 100k Followers · 2024", quote: "I just posted my daily Leetcode solutions and errors. It eventually led to an internship offer." },
    mentors: [
      { initials: "RG", name: "Rahul G.", role: "DevRel · Vercel", matchScore: 93, tags: ["DevRel", "Community"], isTopMatch: true },
      { initials: "SS", name: "Simran S.", role: "Content Creator", matchScore: 88, tags: ["LinkedIn", "Brand"], isTopMatch: false },
      { initials: "AK", name: "Ankit K.", role: "SDE Intern · Zepto", matchScore: 83, tags: ["Networking"], isTopMatch: false }
    ],
    followUps: ["What should I post about?", "How to connect with seniors?", "How often should I post?"]
  },
  placement: {
    context: "Campus Placement Prep · 4 paths found",
    analysis: "Campus placements at NITs and IITs follow a predictable pattern. Companies shortlist based on CGPA cutoffs (usually 7.0+), then test DSA, then conduct HR rounds. Starting DSA prep 6 months before placement season and doing 200+ Leetcode problems is the standard playbook.",
    callout: { label: "// Verified · VNIT CSE → Microsoft · 2024", quote: "I cracked Microsoft with 7.2 CGPA. The key was 300 Leetcode problems and 2 strong internship projects." },
    mentors: [
      { initials: "AV", name: "Arjun V.", role: "SDE · Microsoft", matchScore: 96, tags: ["VNIT", "DSA"], isTopMatch: true },
      { initials: "RB", name: "Riya B.", role: "SDE-2 · Google", matchScore: 91, tags: ["Competitive", "CP"], isTopMatch: false },
      { initials: "SK", name: "Saurabh K.", role: "Backend · Flipkart", matchScore: 86, tags: ["System Design"], isTopMatch: false }
    ],
    followUps: ["Which companies visit NIT campuses?", "How to prepare for HR rounds?", "What CGPA is needed for top companies?"]
  },
  internship: {
    context: "Internship Hunt · 6 paths found",
    analysis: "Getting your first internship as a 2nd or 3rd year student requires a combination of a clean resume, 2-3 solid projects, and active outreach. Off-campus internships via LinkedIn and AngelList often have less competition than on-campus drives.",
    callout: { label: "// Verified · MANIT → Razorpay Intern · 2023", quote: "I applied to 80 companies off-campus. Got 3 interviews, 1 offer. The numbers game is real." },
    mentors: [
      { initials: "PK", name: "Priya K.", role: "Product Intern · Razorpay", matchScore: 93, tags: ["Off-campus", "Product"], isTopMatch: true },
      { initials: "MS", name: "Mohit S.", role: "SWE Intern · Atlassian", matchScore: 88, tags: ["LinkedIn", "Outreach"], isTopMatch: false },
      { initials: "TG", name: "Tanvi G.", role: "Data Intern · Meesho", matchScore: 83, tags: ["Data", "Analytics"], isTopMatch: false }
    ],
    followUps: ["How to write a cold DM on LinkedIn?", "What projects should I build?", "When should I start applying?"]
  },
  default: {
    context: "Career Query · Paths found",
    analysis: "Your background offers multiple interesting pivot points. By leveraging your core analytical skills and focusing on specialized upskilling in your target domain, you can position yourself uniquely. The mentors below have navigated similar broad transitions successfully.",
    callout: { label: "// Verified · Student Journey", quote: "Focusing on my transferable skills rather than my exact degree was the turning point in my career." },
    mentors: [
      { initials: "AM", name: "Aditya M.", role: "Strategy · Startup", matchScore: 91, tags: ["Pivot", "Strategy"], isTopMatch: true },
      { initials: "PR", name: "Pooja R.", role: "Analyst · Deloitte", matchScore: 85, tags: ["Consulting"], isTopMatch: false },
      { initials: "VS", name: "Vikram S.", role: "Founder", matchScore: 80, tags: ["Entrepreneurship"], isTopMatch: false }
    ],
    followUps: ["What are transferable skills?", "How to identify my strengths?", "Should I do a master's?"]
  }
};

export const detectIntent = (query) => {
  const q = query.toLowerCase();
  if (q.includes('iim') || q.includes('mba') || q.includes('cat') || q.includes('pgdm')) return 'iim';
  if (q.match(/tier-3|tier 3|product company/)) return 'tier3';
  if (q.match(/\bml\b|ai\b|machine learning|mechanical|mech/)) return 'ml';
  if (q.match(/research|iit|iisc|prof/)) return 'research';
  if (q.includes('linkedin') || q.includes('personal brand')) return 'linkedin';
  if (q.match(/placement|campus|recruit|interview/)) return 'placement';
  if (q.match(/internship|intern|off.campus/)) return 'internship';
  return 'default';
};
