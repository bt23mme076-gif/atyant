import React, { useEffect, useMemo, useState } from "react";
import StatisticsSection from "../components/home/StatisticsSection";
import TestimonialsSection from "../components/home/TestimonialsSection";
import SuccessStoriesSection from "../components/home/SuccessStoriesSection";
import NewsletterSection from "../components/home/NewsletterSection";

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
  [
    "Share the problem",
    "Tell Atyant your college, branch, year, goal, and the exact career confusion you want to solve.",
  ],
  [
    "Get matched",
    "The platform helps connect you with seniors who have handled similar internship, placement, or career decisions.",
  ],
  [
    "Follow a roadmap",
    "Move with clearer next steps: skills, projects, applications, interview preparation, and follow-up guidance.",
  ],
];

const guideTracks = [
  {
    id: "analytics",
    title: "Data & Business Analytics",
    subtitle:
      "Move from analytics basics to a first analyst role with SQL, dashboards, projects, and business problem-solving.",
    skills: [
      "SQL joins, window functions, aggregations",
      "Python with Pandas and visualization",
      "Power BI, Tableau, Excel dashboards",
      "Statistics and business interpretation",
    ],
    roadmap: [
      "Build 3-4 public projects",
      "Show problem, dataset, insights, and recommendations",
      "Use an ATS-friendly resume",
      "Apply consistently and ask seniors for feedback",
    ],
    projects: [
      "Sales dashboard",
      "Customer churn analysis",
      "Marketing campaign performance",
      "HR attrition analysis",
    ],
  },
  {
    id: "cse-internship",
    title: "CSE Off-Campus Internship",
    subtitle:
      "A practical path for engineering students preparing for a first software internship.",
    skills: [
      "One programming language",
      "DSA basics",
      "HTML, CSS, JavaScript, React or backend basics",
      "GitHub and deployed project proof",
    ],
    roadmap: [
      "Build 1-2 working projects",
      "Create a one-page resume",
      "Practice DSA regularly",
      "Apply through job boards, referrals, and startup listings",
    ],
    projects: ["Task manager", "Chat app", "Notes app with auth", "Blog platform"],
  },
  {
    id: "cse-placement",
    title: "CSE Off-Campus Placement",
    subtitle:
      "Prepare for software roles with coding ability, CS fundamentals, projects, and interview clarity.",
    skills: [
      "Advanced DSA",
      "Frontend and backend proof",
      "DBMS, OS, OOP, CN fundamentals",
      "System design basics",
    ],
    roadmap: [
      "Pick one language",
      "Build 2-3 meaningful projects",
      "Prepare OA and interviews in parallel",
      "Use referrals and challenge-based hiring",
    ],
    projects: [
      "E-commerce backend",
      "Realtime chat",
      "Job tracker",
      "Portfolio API",
    ],
  },
  {
    id: "product",
    title: "Product & Strategy",
    subtitle:
      "Explore PM, product analytics, growth, and strategy roles through case studies and execution proof.",
    skills: [
      "Product thinking",
      "Metrics and funnels",
      "Basic SQL and analytics",
      "Figma, user flows, and case writing",
    ],
    roadmap: [
      "Study strong products",
      "Publish case studies",
      "Build or improve a small product",
      "Apply for product intern and analyst roles",
    ],
    projects: [
      "App teardown",
      "Feature improvement case",
      "Student community product",
      "Metrics dashboard",
    ],
  },
  {
    id: "aiml",
    title: "AI / Machine Learning",
    subtitle:
      "A grounded path for students targeting ML internships, AI engineering, and early data science roles.",
    skills: [
      "Python for ML",
      "Probability, statistics, linear algebra",
      "Scikit-learn, TensorFlow, or PyTorch",
      "Clean notebooks and documentation",
    ],
    roadmap: [
      "Learn Python and Pandas",
      "Cover ML fundamentals",
      "Build 2-4 ML projects",
      "Document results and start applying",
    ],
    projects: [
      "Spam classifier",
      "Recommendation system",
      "Image classification",
      "Fake news detection",
    ],
  },
];

const faqs = [
  [
    "What does Atyant do?",
    "Atyant is an AI-powered personal guidance engine that matches students with seniors who have already solved similar internship, placement, or career problems.",
  ],
  [
    "Is this a generic course website?",
    "No. The old Atyant positioning is about guidance, senior matching, and roadmaps, not selling a generic course.",
  ],
  [
    "Which problems does it help with?",
    "The verified site metadata mentions internships, placements, and career clarity.",
  ],
  [
    "How can students contact support?",
    `Use ${company.supportEmail}.`,
  ],
];

function GuideList({ title, items, ordered = false }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <div className="guide-list">
      <h3>{title}</h3>
      <Tag>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </Tag>
    </div>
  );
}

function ContactSection({ notify }) {
  const [form, setForm] = useState({ name: "", email: "", college: "", goal: "" });

  const submit = (event) => {
    event.preventDefault();
    notify(
      "Request saved locally. Connect this form to the Atyant API when backend access is available."
    );
    setForm({ name: "", email: "", college: "", goal: "" });
  };

  return (
    <section className="section contact-section" id="contact">
      <div className="contact-info">
        <p className="eyebrow">Contact</p>
        <h2>Ask for the right senior, not more generic advice.</h2>
        <p>
          Use the verified support email for official communication:{" "}
          <a href={`mailto:${company.supportEmail}`}>{company.supportEmail}</a>.
        </p>
        <div className="contact-list">
          <span>
            Official site:{" "}
            <a href={company.url} target="_blank" rel="noreferrer">
              atyant.in
            </a>
          </span>
          <span>Location: {company.location}</span>
          <span>Available languages listed publicly: English, Hindi</span>
        </div>
      </div>
      <form className="request-form" onSubmit={submit}>
        <label>
          Full name
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>
        <label>
          College / branch
          <input
            value={form.college}
            onChange={(e) => setForm({ ...form, college: e.target.value })}
            required
          />
        </label>
        <label>
          What do you need help with?
          <textarea
            value={form.goal}
            onChange={(e) => setForm({ ...form, goal: e.target.value })}
            rows={5}
            required
          />
        </label>
        <button className="primary-btn" type="submit">
          Request guidance
        </button>
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

function CareerPreview({ goTo }) {
  return (
    <section className="section guide-preview" id="guides">
      <div className="section-heading">
        <p className="eyebrow">From the guide package</p>
        <h2>Roadmaps for the student paths Atyant talks about.</h2>
        <p>
          The career guide package has been adapted into working pages for analytics, CSE
          internships, placements, product, and AI/ML.
        </p>
      </div>
      <div className="mini-track-grid">
        {guideTracks.map((track) => (
          <article key={track.id} className="mini-track">
            <span>{track.title}</span>
            <p>{track.subtitle}</p>
          </article>
        ))}
      </div>
      <button className="primary-btn centered" onClick={() => goTo("guides")}>
        Open career guides
      </button>
    </section>
  );
}

function HomeSections({ goTo, notify }) {
  return (
    <main>
      <section className="hero section" id="home">
        <div className="hero-copy">
          <p className="eyebrow">AI-powered student guidance engine</p>
          <h1>Atyant matches students with seniors who have already cracked it.</h1>
          <p className="hero-text">
            Confused about internships, placements, or career direction? Atyant helps students
            move from scattered advice to AI-curated, human-verified roadmaps from relevant
            seniors.
          </p>
          <div className="hero-actions">
            <button className="primary-btn" onClick={() => goTo("contact")}>
              Get guidance
            </button>
            <button className="secondary-btn" onClick={() => goTo("guides")}>
              Explore guides
            </button>
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
            <div className="signal-card">
              <span>01</span>
              <strong>AI context match</strong>
            </div>
            <div className="signal-card">
              <span>02</span>
              <strong>Verified senior insight</strong>
            </div>
            <div className="signal-card">
              <span>03</span>
              <strong>Clear next steps</strong>
            </div>
            <div className="signal-card">
              <span>04</span>
              <strong>Follow-up support</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="section service-section" id="service">
        <div className="section-heading">
          <p className="eyebrow">One service, clear promise</p>
          <h2>Career clarity through senior-guided roadmaps.</h2>
          <p>
            Atyant’s verified public copy describes one focused service: matching students with
            seniors and roadmaps for internships, placements, and career clarity.
          </p>
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

      <section className="section process-section" id="process">
        <div className="section-heading compact">
          <p className="eyebrow">How it works</p>
          <h2>From confusion to next action.</h2>
          <p>A simple three-step journey to clarity, guidance, and career success.</p>
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
      <StatisticsSection />
      <TestimonialsSection />
      <SuccessStoriesSection />
      <NewsletterSection />
      <ContactSection notify={notify} />
      <FAQSection />
    </main>
  );
}

export default function Home({ goTo, notify }) {
  // For compatibility with existing App routing that scrolls after navigation.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const safeGoTo = useMemo(
    () =>
      typeof goTo === "function"
        ? goTo
        : (id) => {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          },
    [goTo]
  );

  const safeNotify = useMemo(
    () =>
      typeof notify === "function"
        ? notify
        : (message) => {
            window.alert(message);
          },
    [notify]
  );

  return <HomeSections goTo={safeGoTo} notify={safeNotify} />;
}


