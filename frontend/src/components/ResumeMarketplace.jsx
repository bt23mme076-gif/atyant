import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import { API_URL, apiCall } from "../services/api.js";
import { motion } from "framer-motion";
import SEO from "./SEO";
import "./AtyantLandingPage.css";

// ─── Template Data ────────────────────────────────────────────────────────────
const TEMPLATES = [
  // SDE Templates
  {
    id: 1,
    name: "SDE Fresher (AI/Data Focus)",
    cat: "Fresher",
    price: 69,
    desc: "Modern layout perfect for CS freshers with AI/ML/Data projects",
    image: "https://res.cloudinary.com/dny6dtmox/image/upload/q_auto/f_auto/v1775260487/192ce5b8-1161-4d59-90ef-65933272b689.png",
    proof: "4 students placed at startups via this template",
    proofIcon: "💻"
  },
  {
    id: 2,
    name: "FAANG SDE Fresher (C/C++, DSA)",
    cat: "Fresher",
    price: 69,
    desc: "Optimized for SDE roles - highlights DSA, system design & core CS",
    image: "https://res.cloudinary.com/dny6dtmox/image/upload/q_auto/f_auto/v1775260468/88e07c37-dd26-473a-b63e-b191ab16595a.png",
    proof: "Used by Google SDE intern from IIT Delhi",
    proofIcon: "🚀"
  },
  {
    id: 3,
    name: "Software Engineer (15+ Years)",
    cat: "Experienced",
    price: 69,
    desc: "Executive-level layout for senior backend/DevOps engineers",
    image: "https://res.cloudinary.com/dny6dtmox/image/upload/q_auto/f_auto/v1775260446/eb430f3b-1d8c-4761-a154-d72baa26acbf.png",
    proof: "3 senior engineers got FAANG offers",
    proofIcon: "🏆"
  },

  // AI/ML Templates
  {
    id: 4,
    name: "AI/ML Developer Fresher",
    cat: "Fresher",
    price: 69,
    desc: "Designed for ML freshers - showcases projects, frameworks & papers",
    image: "https://res.cloudinary.com/dny6dtmox/image/upload/q_auto/f_auto/v1775260080/3fb22bd9-9b54-4368-bd94-0092527604f8.png",
    proof: "5 ML interns selected from this resume",
    proofIcon: "🤖"
  },
  {
    id: 5,
    name: "AI/ML Research",
    cat: "Experienced",
    price: 69,
    desc: "Academic-focused layout for ML researchers & PhD candidates",
    image: "https://res.cloudinary.com/dny6dtmox/image/upload/q_auto/f_auto/v1775259942/0bf22d93-7481-4a15-84bf-883d6166a9a6.png",
    proof: "2 students got IIT research positions",
    proofIcon: "🎓"
  },
  {
    id: 6,
    name: "AI/ML FAANG (Deep Learning, NLP, CV)",
    cat: "Experienced",
    price: 69,
    desc: "Premium ML layout highlighting deep learning, NLP & computer vision",
    image: "https://res.cloudinary.com/dny6dtmox/image/upload/q_auto/f_auto/v1775259922/31b08a66-b4ba-4b88-9a9f-be52d502d411.png",
    proof: "Selected at Google AI Research team",
    proofIcon: "⚡"
  },

  // Core Engineering Templates
  {
    id: 7,
    name: "Metallurgical/Materials Engineering",
    cat: "Core",
    price: 69,
    desc: "Structured layout for metallurgy & materials science roles",
    image: "https://res.cloudinary.com/dny6dtmox/image/upload/q_auto/f_auto/v1775259864/0aa2311d-5fe8-401b-8dd1-3834dc666bc8.png",
    proof: "3 students got Tata Steel internships",
    proofIcon: "🏭"
  },
  {
    id: 8,
    name: "Electrical Engineering (Power Systems)",
    cat: "Core",
    price: 69,
    desc: "Clean design for electrical & power systems engineers",
    image: "https://res.cloudinary.com/dny6dtmox/image/upload/q_auto/f_auto/v1775259847/f5adddef-2c2a-45d9-899c-fba0aa562f48.png",
    proof: "4 students selected at power companies",
    proofIcon: "⚙️"
  },
  {
    id: 9,
    name: "Chemical Engineering",
    cat: "Core",
    price: 69,
    desc: "Professional layout tailored for chemical & process engineers",
    image: "https://res.cloudinary.com/dny6dtmox/image/upload/q_auto/f_auto/v1775251730/WhatsApp_Image_2026-04-04_at_2.34.22_AM_xhyxpl.jpg",
    proof: "2 students placed at Reliance Industries",
    proofIcon: "🧪"
  },

  // Data & Analytics Templates
  {
    id: 10,
    name: "Data Analyst/Science (Finance)",
    cat: "Data",
    price: 69,
    desc: "Finance-focused data analytics layout with metrics & insights",
    image: "https://res.cloudinary.com/dny6dtmox/image/upload/q_auto/f_auto/v1775251710/WhatsApp_Image_2026-04-04_at_2.40.43_AM_zsr8bu.jpg",
    proof: "Selected at JP Morgan & Goldman Sachs",
    proofIcon: "📊"
  },
  {
    id: 11,
    name: "Product/Consulting/Data Analytics",
    cat: "Product",
    price: 69,
    desc: "Hybrid layout for product analysts & consulting roles",
    image: "https://res.cloudinary.com/dny6dtmox/image/upload/q_auto/f_auto/v1775251670/WhatsApp_Image_2026-04-04_at_2.45.15_AM_b1nkcg.jpg",
    proof: "4 students got consulting firm offers",
    proofIcon: "💼"
  },

  // General Professional Templates
  {
    id: 12,
    name: "Tech Professional",
    cat: "General",
    price: 69,
    desc: "Versatile modern design for various tech roles",
    image: "https://res.cloudinary.com/dny6dtmox/image/upload/q_auto/f_auto/v1775259884/a81b79a3-2a00-4ed1-bed5-384fadf07b65.png",
    proof: "Popular template across all domains",
    proofIcon: "💻"
  },
  {
    id: 13,
    name: "Modern Professional",
    cat: "General",
    price: 69,
    desc: "Contemporary clean layout suitable for any industry",
    image: "https://res.cloudinary.com/dny6dtmox/image/upload/q_auto/f_auto/v1775260487/192ce5b8-1161-4d59-90ef-65933272b689.png",
    proof: "5+ students hired across sectors",
    proofIcon: "✨"
  },
  {
    id: 14,
    name: "Executive Professional",
    cat: "Executive",
    price: 69,
    desc: "Premium executive layout for leadership positions",
    image: "https://res.cloudinary.com/dny6dtmox/image/upload/q_auto/f_auto/v1775260446/eb430f3b-1d8c-4761-a154-d72baa26acbf.png",
    proof: "2 VPs hired with this template",
    proofIcon: "👔"
  },
];

const CAT_COLORS = {
  Fresher: { bg: "rgba(117,103,201,0.08)", color: "#5A4CB0", border: "#CFC6EE" },
  Experienced: { bg: "rgba(26,158,106,0.08)", color: "#1a9e6a", border: "rgba(26,158,106,0.25)" },
  Executive: { bg: "rgba(199,122,0,0.08)", color: "#c77a00", border: "rgba(199,122,0,0.25)" },
  Core: { bg: "rgba(199,122,0,0.08)", color: "#c77a00", border: "rgba(199,122,0,0.25)" },
  Data: { bg: "rgba(117,103,201,0.08)", color: "#5A4CB0", border: "#CFC6EE" },
  Product: { bg: "rgba(117,103,201,0.08)", color: "#5A4CB0", border: "#CFC6EE" },
  General: { bg: "rgba(27,24,48,0.05)", color: "#5A5470", border: "#E3E0EC" },
};

const STEPS = [
  { num: 1, emoji: "👀", title: "Preview Resume", desc: "See the top half — get a feel of the design" },
  { num: 2, emoji: "💳", title: "Pay ₹69", desc: "One-time via Razorpay — UPI, card, netbanking" },
  { num: 3, emoji: "🔗", title: "Get Canva Link", desc: "Your unique editing link unlocks instantly" },
  { num: 4, emoji: "✏️", title: "Edit Your Details", desc: "Change name, skills, experience — free on Canva" },
  { num: 5, emoji: "📥", title: "Download PDF", desc: "Export & apply to jobs right away!" },
];

// ─── Resume Preview with blur ────────────────────────────────────────────────
function ResumePreview({ image, name }) {
  return (
    <div style={{ position: "relative", width: "100%", height: 220, overflow: "hidden", background: "var(--bg)" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%", overflow: "hidden" }}>
        <img src={image} alt={name} style={{ width: "100%", objectFit: "cover", objectPosition: "top" }} />
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", overflow: "hidden" }}>
        <img src={image} alt={name} style={{ width: "100%", objectFit: "cover", objectPosition: "bottom", filter: "blur(6px)", transform: "scale(1.05)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.85))" }} />
      </div>
      <div style={{
        position: "absolute",
        bottom: 14,
        left: "50%",
        transform: "translateX(-50%)",
        background: "var(--text)",
        color: "var(--white)",
        borderRadius: 20,
        padding: "6px 14px",
        fontSize: 11,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        gap: 5,
        whiteSpace: "nowrap",
        fontFamily: 'var(--font-sans)',
        letterSpacing: '0.03em'
      }}>
        🔒 Buy to unlock full resume
      </div>
    </div>
  );
}

// ─── Category Filter ─────────────────────────────────────────────────────────
function CategoryFilter({ selected, onChange }) {
  const categories = ["All", "Fresher", "Experienced", "Core", "Data", "Product", "Executive", "General"];

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: "2rem" }}>
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          style={{
            padding: "8px 20px",
            borderRadius: 20,
            border: "1.5px solid",
            borderColor: selected === cat ? "var(--accent)" : "var(--border)",
            background: selected === cat ? "var(--accent)" : "var(--card)",
            color: selected === cat ? "var(--white)" : "var(--textSub)",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            transition: "all var(--transition)",
            fontFamily: 'var(--font-sans)'
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ResumeMarketplace() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [canvaLink, setCanvaLink] = useState(null);
  const [error, setError] = useState("");
  const [ownedTemplates, setOwnedTemplates] = useState({});
  const [categoryFilter, setCategoryFilter] = useState("All");

  const filteredTemplates = categoryFilter === "All"
    ? TEMPLATES
    : TEMPLATES.filter(t => t.cat === categoryFilter);

  async function handlePayment(template) {
    setLoading(true);
    setError("");
    try {
      const orderRes = await fetch(`${API_URL}/api/resume/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id }),
      });
      const order = await orderRes.json();
      if (!order.id) throw new Error("Order creation failed");

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Atyant Career Hub",
        description: template.name,
        order_id: order.id,
        handler: async function (response) {
          const verifyRes = await fetch(`${API_URL}/api/resume/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              templateId: template.id,
            }),
          });
          const data = await verifyRes.json();
          if (data.canvaLink) {
            setCanvaLink(data.canvaLink);
            setOwnedTemplates(prev => ({ ...prev, [template.id]: { canvaLink: data.canvaLink } }));
          } else {
            setError("Payment verified but link fetch failed. Contact support.");
          }
          setLoading(false);
        },
        modal: { ondismiss: () => setLoading(false) },
        prefill: {},
        theme: { color: "#7567C9" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      for (const t of TEMPLATES) {
        try {
          const res = await apiCall(`/api/resume/purchase-status?templateId=${t.id}`);
          if (res?.owned) setOwnedTemplates(prev => ({ ...prev, [t.id]: { canvaLink: res.canvaLink } }));
        } catch { }
      }
    })();
  }, []);

  function openModal(template) { setSelected(template); setCanvaLink(null); setError(""); }
  function closeModal() { setSelected(null); setCanvaLink(null); setLoading(false); setError(""); }

  return (
    <>
      <SEO
        title="Premium Resume Templates — Get Shortlisted | Atyant"
        description="ATS-friendly resume templates vetted by top recruiters and placement cell heads. Edit directly in Canva and start applying in under 10 minutes."
        canonical="https://atyant.in/resume-store"
        keywords="ats friendly resume template, resume builder Canva, engineering student resume, atyant resume store, placement resume download, premium resume IIT IIM"
      />

      <div className="atyant-landing">
        {/* ── ANNOUNCEMENT BAR ── */}
        <div className="al-announce">
          <span className="al-announce-tag">New</span>
          <span>Atyant — Hult Prize Top 20, IIT Bombay Nationals 2026</span>
          <span style={{ color: 'var(--accent)', fontWeight: 800, cursor: 'pointer' }} onClick={() => navigate('/home')}>
            Read more →
          </span>
        </div>

        {/* ── HEADER ── */}
        <header className="al-header">
          <button className="al-brand" onClick={() => navigate('/home')}>
            <span className="al-brand-mark">A</span>
            Atyant
          </button>

          <nav className={`al-nav${menuOpen ? ' open' : ''}`}>
            <button className="al-nav-btn" onClick={() => navigate('https://atyant.in/')}>Clarity Engine</button>
            <button className="al-nav-btn" onClick={() => navigate('/ask')}>Verified Sessions</button>
            <button className="al-nav-btn" onClick={() => navigate('/career-guides')}>Verified Paths</button>
            <button className="al-nav-btn active-link" style={{ color: 'var(--accent)' }} onClick={() => navigate('/resume-store')}>Resume Store</button>
            <button className="al-nav-btn" onClick={() => navigate('/webinar')}>Webinar</button>
          </nav>

          <div className="al-header-actions">
            {user ? (
              <button className="al-ghost-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
            ) : (
              <>
                <button className="al-ghost-btn" onClick={() => navigate('/login')}>Log in</button>
                <button className="al-primary-btn" style={{ minHeight: 38, padding: '0 18px', fontSize: '0.86rem' }} onClick={() => navigate('/signup')}>
                  Get started
                </button>
              </>
            )}
          </div>

          <button className="al-menu-toggle" aria-label="Toggle menu" onClick={() => setMenuOpen(p => !p)}>
            <span /><span /><span />
          </button>
        </header>

        {/* ── HERO + CATALOG (single section) ── */}
        <section className="al-hero" style={{ minHeight: 'auto', padding: "80px 20px 60px" }}>
          <div className="al-hero-kicker">
            <span className="al-hero-kicker-dot" />
            ⚡ 14 PREMIUM TEMPLATES - INSTANT CANVA EDITING
          </div>

          <h1>
            Resume Templates that get you<br />
            <span style={{
              background: 'linear-gradient(135deg, #7567C9 0%, #5A4CB0 50%, #1a9e6a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              shortlisted & selected
            </span>
          </h1>

          <p className="al-hero-sub">
            ATS-optimised resume templates built from formats that actually cleared shortlists at Tier-1 companies. Vetted by placement cell alumni and hiring managers.
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap', margin: '28px 0 48px' }}>
            {[
              { val: '14', label: 'TEMPLATES' },
              { val: 'IIT/IIM', label: 'PROVEN RESULTS' },
              { val: '10 min', label: 'EDIT & DOWNLOAD' },
              { val: '₹69', label: 'ONE-TIME ONLY' },
            ].map(m => (
              <div key={m.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 'normal', fontSize: '2rem', color: 'var(--accent)', lineHeight: 1 }}>{m.val}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--textMuted)', marginTop: 6 }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Category filter */}
          <CategoryFilter selected={categoryFilter} onChange={setCategoryFilter} />

          {/* Template grid */}
          <div id="catalog" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 24, marginTop: 32, maxWidth: 1100, width: '100%', margin: '32px auto 0' }}>
            {filteredTemplates.map((t) => {
              const owned = ownedTemplates[t.id];
              const catStyle = CAT_COLORS[t.cat] || CAT_COLORS["General"];
              return (
                <div key={t.id}
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radiusLg)",
                    overflow: "hidden",
                    boxShadow: "var(--shadowCard)",
                    transition: "all var(--transition)",
                    display: "flex",
                    flexDirection: "column"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--shadowHover)"; e.currentTarget.style.borderColor = "var(--borderHover)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadowCard)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                >
                  <div style={{ padding: "16px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "4px 12px",
                      borderRadius: 20,
                      background: catStyle.bg,
                      color: catStyle.color,
                      border: `1px solid ${catStyle.border}`,
                      letterSpacing: "0.05em",
                      fontFamily: 'var(--font-sans)'
                    }}>
                      {t.cat.toUpperCase()}
                    </span>
                    {owned && <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 800, fontFamily: 'var(--font-sans)' }}>✅ Owned</span>}
                  </div>

                  <ResumePreview image={t.image} name={t.name} />

                  <div style={{ margin: "14px 20px 0", background: "var(--accentSoft)", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ fontSize: 16 }}>{t.proofIcon}</span>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 900, color: "var(--accent)", letterSpacing: "0.06em", marginBottom: 2, fontFamily: 'var(--font-sans)' }}>PROVEN OUTCOME</div>
                      <div style={{ fontSize: 12, color: "var(--textSub)", lineHeight: 1.4, fontFamily: 'var(--font-serif)' }}>{t.proof}</div>
                    </div>
                  </div>

                  <div style={{ padding: "16px 20px 20px", display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 6, color: "var(--text)", fontFamily: 'var(--font-sans)', lineHeight: 1.2 }}>{t.name}</h3>
                      <p style={{ fontSize: '0.9rem', color: "var(--textSub)", marginBottom: 18, lineHeight: 1.5, fontFamily: 'var(--font-serif)' }}>{t.desc}</p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                      <div>
                        <span style={{ fontSize: 22, fontWeight: 'normal', color: "var(--text)", fontFamily: "var(--font-serif)", fontStyle: 'italic' }}>₹{t.price}</span>
                        <span style={{ fontSize: 10, color: "var(--textMuted)", marginLeft: 6, fontFamily: 'var(--font-sans)', fontWeight: 600 }}>one-time</span>
                      </div>
                      {owned ? (
                        <a href={owned.canvaLink} target="_blank" rel="noreferrer"
                          className="al-primary-btn"
                          style={{ minHeight: 36, padding: "0 16px", fontSize: 12, textDecoration: "none" }}
                        >
                          Open Canva ↗
                        </a>
                      ) : (
                        <button onClick={() => openModal(t)}
                          className="al-primary-btn"
                          style={{ minHeight: 36, padding: "0 16px", fontSize: 12 }}
                        >
                          Unlock Resume 🔓
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="al-section" id="how-it-works" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}>
          <div className="al-wrap">
            <div className="al-section-head center">
              <p className="al-eyebrow">Process</p>
              <h2>How it works</h2>
              <p>Unlock, customize, and deploy your new resume in under 10 minutes.</p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginTop: 40 }}>
              {STEPS.map((s) => (
                <motion.div
                  key={s.num}
                  whileHover={{ y: -4, boxShadow: 'var(--shadowHover)' }}
                  transition={{ duration: 0.2 }}
                  style={{
                    flex: 1, minWidth: 160,
                    display: "flex", flexDirection: "column", alignItems: "center",
                    textAlign: "center", padding: "28px 20px", borderRadius: "var(--radiusLg)",
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    cursor: "default",
                  }}
                >
                  <div style={{
                    width: 62, height: 62, borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--accent), #9d92e0)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, marginBottom: 16,
                    boxShadow: "0 6px 20px var(--accentGlow)",
                    color: "white"
                  }}>
                    {s.emoji}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "var(--accent)", letterSpacing: "0.12em", marginBottom: 6, fontFamily: 'var(--font-sans)' }}>STEP {s.num}</div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: "var(--text)", marginBottom: 8, fontFamily: 'var(--font-sans)' }}>{s.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: "var(--textSub)", lineHeight: 1.6, fontFamily: 'var(--font-serif)' }}>{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="al-footer" style={{ borderTop: "1px solid var(--border)", background: "var(--bg2)" }}>
          <div className="al-footer-top">
            <div className="al-footer-col">
              <button className="al-brand" onClick={() => navigate('/home')}>
                <span className="al-brand-mark">A</span>
                Atyant
              </button>
              <p style={{ color: 'var(--textSub)', fontSize: '0.88rem', lineHeight: 1.72, maxWidth: 260, fontFamily: 'var(--font-serif)' }}>
                India's career clarity engine for engineering students. Ask your confusion. Get the right path.
              </p>
              <p style={{ color: 'var(--textMuted)', fontSize: '0.8rem', fontFamily: 'var(--font-sans)' }}>VNIT Nagpur · Founded 2024</p>
              <p style={{ color: 'var(--textMuted)', fontSize: '0.8rem', fontFamily: 'var(--font-sans)' }}>Hult Prize Top 20 · IIT Bombay 2026</p>
            </div>

            <div className="al-footer-col">
              <h4>Products</h4>
              <button className="al-footer-link" onClick={() => navigate('https://atyant.in/')}>Clarity Engine</button>
              <button className="al-footer-link" onClick={() => navigate('/ask')}>Verified Senior Sessions</button>
              <button className="al-footer-link" onClick={() => navigate('/career-guides')}>Verified Paths</button>
              <button className="al-footer-link" onClick={() => navigate('/resume-store')}>Resume Store</button>
            </div>

            <div className="al-footer-col">
              <h4>How it works</h4>
              <button className="al-footer-link" onClick={() => navigate('/home')}>The engine</button>
              <button className="al-footer-link" onClick={() => navigate('/home')}>FAQ</button>
            </div>

            <div className="al-footer-col">
              <h4>Company</h4>
              <button className="al-footer-link" onClick={() => navigate('/home')}>Team</button>
              <button className="al-footer-link" onClick={() => navigate('/home')}>Milestones</button>
              <button className="al-footer-link" onClick={() => navigate('/webinar')}>Events & Webinars</button>
            </div>

            <div className="al-footer-col">
              <h4>Legal</h4>
              <button className="al-footer-link" onClick={() => navigate('/privacy')}>Privacy Policy</button>
              <button className="al-footer-link" onClick={() => navigate('/terms')}>Terms of Service</button>
            </div>
          </div>

          <div className="al-footer-bottom">
            <p>© {new Date().getFullYear()} Atyant. All rights reserved. Built in Nagpur, India.</p>
            <div className="al-footer-legal">
              <button onClick={() => navigate('/privacy')}>Privacy Policy</button>
              <button onClick={() => navigate('/terms')}>Terms of Service</button>
            </div>
          </div>
        </footer>
      </div>

      {/* ── MODAL ── */}
      {selected && (
        <div
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}
        >
          <div style={{ background: "var(--card)", borderRadius: "var(--radiusLg)", padding: "1.8rem", maxWidth: 400, width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.15)", border: "1px solid var(--border)" }}>
            {!canvaLink ? (
              <>
                <div style={{ borderRadius: 10, overflow: "hidden", marginBottom: "1.2rem", height: 150, position: "relative" }}>
                  <img src={selected.image} alt={selected.name} style={{ width: "100%", objectFit: "cover", objectPosition: "top", height: "100%" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55))" }} />
                  <div style={{ position: "absolute", bottom: 12, left: 14 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: 'var(--font-sans)' }}>{selected.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontFamily: 'var(--font-sans)', fontWeight: 500 }}>{selected.cat}</div>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem", marginBottom: "1rem" }}>
                  {[
                    ["Price", `₹${selected.price} (one-time)`],
                    ["After payment", "Unique Canva editing link"],
                    ["Edit in", "Canva (free online)"],
                    ["Downloads", "Unlimited PDF exports"],
                  ].map(([lbl, val]) => (
                    <div key={lbl} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8, fontFamily: 'var(--font-sans)' }}>
                      <span style={{ color: "var(--textMuted)", fontWeight: 500 }}>{lbl}</span>
                      <span style={{ fontWeight: 700, color: "var(--text)" }}>{val}</span>
                    </div>
                  ))}
                </div>

                {error && <div style={{ fontSize: 12, color: "#dc2626", background: "#fef2f2", padding: "8px 10px", borderRadius: 6, marginBottom: 10, fontFamily: 'var(--font-sans)' }}>{error}</div>}

                <button
                  onClick={() => handlePayment(selected)}
                  disabled={loading}
                  className="al-primary-btn"
                  style={{ width: "100%", padding: "12px", minHeight: 48, fontSize: 14, marginBottom: 8 }}
                >
                  {loading ? "⏳ Processing..." : `💳 Pay ₹${selected.price} via Razorpay`}
                </button>

                <button
                  onClick={closeModal}
                  className="al-secondary-btn"
                  style={{ width: "100%", padding: "8px", minHeight: 38, fontSize: 12 }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>🎉</div>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", marginBottom: 8, color: "var(--text)" }}>Payment Successful!</h3>
                <p style={{ fontSize: 13, color: "var(--textSub)", marginBottom: "1.5rem", lineHeight: 1.6, fontFamily: 'var(--font-serif)' }}>
                  Your Canva link is ready! Click below, make your copy, edit your details, then download as PDF.
                </p>
                <a href={canvaLink} target="_blank" rel="noreferrer"
                  className="al-primary-btn"
                  style={{ display: "flex", width: "100%", padding: "12px", textDecoration: "none", justifyContent: "center", marginBottom: 8 }}
                >
                  ✏️ Open & Edit Resume in Canva →
                </a>
                <button
                  onClick={closeModal}
                  className="al-secondary-btn"
                  style={{ width: "100%", padding: "8px", minHeight: 38, fontSize: 12 }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}