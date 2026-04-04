import { useState, useEffect } from "react";
import { API_URL, apiCall } from "../services/api.js";
import { motion } from "framer-motion";

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
  Fresher:     { bg: "#E8F4FD", color: "#1565C0", border: "#BBDEFB" },
  Experienced: { bg: "#E8F5E9", color: "#2E7D32", border: "#C8E6C9" },
  Executive:   { bg: "#FFF8E1", color: "#F57F17", border: "#FFE082" },
  Core:        { bg: "#FFF3E0", color: "#E65100", border: "#FFCC80" },
  Data:        { bg: "#E1F5FE", color: "#01579B", border: "#B3E5FC" },
  Product:     { bg: "#F3E5F5", color: "#6A1B9A", border: "#E1BEE7" },
  General:     { bg: "#F5F5F5", color: "#424242", border: "#E0E0E0" },
};

const STEPS = [
  { num: 1, emoji: "👀", title: "Preview Resume",       desc: "See the top half — get a feel of the design" },
  { num: 2, emoji: "💳", title: "Pay ₹69",              desc: "One-time via Razorpay — UPI, card, netbanking" },
  { num: 3, emoji: "🔗", title: "Get Canva Link",       desc: "Your unique editing link unlocks instantly" },
  { num: 4, emoji: "✏️", title: "Edit Your Details",    desc: "Change name, skills, experience — free on Canva" },
  { num: 5, emoji: "📥", title: "Download PDF",         desc: "Export & apply to jobs right away!" },
];

// ─── Resume Preview with blur ────────────────────────────────────────────────
function ResumePreview({ image, name }) {
  return (
    <div style={{ position: "relative", width: "100%", height: 220, overflow: "hidden", borderRadius: "10px 10px 0 0", background: "#f5f5f5" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%", overflow: "hidden" }}>
        <img src={image} alt={name} style={{ width: "100%", objectFit: "cover", objectPosition: "top" }} />
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", overflow: "hidden" }}>
        <img src={image} alt={name} style={{ width: "100%", objectFit: "cover", objectPosition: "bottom", filter: "blur(6px)", transform: "scale(1.05)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.75))" }} />
      </div>
      <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.78)", backdropFilter: "blur(8px)", color: "#fff", borderRadius: 20, padding: "5px 14px", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
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
            border: "2px solid",
            borderColor: selected === cat ? "#4f46e5" : "#e5e7eb",
            background: selected === cat ? "#4f46e5" : "#fff",
            color: selected === cat ? "#fff" : "#6b7280",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
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
  const [selected, setSelected]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [canvaLink, setCanvaLink] = useState(null);
  const [error, setError]         = useState("");
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
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              templateId:          template.id,
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
        theme: { color: "#6366f1" },
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
        } catch {}
      }
    })();
  }, []);

  function openModal(template) { setSelected(template); setCanvaLink(null); setError(""); }
  function closeModal()        { setSelected(null); setCanvaLink(null); setLoading(false); setError(""); }

  return (
    <>
      <script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "2rem 1rem", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

        {/* ══ HERO ══════════════════════════════════════════════════════════ */}
        <div style={{
          textAlign: "center",
          marginBottom: "1.8rem",
          borderRadius: 20,
          padding: "3rem 2rem 2.5rem",
          background: "linear-gradient(145deg, #eef0ff 0%, #e8eeff 40%, #ede8ff 100%)",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 4px 32px rgba(99,102,241,0.1)",
        }}>
          {/* Blobs */}
          <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", background: "rgba(99,102,241,0.13)", filter: "blur(70px)", top: -80, left: -60, zIndex: 0 }} />
          <div style={{ position: "absolute", width: 280, height: 280, borderRadius: "50%", background: "rgba(139,92,246,0.11)", filter: "blur(70px)", bottom: -60, right: -40, zIndex: 0 }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "#fffbeb", border: "1.5px solid #f59e0b",
              borderRadius: 20, fontSize: 11, color: "#92400e",
              padding: "5px 16px", marginBottom: 22,
              fontWeight: 700, letterSpacing: "0.05em",
              boxShadow: "0 2px 8px rgba(245,158,11,0.15)",
            }}>
              ⚡ 14 PREMIUM TEMPLATES - INSTANT CANVA EDITING
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: "clamp(1.9rem, 4.5vw, 2.9rem)",
              fontWeight: 800, color: "#111827",
              lineHeight: 1.2, marginBottom: 14,
              fontFamily: "Georgia, 'Times New Roman', serif",
            }}>
              Resume Templates that get you
              <br />
              <span style={{ color: "#4f46e5" }}>shortlisted & selected</span>
            </h1>

            {/* Subtext */}
            <p style={{ fontSize: 15, color: "#6b7280", maxWidth: 520, margin: "0 auto 28px", lineHeight: 1.7 }}>
              ATS-friendly designs used by real students at IITs, IIMs & top companies.
              Buy → Edit on Canva → Download. Done in 10 minutes.
            </p>

            {/* Stats */}
            <div style={{ display: "flex", justifyContent: "center", gap: "3rem", flexWrap: "wrap" }}>
              {[["14", "Templates"], ["IIT/IIM", "Proven results"], ["10 min", "Edit & download"], ["₹69", "One-time only"]].map(([val, lbl]) => (
                <div key={lbl} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#111827", fontFamily: "Georgia, serif" }}>{val}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ HOW IT WORKS ═════════════════════════════════════════════════ */}
        <div style={{
          background: "#ffffff",
          borderRadius: 20,
          padding: "1.8rem 1.5rem",
          marginBottom: "2.5rem",
          boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
          border: "1px solid #f3f4f6",
        }}>
          <p style={{ textAlign: "center", fontSize: 30, fontWeight: 1500, color: "#374151", letterSpacing: "0.14em", marginBottom: 5 }}>
            <strong>HOW IT WORKS</strong>
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            {STEPS.map((s) => (
              <motion.div
                key={s.num}
                whileHover={{ y: -5, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 220, damping: 16 }}
                style={{
                  flex: 1, minWidth: 140,
                  display: "flex", flexDirection: "column", alignItems: "center",
                  textAlign: "center", padding: "20px 14px", borderRadius: 16,
                  background: "linear-gradient(145deg, #f8f9ff, #f0f1ff)",
                  border: "1px solid #e5e7ff",
                  cursor: "default",
                }}
              >
                <div style={{
                  width: 62, height: 62, borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, marginBottom: 12,
                  boxShadow: "0 6px 20px rgba(99,102,241,0.3)",
                }}>
                  {s.emoji}
                </div>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#6366f1", letterSpacing: "0.12em", marginBottom: 5 }}>STEP {s.num}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 6 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.55 }}>{s.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ══ CATEGORY FILTER ══════════════════════════════════════════════ */}
        <CategoryFilter selected={categoryFilter} onChange={setCategoryFilter} />

        {/* ══ CARDS GRID ═══════════════════════════════════════════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 20 }}>
          {filteredTemplates.map((t) => {
            const owned    = ownedTemplates[t.id];
            const catStyle = CAT_COLORS[t.cat] || CAT_COLORS["General"];
            return (
              <div key={t.id}
                style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", transition: "transform 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 32px rgba(0,0,0,0.11)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"; }}
              >
                <div style={{ padding: "8px 12px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: catStyle.bg, color: catStyle.color, border: `1px solid ${catStyle.border}`, letterSpacing: "0.04em" }}>
                    {t.cat.toUpperCase()}
                  </span>
                  {owned && <span style={{ fontSize: 10, color: "#2E7D32", fontWeight: 700 }}>✅ Owned</span>}
                </div>

                <ResumePreview image={t.image} name={t.name} />

                <div style={{ margin: "10px 12px 0", background: "#f0f7ff", border: "1px solid #bbdefb", borderRadius: 8, padding: "7px 10px", display: "flex", alignItems: "flex-start", gap: 7 }}>
                  <span style={{ fontSize: 14 }}>{t.proofIcon}</span>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#1565C0", letterSpacing: "0.04em", marginBottom: 1 }}>PROVEN RESULTS</div>
                    <div style={{ fontSize: 11, color: "#37474f", lineHeight: 1.4 }}>{t.proof}</div>
                  </div>
                </div>

                <div style={{ padding: "10px 12px 14px" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 3, color: "#1a1a1a" }}>{t.name}</h3>
                  <p style={{ fontSize: 11, color: "#888", marginBottom: 12, lineHeight: 1.4 }}>{t.desc}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ fontSize: 20, fontWeight: 800, color: "#1a1a1a", fontFamily: "Georgia, serif" }}>₹{t.price}</span>
                      <span style={{ fontSize: 10, color: "#999", marginLeft: 4 }}>one-time</span>
                    </div>
                    {owned ? (
                      <a href={owned.canvaLink} target="_blank" rel="noreferrer"
                        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", textDecoration: "none", boxShadow: "0 2px 8px rgba(99,102,241,0.3)" }}>
                        Open & Edit ↗
                      </a>
                    ) : (
                      <button onClick={() => openModal(t)}
                        style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 8px rgba(79,70,229,0.3)" }}>
                        Buy & Unlock 🔓
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ MODAL ════════════════════════════════════════════════════════════ */}
      {selected && (
        <div
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}
        >
          <div style={{ background: "#fff", borderRadius: 18, padding: "1.5rem", maxWidth: 400, width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
            {!canvaLink ? (
              <>
                <div style={{ borderRadius: 10, overflow: "hidden", marginBottom: "1rem", height: 150, position: "relative" }}>
                  <img src={selected.image} alt={selected.name} style={{ width: "100%", objectFit: "cover", objectPosition: "top", height: "100%" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55))" }} />
                  <div style={{ position: "absolute", bottom: 10, left: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{selected.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>{selected.cat}</div>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "0.8rem", marginBottom: "0.8rem" }}>
                  {[
                    ["Price",         `₹${selected.price} (one-time)`],
                    ["After payment", "Unique Canva editing link"],
                    ["Edit in",       "Canva (free online)"],
                    ["Downloads",     "Unlimited PDF exports"],
                  ].map(([lbl, val]) => (
                    <div key={lbl} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 7 }}>
                      <span style={{ color: "#9ca3af" }}>{lbl}</span>
                      <span style={{ fontWeight: 600, color: "#111827" }}>{val}</span>
                    </div>
                  ))}
                </div>

                {error && <div style={{ fontSize: 12, color: "#dc2626", background: "#fef2f2", padding: "8px 10px", borderRadius: 6, marginBottom: 10 }}>{error}</div>}

                <button
                  onClick={() => handlePayment(selected)}
                  disabled={loading}
                  style={{ width: "100%", padding: "12px", background: loading ? "#c7d2fe" : "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 16px rgba(79,70,229,0.3)", marginBottom: 8 }}
                >
                  {loading ? "⏳ Processing..." : `💳 Pay ₹${selected.price} via Razorpay`}
                </button>
                <button onClick={closeModal} style={{ width: "100%", padding: "8px", background: "none", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12, color: "#6b7280", cursor: "pointer" }}>
                  Cancel
                </button>
              </>
            ) : (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: 10 }}>🎉</div>
                <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.2rem", marginBottom: 6, color: "#111827" }}>Payment Successful!</h3>
                <p style={{ fontSize: 13, color: "#6b7280", marginBottom: "1.2rem", lineHeight: 1.6 }}>
                  Your Canva link is ready! Click below, make your copy, edit your details, then download as PDF.
                </p>
                <a href={canvaLink} target="_blank" rel="noreferrer"
                  style={{ display: "block", width: "100%", padding: "12px", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none", textAlign: "center", boxShadow: "0 4px 16px rgba(79,70,229,0.3)", marginBottom: 8 }}
                >
                  ✏️ Open & Edit Resume in Canva →
                </a>
                <button onClick={closeModal} style={{ width: "100%", padding: "8px", background: "none", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12, color: "#6b7280", cursor: "pointer" }}>
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