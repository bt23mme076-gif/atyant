import { useEffect, useMemo, useState } from "react";
import { API_URL } from '../services/api.js';
import { useNavigate } from "react-router-dom";
import MentorRecommendationBlock from "./MentorRecommendationBlock";
import "./career-guides.css";
import EnvelopeSection from "./EnvelopeSection";

const trackMentorKeywords = {
  analytics: [
    "analytics",
    "data",
    "sql",
    "power bi",
    "tableau",
    "dashboard",
    "business analyst",
    "eda",
    "statistics",
  ],
  "cse-internship": [
    "intern",
    "sde",
    "software",
    "dsa",
    "react",
    "node",
    "backend",
    "frontend",
    "development",
  ],
  "cse-placement": [
    "placement",
    "sde",
    "software engineer",
    "dsa",
    "system design",
    "oop",
    "dbms",
    "interview",
  ],
  product: [
    "product",
    "pm",
    "strategy",
    "growth",
    "product analyst",
    "metrics",
    "figma",
    "case study",
  ],
  aiml: [
    "ai",
    "ml",
    "machine learning",
    "deep learning",
    "python",
    "tensorflow",
    "pytorch",
    "nlp",
  ],
};

const toSearchText = (mentor) => {
  const values = [
    mentor.name,
    mentor.username,
    mentor.bio,
    ...(mentor.expertise || []),
    ...(mentor.skills || []),
  ];

  return values
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

const getMentorScore = (mentor, keywords) => {
  const text = toSearchText(mentor);
  return keywords.reduce((score, keyword) => {
    if (text.includes(keyword.toLowerCase())) {
      return score + 1;
    }
    return score;
  }, 0);
};

const getMentorName = (mentor) => mentor.name || mentor.username || "Atyant Mentor";

const normalizeMentorForCard = (mentor, score) => ({
  ...mentor,
  name: getMentorName(mentor),
  avatar: mentor.profilePicture || mentor.profileImage || "",
  tag: score >= 3 ? "Solved this" : "Done this before",
});

const tracks = [
  {
    id: "analytics",
    badge: "Data & Business Analytics",
    title: "Data & Business Analytics Placement Guide",
    subtitle:
      "Everything students need to move from learning analytics basics to securing their first off-campus analyst role.",
    reality: [
      { value: "50–300", label: "Applications before first offer" },
      { value: "3–4", label: "Strong projects expected" },
      { value: "#1", label: "Skill tested most often: SQL" },
    ],
    highlight:
      "Companies shortlist analysts based on SQL, projects, dashboards, and business problem-solving ability.",
    skills: [
      "Python with Pandas, NumPy, Matplotlib, Seaborn",
      "SQL: joins, window functions, subqueries, aggregations, group by",
      "Data visualization with Power BI, Tableau, Excel",
      "Statistics: probability, hypothesis testing, regression, correlation",
      "Portfolio building on GitHub, Tableau Public, LinkedIn",
    ],
    roadmap: [
      "Build 3–4 strong projects that solve visible business problems",
      "Create a public portfolio with problem, dataset, insights, and recommendations",
      "Optimize resume with ATS-friendly keywords like SQL, Python, Power BI, Dashboard, EDA",
      "Network on LinkedIn and ask for guidance instead of directly asking for jobs",
      "Apply consistently on LinkedIn, Naukri, Indeed, Wellfound, and Hirist",
    ],
    applyWhere: [
      "LinkedIn Jobs",
      "Naukri",
      "Indeed",
      "Hirist",
      "Wellfound",
      "YC Startup Jobs",
      "CutShort",
      "Apna",
      "Naukri Campus",
      "WorkIndia",
      "JobHai",
    ],
    companies: [
      "Deloitte",
      "EY",
      "KPMG",
      "PwC",
      "ZS Associates",
      "Fractal Analytics",
      "Mu Sigma",
      "Tiger Analytics",
      "LatentView Analytics",
      "Amazon",
      "Flipkart",
    ],
    projects: [
      "Sales Data Analysis Dashboard",
      "Customer Churn Prediction",
      "Marketing Campaign Performance Analysis",
      "Business KPI Dashboard",
      "HR Attrition Analysis",
      "Uber Trip Data Analysis",
    ],
    resources: [
      { name: "CampusX Data Science Playlist", url: "https://www.youtube.com/playlist?list=PLvcxya_kQ6n3DKNEe3VEYa1F_5Pd8Ty3v" },
      { name: "SQLBolt", url: "https://sqlbolt.com/" },
      { name: "StrataScratch", url: "https://www.stratascratch.com/" },
      { name: "Kaggle Datasets", url: "https://www.kaggle.com/datasets" },
      { name: "Tableau Public Gallery", url: "https://public.tableau.com/en-us/gallery/" },
    ],
  },
  {
    id: "cse-internship",
    badge: "CSE Internship",
    title: "CSE Off-Campus Internship Guide",
    subtitle:
      "A practical roadmap for Tier-2 and Tier-3 engineering students trying to secure their first software internship.",
    reality: [
      { value: "150–300", label: "Applications before internship" },
      { value: "150–300", label: "DSA problems many students solve" },
      { value: "1–2", label: "Good projects often enough to shortlist" },
    ],
    highlight:
      "For off-campus internships, coding skills, projects, and problem-solving matter more than college brand.",
    skills: [
      "DSA: arrays, strings, linked lists, stacks, queues, trees, hashing, heaps",
      "Development: HTML, CSS, JavaScript, React, Node.js, Express, Django",
      "REST APIs, authentication, CRUD flows",
      "CS fundamentals: DBMS, OS, Computer Networks, OOP",
      "GitHub + deployed project proof",
    ],
    roadmap: [
      "Choose one language: C++, Java, or Python",
      "Build 1–2 strong projects with proper structure and real functionality",
      "Create a one-page resume with GitHub, LinkedIn, and coding profiles",
      "Apply and network for roles like SDE Intern, Software Engineer Intern, Backend Intern",
      "Practice DSA regularly and use projects to show execution ability",
    ],
    applyWhere: [
      "LinkedIn Jobs",
      "Cuvette",
      "Instahyre",
      "Wellfound",
      "Internshala",
      "Unstop",
      "Indeed",
      "Apna",
      "Naukri Campus",
      "WorkIndia",
      "JobHai",
      "CutShort",
      "YC Startup Jobs",
    ],
    companies: [
      "Startups on Wellfound",
      "YC-backed startups",
      "Remote internship listings",
      "Challenge-based hiring companies",
    ],
    projects: [
      "Task Manager App",
      "Chat Application",
      "E-commerce Website",
      "Notes App with Authentication",
      "Blog Platform",
    ],
    resources: [
      { name: "Striver DSA", url: "https://www.youtube.com/c/takeUforward" },
      { name: "LeetCode", url: "https://leetcode.com/" },
      { name: "GeeksforGeeks Practice", url: "https://practice.geeksforgeeks.org/" },
      { name: "FreeCodeCamp", url: "https://www.youtube.com/c/Freecodecamp" },
      { name: "GateSmashers", url: "https://www.youtube.com/c/GateSmashers" },
    ],
  },
  {
    id: "cse-placement",
    badge: "CSE Placement",
    title: "CSE Off-Campus Placement Guide",
    subtitle:
      "A full roadmap for students preparing for software development roles beyond internships.",
    reality: [
      { value: "200–500", label: "Applications before SDE offer" },
      { value: "200–400", label: "DSA problems many candidates solve" },
      { value: "2–3", label: "Strong projects to get shortlisted" },
    ],
    highlight:
      "Off-campus SDE hiring rewards consistency, strong projects, coding ability, and clarity in interviews.",
    skills: [
      "Advanced DSA for OA and interviews",
      "Backend + frontend development proof",
      "DBMS, OS, OOP, CN fundamentals",
      "System design basics",
      "Resume + GitHub positioning",
    ],
    roadmap: [
      "Pick one programming language and stick with it",
      "Build 2–3 meaningful projects with clean implementation",
      "Create a concise resume with links and project impact",
      "Apply through job boards, referrals, and coding challenges",
      "Prepare for OA, technical rounds, and HR rounds in parallel",
    ],
    applyWhere: [
      "LinkedIn Jobs",
      "Instahyre",
      "Wellfound",
      "Hirist",
      "Naukri",
      "Indeed",
      "CutShort",
      "Apna",
      "Naukri Campus",
      "WorkIndia",
      "JobHai",
      "Flipkart GRiD",
      "Google Kickstart",
      "Amazon ML Challenge",
      "TCS CodeVita",
    ],
    companies: [
      "Product startups",
      "Growth-stage startups",
      "Tech hiring challenge companies",
      "Mid-size engineering teams",
    ],
    projects: [
      "Task Manager Application",
      "Chat Application",
      "Blog Platform",
      "E-commerce Backend",
      "Notes App with Authentication",
    ],
    resources: [
      { name: "Love Babbar", url: "https://www.youtube.com/watch?v=WQoB2z67hvY&list=PLDzeHZWIZsTryvtXdMr6rPh4IDexB5NIA" },
      { name: "Codeforces", url: "https://codeforces.com/" },
      { name: "HackerRank", url: "https://www.hackerrank.com/" },
      { name: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer" },
      { name: "Build Your Own X", url: "https://github.com/codecrafters-io/build-your-own-x" },
    ],
  },
  {
    id: "product",
    badge: "Product & Strategy",
    title: "Product & Strategy Roles Guide",
    subtitle:
      "A clean entry path for students exploring PM, product analytics, and growth or strategy roles.",
    reality: [
      { value: "80–200", label: "Applications before product internship" },
      { value: "1–2", label: "Good case studies can get shortlisting" },
      { value: "#1", label: "Most important skill: product thinking" },
    ],
    highlight:
      "Product roles reward user understanding, structured thinking, case studies, and execution proof.",
    skills: [
      "Product thinking and user problem discovery",
      "Product metrics: retention, conversion, DAU, MAU",
      "Basic SQL and analytics",
      "Wireframing, user flows, and Figma basics",
      "Jira, Notion, Trello collaboration workflow",
    ],
    roadmap: [
      "Study how strong products solve user problems",
      "Write product case studies and publish them",
      "Build a small product or feature idea",
      "Create a resume with projects and case studies",
      "Apply for Product Intern, APM, Product Analyst, and Strategy Intern roles",
    ],
    applyWhere: [
      "LinkedIn Jobs",
      "Wellfound",
      "Instahyre",
      "CutShort",
      "Internshala",
      "Unstop",
      "Indeed",
      "YC Startup Jobs",
    ],
    companies: [
      "Razorpay",
      "Swiggy",
      "Zomato",
      "Meesho",
      "Flipkart",
      "PhonePe",
      "CRED",
      "Early-stage startups",
    ],
    projects: [
      "Swiggy user flow teardown",
      "Instagram feature improvement case",
      "Notion strategy analysis",
      "Simple productivity tool",
      "Student community platform",
    ],
    resources: [
      { name: "Product School", url: "https://www.youtube.com/c/ProductSchool" },
      { name: "Y Combinator", url: "https://www.youtube.com/c/YCombinator" },
      { name: "Product Alliance", url: "https://www.youtube.com/c/ProductAlliance" },
      { name: "Exponent PM", url: "https://www.tryexponent.com/" },
      { name: "PM Exercises", url: "https://www.pmexercises.com/" },
    ],
  },
  {
    id: "aiml",
    badge: "AI / Machine Learning",
    title: "AI / Machine Learning Career Guide",
    subtitle:
      "A practical path for students targeting ML internships, AI engineering roles, and early data science opportunities.",
    reality: [
      { value: "100–300", label: "Applications before AI/ML internship" },
      { value: "2–4", label: "Strong ML projects usually needed" },
      { value: "#1", label: "Most important foundation: Python + ML basics" },
    ],
    highlight:
      "Recruiters usually value real projects, Kaggle work, clean documentation, and strong fundamentals over certificates.",
    skills: [
      "Python for ML",
      "Math: linear algebra, probability, statistics, calculus basics",
      "ML algorithms: regression, trees, clustering, classification",
      "Deep learning: neural networks, CNNs, transformers basics",
      "Libraries: NumPy, Pandas, Scikit-learn, TensorFlow, PyTorch",
    ],
    roadmap: [
      "Learn Python, NumPy, and Pandas",
      "Cover statistics and probability",
      "Study core ML algorithms and workflows",
      "Build 2–4 ML projects with clear documentation",
      "Participate in Kaggle and start applying",
    ],
    applyWhere: [
      "LinkedIn Jobs",
      "Instahyre",
      "Wellfound",
      "Hirist",
      "Internshala",
      "Unstop",
      "Indeed",
      "YC Startup Jobs",
    ],
    companies: [
      "Google",
      "Microsoft",
      "Amazon",
      "Flipkart",
      "Swiggy",
      "Meesho",
      "Razorpay",
      "AI startups",
    ],
    projects: [
      "Spam Email Classifier",
      "Movie Recommendation System",
      "Customer Churn Prediction",
      "Image Classification Model",
      "Fake News Detection",
      "Stock Price Prediction",
    ],
    resources: [
      { name: "CampusX", url: "https://www.youtube.com/c/CampusX" },
      { name: "StatQuest", url: "https://www.youtube.com/c/joshstarmer" },
      { name: "Andrew Ng ML Course", url: "https://www.coursera.org/learn/machine-learning" },
      { name: "Scikit-learn", url: "https://scikit-learn.org/" },
      { name: "Kaggle Learn", url: "https://www.kaggle.com/learn" },
    ],
  },
];

const quickSupport = [
  "Resume reviews",
  "Mock interview guidance",
  "Referral insights",
  "Portfolio feedback",
  "Roadmap clarity",
  "Conversations with seniors who recently cracked internships and placements",
];

export default function CareerGuidesPage() {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/mentors`);
        if (!res.ok) {
          return;
        }
        const data = await res.json();
        setMentors(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load mentor recommendations:", error);
      }
    };

    fetchMentors();
  }, []);

  const mentorRecommendations = useMemo(() => {
    if (!mentors.length) {
      return {};
    }

    return tracks.reduce((result, track) => {
      const keywords = trackMentorKeywords[track.id] || [];
      const scored = mentors
        .map((mentor) => ({
          mentor,
          score: getMentorScore(mentor, keywords),
        }))
        .sort((a, b) => b.score - a.score);

      const bestMatch = scored[0];
      if (!bestMatch || !bestMatch.mentor) {
        result[track.id] = null;
        return result;
      }

      result[track.id] = normalizeMentorForCard(bestMatch.mentor, bestMatch.score);
      return result;
    }, {});
  }, [mentors]);

  const handleLearnFromMentor = (mentor) => {
    if (mentor?.username) {
      navigate(`/profile/${encodeURIComponent(mentor.username)}`);
      return;
    }
    navigate("/mentors");
  };

  const handleAskMentor = (mentor) => {
    if (mentor?._id) {
      navigate(`/chat/${mentor._id}`);
      return;
    }
    navigate("/chat");
  };

  return (
    <div className="career-page">
      <section className="career-hero">
        <div className="container">
          <div className="hero-badge">ATYANT • Career Playbook</div>
          <h1>
            From confusion to <span>clarity</span> to career opportunities
          </h1>
          <p className="hero-copy">
            A single premium page for Tier-2 and Tier-3 engineering students to
            explore the most practical paths into analytics, software,
            product, and AI/ML roles.
          </p>

          <div className="hero-actions">
            <a href="#tracks" className="primary-btn">Explore Career Tracks</a>
            <a href="#atyant-help" className="secondary-btn">Get Practical Guidance</a>
          </div>

          <div className="hero-stats">
            <div className="hero-stat-card">
              <h3>5</h3>
              <p>Career tracks in one place</p>
            </div>
            <div className="hero-stat-card">
              <h3>Step-by-step</h3>
              <p>Roadmaps, projects, resources, interviews</p>
            </div>
            <div className="hero-stat-card">
              <h3>Built for</h3>
              <p>Tier-2 & Tier-3 engineering students</p>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky-nav-wrap">
        <div className="container">
          <div className="sticky-nav" id="tracks">
            {tracks.map((track) => (
              <a key={track.id} href={`#${track.id}`} className="track-pill">
                {track.badge}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="section-kicker">Why this page</span>
            <h2>One page. Clear tracks. Better decisions.</h2>
            <p>
              Students usually waste time because all advice is scattered. This
              page brings the roadmap, skills, platforms, projects, and next
              actions into one clean experience.
            </p>
          </div>

          <div className="overview-grid">
            <div className="overview-card">
              <h3>Choose faster</h3>
              <p>
                Compare analytics, CSE, product, and AI/ML in one scroll
                instead of switching between random resources.
              </p>
            </div>
            <div className="overview-card">
              <h3>Prepare smarter</h3>
              <p>
                Focus on skills that actually get tested, not endless theory or
                passive course watching.
              </p>
            </div>
            <div className="overview-card">
              <h3>Apply better</h3>
              <p>
                Use projects, proof of work, and targeted applications to improve
                your chances.
              </p>
            </div>
          </div>
        </div>
      </section>

      {tracks.map((track, index) => (
        <section className={`section track-section ${index % 2 === 0 ? "alt" : ""}`} id={track.id} key={track.id}>
          <div className="container">
            <div className="track-header">
              <div>
                <span className="section-kicker">{track.badge}</span>
                <h2>{track.title}</h2>
                <p>{track.subtitle}</p>
              </div>
              <div className="track-highlight">
                <span>Reality Check</span>
                <p>{track.highlight}</p>
              </div>
            </div>

            <div className="stats-grid">
              {track.reality.map((item) => (
                <div className="stat-card" key={item.label}>
                  <h3>{item.value}</h3>
                  <p>{item.label}</p>
                </div>
              ))}
            </div>

            <div className="content-grid">
              <EnvelopeSection
                title="Skills recruiters expect"
                preview={
                  <ul>
                    {track.skills.slice(0, 2).map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                }
              >
                <ul>
                  {track.skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </EnvelopeSection>

              <EnvelopeSection
                title="Simple roadmap"
                preview={
                  <ol>
                    {track.roadmap.slice(0, 2).map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                }
              >
                <ol>
                  {track.roadmap.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </EnvelopeSection>
            </div>

            <div className="content-grid">
              <EnvelopeSection
                title="Where to apply"
                preview={
                  <div className="chip-grid">
                    {track.applyWhere.slice(0, 3).map((item) => (
                      <span key={item} className="chip">{item}</span>
                    ))}
                  </div>
                }
              >
                <div className="chip-grid">
                  {track.applyWhere.map((item) => (
                    <span key={item} className="chip">{item}</span>
                  ))}
                </div>
              </EnvelopeSection>

              <EnvelopeSection
                title="Project ideas"
                preview={
                  <div className="chip-grid">
                    {track.projects.slice(0, 2).map((project) => (
                      <span key={project} className="chip subtle">{project}</span>
                    ))}
                  </div>
                }
              >
                <div className="chip-grid">
                  {track.projects.map((project) => (
                    <span key={project} className="chip subtle">{project}</span>
                  ))}
                </div>
              </EnvelopeSection>
            </div>

            <div className="content-grid">
              <EnvelopeSection
                title="Target companies"
                preview={
                  <div className="chip-grid">
                    {track.companies.slice(0, 3).map((company) => (
                      <span key={company} className="chip company">{company}</span>
                    ))}
                  </div>
                }
              >
                <div className="chip-grid">
                  {track.companies.map((company) => (
                    <span key={company} className="chip company">{company}</span>
                  ))}
                </div>
              </EnvelopeSection>

              <EnvelopeSection
                title="Best resources"
                preview={
                  <div className="resource-list">
                    {track.resources.slice(0, 1).map((resource) => (
                      <a
                        key={resource.name}
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="resource-item"
                      >
                        <span>{resource.name}</span>
                        <span>↗</span>
                      </a>
                    ))}
                  </div>
                }
              >
                <div className="resource-list">
                  {track.resources.map((resource) => (
                    <a
                      key={resource.name}
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="resource-item"
                    >
                      <span>{resource.name}</span>
                      <span>↗</span>
                    </a>
                  ))}
                </div>
              </EnvelopeSection>
            </div>

            <div className="mentor-recommend-wrap">
              <MentorRecommendationBlock
                mentor={mentorRecommendations[track.id]}
                topicLabel={track.badge}
                onLearn={() => handleLearnFromMentor(mentorRecommendations[track.id])}
                onAsk={() => handleAskMentor(mentorRecommendations[track.id])}
              />
            </div>
          </div>
        </section>
      ))}

      <section className="section interview-band">
        <div className="container">
          <div className="section-head center">
            <span className="section-kicker">Hiring process</span>
            <h2>What most students will face in interviews</h2>
            <p>
              The exact flow changes by role, but most off-campus hiring still
              follows a predictable pattern.
            </p>
          </div>

          <div className="process-grid">
            <div className="process-card">
              <div className="process-number">01</div>
              <h3>Online test</h3>
              <p>
                DSA for software roles, SQL for analytics, and Python or ML basics
                for AI-focused roles.
              </p>
            </div>
            <div className="process-card">
              <div className="process-number">02</div>
              <h3>Technical round</h3>
              <p>
                Expect project discussions, core concepts, role-specific tools,
                and follow-up problem solving.
              </p>
            </div>
            <div className="process-card">
              <div className="process-number">03</div>
              <h3>Case or product thinking</h3>
              <p>
                Common in analytics and product roles where interviewers test
                structured thinking and decision-making.
              </p>
            </div>
            <div className="process-card">
              <div className="process-number">04</div>
              <h3>HR / final round</h3>
              <p>
                Communication, motivation, teamwork, and clarity often matter
                more than students expect.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section mistakes-section">
        <div className="container">
          <div className="section-head">
            <span className="section-kicker">Avoid this</span>
            <h2>Common mistakes students make</h2>
            <p>
              Most students do not fail because they are weak. They fail because
              they prepare in the wrong order.
            </p>
          </div>

          <div className="mistake-grid">
            {[
              "Watching tutorials without building",
              "Applying with generic resumes",
              "Ignoring projects and proof of work",
              "Skipping networking and guidance",
              "Starting applications too late",
              "Trying to learn everything at once",
            ].map((mistake) => (
              <div key={mistake} className="mistake-card">
                <span>✕</span>
                <p>{mistake}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section cta-section" id="atyant-help">
        <div className="container">
          <div className="cta-box">
            <div className="cta-copy">
              <span className="section-kicker">Need practical guidance?</span>
              <h2>Learn from seniors who already did it</h2>
              <p>
                Many students know the roadmap but still struggle with choosing
                projects, improving resumes, preparing for interviews, and getting
                referrals. Atyant helps bridge that gap with practical guidance.
              </p>

              <div className="support-grid">
                {quickSupport.map((item) => (
                  <div key={item} className="support-item">
                    <span>•</span>
                    <p>{item}</p>
                  </div>
                ))}
              </div>

              <div className="hero-actions">
                <a href="/signup" className="primary-btn">Get Started on Atyant</a>
                <a href="/chat" className="secondary-btn">Explore Student Guidance</a>
              </div>
            </div>

            <div className="cta-panel">
              <div className="mini-card">
                <span className="mini-label">ATYANT</span>
                <h3>Helping students move from confusion → clarity → opportunities</h3>
                <p>
                  Better direction. Better preparation. Better decisions.
                </p>
              </div>

              <div className="mini-card">
                <span className="mini-label">Best use case</span>
                <p>
                  When a student says: “Mujhe samajh hi nahi aa raha start kahan se karu.”
                </p>
              </div>

              <div className="mini-card">
                <span className="mini-label">Best next step</span>
                <p>
                  Pick one track, build 1–2 visible proofs of work, and talk to
                  someone who recently crossed the same path.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
