import { useState, useEffect } from "react";
import { API_URL, apiCall } from "../services/api.js";
import { motion } from "framer-motion";

// ─── Template Data ────────────────────────────────────────────────────────────
const TEMPLATES = [
  { id: 1, name: "Industrial focus", cat: "Fresher",     price: 69, desc: "Clean 1-page layout for core engineering freshers", image: "https://res.cloudinary.com/dny6dtmox/image/upload/q_auto,f_auto/v1774380593/image_6_hg2ma1.jpg",                                  canvaLink: "https://docs.google.com/presentation/d/11T7fhWnJeA9OdM97OsvIF8cJIFdPP_h6qlcGh8uVogw/copy", proof: "3 students got Reliance Industries internship",   proofIcon: "🏭" },
  { id: 2, name: "Tech Developer",  cat: "Experienced", price: 69, desc: "Modern 2-column layout for software developers",     image: "https://res.cloudinary.com/dny6dtmox/image/upload/q_auto,f_auto/v1774380116/Screenshot_2026-03-25_004919_jtemge.jpg",         canvaLink: "https://docs.google.com/presentation/d/1y7yxncBrlXJpf9k9q7q82LjbzzxDl4xoW54YDl_sh3I/copy", proof: "4 students got software internships from this",   proofIcon: "💻" },
  { id: 3, name: "Executive Pro",   cat: "Executive",   price: 69, desc: "Premium layout for leadership & senior roles",       image: "https://res.cloudinary.com/dny6dtmox/image/upload/q_auto,f_auto/v1774379922/image_5_iwtsl7.jpg",                                  canvaLink: "https://docs.google.com/presentation/d/1LLkgH59RSz4WdZQNOHaJqd4NAZaEnBSby96OyjLK99A/copy", proof: "2 students selected at top MNCs",                proofIcon: "🏆" },
  { id: 4, name: "Creative Bold",   cat: "Fresher",     price: 69, desc: "Stand-out design for creative & design fields",      image: "https://res.cloudinary.com/dny6dtmox/image/upload/q_auto,f_auto/v1774379826/image_4_nik3ol.jpg",                                  canvaLink: "https://docs.google.com/presentation/d/1e6_JNRCLxX4QVQhx-Lmb1cBGpE4URGjcCpAqULhB-o4/copy", proof: "5 students got IIT Kanpur research internship",  proofIcon: "🎓" },
  { id: 5, name: "Corporate Edge",  cat: "Experienced", price: 69, desc: "Clean structured layout for corporate roles",        image: "https://res.cloudinary.com/dny6dtmox/image/upload/q_auto,f_auto/v1774379716/image_3_jad3zp.jpg",                                  canvaLink: "https://docs.google.com/presentation/d/1e6_JNRCLxX4QVQhx-Lmb1cBGpE4URGjcCpAqULhB-o4/copy", proof: "3 students placed in Fortune 500 companies",    proofIcon: "📈" },
  { id: 6, name: "IIM Ahmedabad",   cat: "MBA",         price: 69, desc: "Crafted for MBA & management aspirants",             image: "https://res.cloudinary.com/dny6dtmox/image/upload/q_auto,f_auto/v1774381400/cf814da1-04d0-4db5-961f-1e141e4b0bb4.png",           canvaLink: "https://docs.google.com/presentation/d/1rDfuWeIQLZ__7-G7GHaiHpuf3ewzSiIJusSpoaQ-V9E/copy",  proof: "Selected at IIM Ahmedabad from this resume",    proofIcon: "🌟" },
];

const CAT_COLORS = {
  Fresher:     { bg: "#E8F4FD", color: "#1565C0", border: "#BBDEFB" },
  Experienced: { bg: "#E8F5E9", color: "#2E7D32", border: "#C8E6C9" },
  Executive:   { bg: "#FFF8E1", color: "#F57F17", border: "#FFE082" },
  MBA:         { bg: "#FCE4EC", color: "#880E4F", border: "#F48FB1" },
};

const STEPS = [
  { num: 1, emoji: "👀", title: "Preview Resume",       desc: "See the top half — get a feel of the design" },
  { num: 2, emoji: "💳", title: "Pay ₹69",              desc: "One-time via Razorpay — UPI, card, netbanking" },
  { num: 3, emoji: "🔗", title: "Get Slides Link",      desc: "Your unique editing link unlocks instantly" },
  { num: 4, emoji: "✏️", title: "Edit Your Name",       desc: "Change name, skills, experience — Google Slides free" },
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ResumeMarketplace() {
  const [selected, setSelected]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [canvaLink, setCanvaLink] = useState(null);
  const [error, setError]         = useState("");
  const [ownedTemplates, setOwnedTemplates] = useState({});

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
              ⚡ INDIA'S FIRST RESUME MARKETPLACE WITH INSTANT EDITING
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: "clamp(1.9rem, 4.5vw, 2.9rem)",
              fontWeight: 800, color: "#111827",
              lineHeight: 1.2, marginBottom: 14,
              fontFamily: "Georgia, 'Times New Roman', serif",
            }}>
              Resume templates that get you
              <br />
              <span style={{ color: "#4f46e5" }}>shortlisted & selected</span>
            </h1>

            {/* Subtext */}
            <p style={{ fontSize: 15, color: "#6b7280", maxWidth: 520, margin: "0 auto 28px", lineHeight: 1.7 }}>
              ATS-friendly designs used by real students at IITs, IIMs & top companies.
              Buy → Edit → Download. Done in 10 minutes.
            </p>

            {/* Stats */}
            <div style={{ display: "flex", justifyContent: "center", gap: "3rem", flexWrap: "wrap" }}>
              {[["500+", "Students helped"], ["IIT/IIM", "Proven results"], ["10 min", "Edit & download"], ["₹69", "One-time only"]].map(([val, lbl]) => (
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

        {/* ══ CARDS GRID ═══════════════════════════════════════════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 20 }}>
          {TEMPLATES.map((t) => {
            const owned    = ownedTemplates[t.id];
            const catStyle = CAT_COLORS[t.cat] || CAT_COLORS["Fresher"];
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
                      <a href={owned.canvaLink || t.canvaLink} target="_blank" rel="noreferrer"
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
                    ["After payment", "Unique Google Slides link"],
                    ["Edit in",       "Google Slides (free)"],
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
                  Your Google Slides link is ready! Click below, make your copy, edit your details, then download as PDF.
                </p>
                <a href={canvaLink} target="_blank" rel="noreferrer"
                  style={{ display: "block", width: "100%", padding: "12px", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none", textAlign: "center", boxShadow: "0 4px 16px rgba(79,70,229,0.3)", marginBottom: 8 }}
                >
                  ✏️ Open & Edit Resume →
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