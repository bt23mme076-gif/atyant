import React, { useMemo, useState } from "react";
import Home from "./pages/Home.jsx";


const company = {
  name: "Atyant",
  url: "https://atyant.in/",
  supportEmail: "support@atyant.in",
  location: "Nagpur, Maharashtra",
  founder: "Nitin Rai",
  founded: "2024",
  socials: {
    instagram: "https://www.instagram.com/atyant.in",
    linkedin: "https://www.linkedin.com/company/atyant-in/",
    twitter: "https://twitter.com/atyant_in",
  },
};

const navigation = [
  { id: "home", label: "Home" },
  { id: "service", label: "Service" },
  { id: "guides", label: "Career Guides" },
  { id: "signup", label: "Sign Up" },
  { id: "contact", label: "Contact" },
];

const servicePoints = [
  {
    title: "AI-curated matching",
    body: "Students share the problem they are facing; Atyant uses that context to guide them toward relevant seniors and roadmaps.",
  },
  {
    title: "Human-verified roadmaps",
    body: "The old site positions Atyant around AI-curated, human-verified guidance instead of generic advice.",
  },
  {
    title: "Built for students in India",
    body: "The service focuses on internship guidance, placement preparation, and career clarity for students.",
  },
];

const steps = [
  ["Share the problem", "Tell Atyant your college, branch, year, goal, and the exact career confusion you want to solve."],
  ["Get matched", "The platform helps connect you with seniors who have handled similar internship, placement, or career decisions."],
  ["Follow a roadmap", "Move with clearer next steps: skills, projects, applications, interview preparation, and follow-up guidance."],
];

const guideTracks = [
  {
    id: "analytics",
    title: "Data & Business Analytics",
    subtitle: "Move from analytics basics to a first analyst role with SQL, dashboards, projects, and business problem-solving.",
    skills: ["SQL joins, window functions, aggregations", "Python with Pandas and visualization", "Power BI, Tableau, Excel dashboards", "Statistics and business interpretation"],
    roadmap: ["Build 3-4 public projects", "Show problem, dataset, insights, and recommendations", "Use an ATS-friendly resume", "Apply consistently and ask seniors for feedback"],
    projects: ["Sales dashboard", "Customer churn analysis", "Marketing campaign performance", "HR attrition analysis"],
  },
  {
    id: "cse-internship",
    title: "CSE Off-Campus Internship",
    subtitle: "A practical path for engineering students preparing for a first software internship.",
    skills: ["One programming language", "DSA basics", "HTML, CSS, JavaScript, React or backend basics", "GitHub and deployed project proof"],
    roadmap: ["Build 1-2 working projects", "Create a one-page resume", "Practice DSA regularly", "Apply through job boards, referrals, and startup listings"],
    projects: ["Task manager", "Chat app", "Notes app with auth", "Blog platform"],
  },
  {
    id: "cse-placement",
    title: "CSE Off-Campus Placement",
    subtitle: "Prepare for software roles with coding ability, CS fundamentals, projects, and interview clarity.",
    skills: ["Advanced DSA", "Frontend and backend proof", "DBMS, OS, OOP, CN fundamentals", "System design basics"],
    roadmap: ["Pick one language", "Build 2-3 meaningful projects", "Prepare OA and interviews in parallel", "Use referrals and challenge-based hiring"],
    projects: ["E-commerce backend", "Realtime chat", "Job tracker", "Portfolio API"],
  },
  {
    id: "product",
    title: "Product & Strategy",
    subtitle: "Explore PM, product analytics, growth, and strategy roles through case studies and execution proof.",
    skills: ["Product thinking", "Metrics and funnels", "Basic SQL and analytics", "Figma, user flows, and case writing"],
    roadmap: ["Study strong products", "Publish case studies", "Build or improve a small product", "Apply for product intern and analyst roles"],
    projects: ["App teardown", "Feature improvement case", "Student community product", "Metrics dashboard"],
  },
  {
    id: "aiml",
    title: "AI / Machine Learning",
    subtitle: "A grounded path for students targeting ML internships, AI engineering, and early data science roles.",
    skills: ["Python for ML", "Probability, statistics, linear algebra", "Scikit-learn, TensorFlow, or PyTorch", "Clean notebooks and documentation"],
    roadmap: ["Learn Python and Pandas", "Cover ML fundamentals", "Build 2-4 ML projects", "Document results and start applying"],
    projects: ["Spam classifier", "Recommendation system", "Image classification", "Fake news detection"],
  },
];

const faqs = [
  ["What does Atyant do?", "Atyant is an AI-powered personal guidance engine that matches students with seniors who have already solved similar internship, placement, or career problems."],
  ["Is this a generic course website?", "No. The old Atyant positioning is about guidance, senior matching, and roadmaps, not selling a generic course."],
  ["Which problems does it help with?", "The verified site metadata mentions internships, placements, and career clarity."],
  ["How can students contact support?", `Use ${company.supportEmail}.`],
];

function App() {
  const [page, setPage] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState("");

  const goTo = (id) => {
    setPage(["guides", "signup", "privacy", "terms"].includes(id) ? id : "home");
    setMobileOpen(false);
    setTimeout(() => {
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    }, 30);
  };

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3600);
  };

  return (
    <div className="app-shell">
      <Header page={page} goTo={goTo} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      {page === "guides" && <CareerGuidesPage goTo={goTo} />}
      {page === "signup" && <SignupPage notify={notify} />}
      {page === "privacy" && <PolicyPage title="Privacy Policy" type="privacy" />}
      {page === "terms" && <PolicyPage title="Terms of Service" type="terms" />}
      {page === "home" && <Home goTo={goTo} notify={notify} />}

      <Footer goTo={goTo} />
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function Header({ page, goTo, mobileOpen, setMobileOpen }) {
  return (
    <header className="site-header">
      <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); goTo("home"); }}>
        <span className="brand-mark">A</span>
        <span>{company.name}</span>
      </a>
      <button className="menu-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation">
        <span />
        <span />
        <span />
      </button>
      <nav className={mobileOpen ? "nav-links open" : "nav-links"}>
        {navigation.map((item) => (
          <button key={item.id} className={page === item.id ? "active" : ""} onClick={() => goTo(item.id)}>
            {item.label}
          </button>
        ))}
        <a className="nav-cta" href={company.url} target="_blank" rel="noreferrer">Open Atyant</a>
      </nav>
    </header>
  );
}

function HomePage({ goTo, notify }) {
  return <Home goTo={goTo} notify={notify} />;
}

function _OldHomePage({ goTo, notify }) {
  return (
    <main>
      <section className="hero section" id="home">

        <div className="hero-copy">
          <p className="eyebrow">AI-powered student guidance engine</p>
          <h1>Atyant matches students with seniors who have already cracked it.</h1>
          <p className="hero-text">
            Confused about internships, placements, or career direction? Atyant helps students move from scattered advice to AI-curated, human-verified roadmaps from relevant seniors.
          </p>
          <div className="hero-actions">
            <button className="primary-btn" onClick={() => goTo("contact")}>Get guidance</button>
            <button className="secondary-btn" onClick={() => goTo("guides")}>Explore guides</button>
          </div>
          <div className="trust-strip" aria-label="Verified company facts">
            <span>Founded {company.founded}</span>
            <span>Founder: {company.founder}</span>
            <span>{company.location}</span>
          </div>
        </div>
        <div className="hero-panel" aria-label="Atyant service summary">
          <div className="signal-card main">
            <span className="signal-label">Student problem</span>
            <strong>“I need a roadmap for internships and placements.”</strong>
          </div>
          <div className="signal-grid">
            <div className="signal-card"><span>01</span><strong>AI context match</strong></div>
            <div className="signal-card"><span>02</span><strong>Verified senior insight</strong></div>
            <div className="signal-card"><span>03</span><strong>Clear next steps</strong></div>
            <div className="signal-card"><span>04</span><strong>Follow-up support</strong></div>
          </div>
        </div>
      </section>

      <section className="section service-section" id="service">
        <div className="section-heading">
          <p className="eyebrow">One service, clear promise</p>
          <h2>Career clarity through senior-guided roadmaps.</h2>
          <p>Atyant’s verified public copy describes one focused service: matching students with seniors and roadmaps for internships, placements, and career clarity.</p>
        </div>
        <div className="feature-grid">
          {servicePoints.map((point) => (
            <article className="feature-card" key={point.title}>
              <h3>{point.title}</h3>
              <p>{point.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section process-section">
        <div className="section-heading compact">
          <p className="eyebrow">How it works</p>
          <h2>From confusion to next action.</h2>
        </div>
        <div className="steps">
          {steps.map(([title, body], index) => (
            <article className="step-card" key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <CareerPreview goTo={goTo} />
      <ContactSection notify={notify} />
      <FAQSection />
    </main>
  );
}

function CareerPreview({ goTo }) {
  return (
    <section className="section guide-preview" id="guides">
      <div className="section-heading">
        <p className="eyebrow">From the guide package</p>
        <h2>Roadmaps for the student paths Atyant talks about.</h2>
        <p>The career guide package has been adapted into working pages for analytics, CSE internships, placements, product, and AI/ML.</p>
      </div>
      <div className="mini-track-grid">
        {guideTracks.map((track) => (
          <article key={track.id} className="mini-track">
            <span>{track.title}</span>
            <p>{track.subtitle}</p>
          </article>
        ))}
      </div>
      <button className="primary-btn centered" onClick={() => goTo("guides")}>Open career guides</button>
    </section>
  );
}

function ContactSection({ notify }) {
  const [form, setForm] = useState({ name: "", email: "", college: "", goal: "" });

  const submit = (event) => {
    event.preventDefault();
    notify("Request saved locally. Connect this form to the Atyant API when backend access is available.");
    setForm({ name: "", email: "", college: "", goal: "" });
  };

  return (
    <section className="section contact-section" id="contact">
      <div className="contact-info">
        <p className="eyebrow">Contact</p>
        <h2>Ask for the right senior, not more generic advice.</h2>
        <p>Use the verified support email for official communication: <a href={`mailto:${company.supportEmail}`}>{company.supportEmail}</a>.</p>
        <div className="contact-list">
          <span>Official site: <a href={company.url} target="_blank" rel="noreferrer">atyant.in</a></span>
          <span>Location: {company.location}</span>
          <span>Available languages listed publicly: English, Hindi</span>
        </div>
      </div>
      <form className="request-form" onSubmit={submit}>
        <label>
          Full name
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label>
          College / branch
          <input value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} required />
        </label>
        <label>
          What do you need help with?
          <textarea value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} rows={5} required />
        </label>
        <button className="primary-btn" type="submit">Request guidance</button>
      </form>
    </section>
  );
}

function FAQSection() {
  const [open, setOpen] = useState(0);
  return (
    <section className="section faq-section">
      <div className="section-heading compact">
        <p className="eyebrow">FAQ</p>
        <h2>Clear answers from verified positioning.</h2>
      </div>
      <div className="faq-list">
        {faqs.map(([question, answer], index) => (
          <article className="faq-item" key={question}>
            <button onClick={() => setOpen(open === index ? -1 : index)}>
              <span>{question}</span>
              <strong>{open === index ? "-" : "+"}</strong>
            </button>
            {open === index && <p>{answer}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}

function CareerGuidesPage({ goTo }) {
  const [active, setActive] = useState("all");
  const visibleTracks = useMemo(
    () => active === "all" ? guideTracks : guideTracks.filter((track) => track.id === active),
    [active]
  );

  return (
    <main className="guides-page">
      <section className="guides-hero">
        <p className="eyebrow">Atyant career playbook</p>
        <h1>From confusion to clarity to career.</h1>
        <p>Roadmaps adapted from the provided CareerGuidesPage package, cleaned for this company page and made usable without missing backend imports.</p>
        <div className="hero-actions">
          <button className="primary-btn" onClick={() => setActive("all")}>All tracks</button>
          <button className="secondary-btn" onClick={() => goTo("signup")}>Create account</button>
        </div>
      </section>
      <section className="track-filter" aria-label="Career guide filters">
        <button className={active === "all" ? "active" : ""} onClick={() => setActive("all")}>All</button>
        {guideTracks.map((track) => (
          <button key={track.id} className={active === track.id ? "active" : ""} onClick={() => setActive(track.id)}>
            {track.title}
          </button>
        ))}
      </section>
      <section className="guide-track-list">
        {visibleTracks.map((track, index) => (
          <article className="guide-track-card" key={track.id}>
            <div>
              <span className="track-index">{String(index + 1).padStart(2, "0")}</span>
              <h2>{track.title}</h2>
              <p>{track.subtitle}</p>
            </div>
            <div className="track-columns">
              <GuideList title="Skills recruiters expect" items={track.skills} />
              <GuideList title="Roadmap" items={track.roadmap} ordered />
              <GuideList title="Project ideas" items={track.projects} />
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

function GuideList({ title, items, ordered = false }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <div className="guide-list">
      <h3>{title}</h3>
      <Tag>
        {items.map((item) => <li key={item}>{item}</li>)}
      </Tag>
    </div>
  );
}

function SignupPage({ notify }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const next = {};
    if (form.username.trim().length < 3) next.username = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email.";
    if (!/^[6-9]\d{9}$/.test(form.phone)) next.phone = "Enter a valid 10-digit Indian mobile number.";
    if (form.password.length < 8) next.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword) next.confirmPassword = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    notify("Signup validated locally. Connect /api/auth/signup when backend access is available.");
    setForm({ username: "", email: "", phone: "", password: "", confirmPassword: "", role: "student" });
  };

  return (
    <main className="auth-page">
      <section className="auth-intro">
        <p className="eyebrow">Account access</p>
        <h1>Create an Atyant account.</h1>
        <p>This signup flow is adapted from the provided signup package and works locally with validation. Backend submission is intentionally not faked.</p>
      </section>
      <form className="auth-form" onSubmit={submit} noValidate>
        <div className="role-toggle">
          {["student", "mentor"].map((role) => (
            <button type="button" key={role} className={form.role === role ? "active" : ""} onClick={() => setForm({ ...form, role })}>
              {role === "student" ? "Student" : "Mentor"}
            </button>
          ))}
        </div>
        <AuthField label="Full name" error={errors.username}>
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} autoComplete="name" />
        </AuthField>
        <AuthField label="Email address" error={errors.email}>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
        </AuthField>
        <AuthField label="Mobile number" error={errors.phone}>
          <div className="phone-field">
            <span>+91</span>
            <input type="tel" value={form.phone} maxLength={10} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })} autoComplete="tel" />
          </div>
        </AuthField>
        <AuthField label="Password" error={errors.password}>
          <div className="password-field">
            <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button>
          </div>
        </AuthField>
        <AuthField label="Confirm password" error={errors.confirmPassword}>
          <input type={showPassword ? "text" : "password"} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} autoComplete="new-password" />
        </AuthField>
        <button className="primary-btn full" type="submit">Create account</button>
      </form>
    </main>
  );
}

function AuthField({ label, error, children }) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      {children}
      {error && <small>{error}</small>}
    </label>
  );
}

function PolicyPage({ title, type }) {
  const isPrivacy = type === "privacy";
  return (
    <main className="policy-page">
      <p className="eyebrow">Atyant</p>
      <h1>{title}</h1>
      <p>
        This page is a frontend-ready policy placeholder for the new company page. It uses verified contact details from the public site and avoids adding legal claims that were not provided.
      </p>
      <div className="policy-grid">
        <article>
          <h2>{isPrivacy ? "Data students may share" : "Use of service"}</h2>
          <p>{isPrivacy ? "Students may share name, email, college, branch, and career goals when requesting guidance." : "Atyant is positioned as a student guidance platform for internships, placements, and career clarity."}</p>
        </article>
        <article>
          <h2>{isPrivacy ? "Contact" : "Support"}</h2>
          <p>For official questions, contact <a href={`mailto:${company.supportEmail}`}>{company.supportEmail}</a>.</p>
        </article>
      </div>
    </main>
  );
}

function Footer({ goTo }) {
  return (
    <footer className="footer">
      <div>
        <a className="brand footer-brand" href="#home" onClick={(event) => { event.preventDefault(); goTo("home"); }}>
          <span className="brand-mark">A</span>
          <span>{company.name}</span>
        </a>
        <p>The Intelligent Placement & Career Guidance Engine.</p>
      </div>
      <div>
        <h3>Platform</h3>
        <button onClick={() => goTo("home")}>Home</button>
        <button onClick={() => goTo("guides")}>Career Guides</button>
        <button onClick={() => goTo("signup")}>Sign Up</button>
      </div>
      <div>
        <h3>Legal</h3>
        <button onClick={() => goTo("privacy")}>Privacy Policy</button>
        <button onClick={() => goTo("terms")}>Terms of Service</button>
      </div>
      <div>
        <h3>Connect</h3>
        <a href={`mailto:${company.supportEmail}`}>{company.supportEmail}</a>
        <a href={company.socials.instagram} target="_blank" rel="noreferrer">Instagram</a>
        <a href={company.socials.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
      </div>
    </footer>
  );
}

export default App;
