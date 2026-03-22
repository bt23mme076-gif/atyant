import { useState, useEffect } from "react";
import { apiCall } from "../services/api.js";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── Template Data ──────────────────────────────────────────────────────────
// canvaLink: apna actual Canva remix link daal yahan
const TEMPLATES = [
  { id: 1, name: "Clean Fresher",   cat: "Fresher",     price: 49, desc: "Minimal 1-page layout for freshers",           color: "#E6F1FB", accent: "#378ADD", canvaLink: "https://www.canva.com/design/YOUR_ID_1/remix" },
  { id: 2, name: "Modern Tech",     cat: "Experienced", price: 79, desc: "2-column layout for developers",               color: "#EAF3DE", accent: "#639922", canvaLink: "https://www.canva.com/design/YOUR_ID_2/remix" },
  { id: 3, name: "Executive Pro",   cat: "Executive",   price: 99, desc: "Premium serif layout for leadership roles",    color: "#FAEEDA", accent: "#BA7517", canvaLink: "https://www.canva.com/design/YOUR_ID_3/remix" },
  { id: 4, name: "Creative Bold",   cat: "Fresher",     price: 59, desc: "Stand-out design for creative fields",         color: "#EEEDFE", accent: "#7F77DD", canvaLink: "https://www.canva.com/design/YOUR_ID_4/remix" },
  { id: 5, name: "Corporate Edge",  cat: "Experienced", price: 79, desc: "Clean structured layout for corporate roles",  color: "#EAF3DE", accent: "#3B6D11", canvaLink: "https://www.canva.com/design/YOUR_ID_5/remix" },
  { id: 6, name: "Minimal Elite",   cat: "Executive",   price: 99, desc: "Elegant minimal design for senior roles",      color: "#FAEEDA", accent: "#854F0B", canvaLink: "https://www.canva.com/design/YOUR_ID_6/remix" },
];

const CAT_STYLES = {
  Fresher:     { bg: "#E6F1FB", color: "#0C447C" },
  Experienced: { bg: "#EAF3DE", color: "#27500A" },
  Executive:   { bg: "#FAEEDA", color: "#633806" },
};

// ─── Mini Resume Preview SVG ─────────────────────────────────────────────────
function MiniResume({ color, accent }) {
  return (
    <svg width="100" height="130" viewBox="0 0 100 130" fill="none">
      <rect width="100" height="130" rx="4" fill={color} />
      <rect x="10" y="12" width="40" height="5"  rx="2"   fill={accent} opacity="0.9" />
      <rect x="10" y="20" width="28" height="3"  rx="1.5" fill={accent} opacity="0.4" />
      <rect x="10" y="32" width="80" height="1"  rx="0.5" fill={accent} opacity="0.2" />
      <rect x="10" y="38" width="22" height="3"  rx="1.5" fill={accent} opacity="0.7" />
      <rect x="10" y="45" width="78" height="2"  rx="1"   fill={accent} opacity="0.2" />
      <rect x="10" y="50" width="65" height="2"  rx="1"   fill={accent} opacity="0.2" />
      <rect x="10" y="55" width="72" height="2"  rx="1"   fill={accent} opacity="0.2" />
      <rect x="10" y="65" width="22" height="3"  rx="1.5" fill={accent} opacity="0.7" />
      <rect x="10" y="72" width="78" height="2"  rx="1"   fill={accent} opacity="0.2" />
      <rect x="10" y="77" width="60" height="2"  rx="1"   fill={accent} opacity="0.2" />
      <rect x="10" y="82" width="70" height="2"  rx="1"   fill={accent} opacity="0.2" />
      <rect x="10" y="92" width="22" height="3"  rx="1.5" fill={accent} opacity="0.7" />
      <rect x="10" y="99" width="55" height="2"  rx="1"   fill={accent} opacity="0.2" />
      <rect x="10" y="104" width="65" height="2" rx="1"   fill={accent} opacity="0.2" />
    </svg>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ResumeMarketplace() {
  const [selected, setSelected]   = useState(null); // template selected for purchase
  const [loading, setLoading]     = useState(false);
  const [canvaLink, setCanvaLink] = useState(null);  // unlocked link after payment
  const [error, setError]         = useState("");
  const [ownedTemplates, setOwnedTemplates] = useState({}); // { templateId: { canvaLink, expiresAt } }

  // Called after Razorpay payment modal closes successfully
  async function handlePayment(template) {
    setLoading(true);
    setError("");

    try {
      // Step 1: Create Razorpay order on backend
      const orderRes = await fetch(`${API_URL}/api/resume/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id }),
      });
      const order = await orderRes.json();
      if (!order.id) throw new Error("Order creation failed");

      // Step 2: Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // set in .env
        amount: order.amount,
        currency: "INR",
        name: "Atyant Career Hub",
        description: template.name,
        order_id: order.id,
        handler: async function (response) {
          // Step 3: Verify payment + get Canva link
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
            // mark as owned locally
            setOwnedTemplates(prev => ({ ...prev, [template.id]: { canvaLink: data.canvaLink, expiresAt: data.expiresAt || null } }));
          } else {
            setError("Payment verified but link fetch failed. Contact support.");
          }
          setLoading(false);
        },
        modal: { ondismiss: () => setLoading(false) },
        prefill: {},
        theme: { color: "#1a1a1a" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  useEffect(() => {
    // Check ownership for logged-in user
    (async () => {
      try {
        for (const t of TEMPLATES) {
          try {
            const res = await apiCall(`/api/resume/purchase-status?templateId=${t.id}`);
            if (res?.owned) {
              setOwnedTemplates(prev => ({ ...prev, [t.id]: { canvaLink: res.canvaLink, expiresAt: res.expiresAt } }));
            }
          } catch (err) {
            // ignore individual failures
          }
        }
      } catch (err) {
        // no-op
      }
    })();
  }, []);

  function openModal(template) {
    setSelected(template);
    setCanvaLink(null);
    setError("");
  }

  function closeModal() {
    setSelected(null);
    setCanvaLink(null);
    setLoading(false);
    setError("");
  }

  return (
    <>
      {/* Razorpay SDK — load once */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem", fontFamily: "DM Sans, sans-serif" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span style={{ display: "inline-block", background: "#f4f4f4", borderRadius: 20, fontSize: 12, color: "#666", padding: "4px 14px", marginBottom: 12, letterSpacing: "0.04em" }}>
            Atyant Career Hub
          </span>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(1.6rem,4vw,2.2rem)", fontWeight: 600, marginBottom: 8 }}>
            Resume templates that get you shortlisted
          </h1>
          <p style={{ fontSize: 14, color: "#666", maxWidth: 400, margin: "0 auto" }}>
            ATS-friendly, professionally designed. Buy once, edit in Canva, download instantly.
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {TEMPLATES.map((t) => (
            <div key={t.id} style={{ background: "#fff", border: "0.5px solid #e0e0e0", borderRadius: 12, overflow: "hidden" }}>
              {/* Thumbnail */}
              <div style={{ height: 160, background: "#f8f8f8", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <MiniResume color={t.color} accent={t.accent} />
                {/* Lock overlay */}
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 32, height: 32, background: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🔒</div>
                </div>
                {/* Category badge */}
                <span style={{ position: "absolute", top: 8, left: 8, fontSize: 10, fontWeight: 500, padding: "3px 8px", borderRadius: 20, background: CAT_STYLES[t.cat].bg, color: CAT_STYLES[t.cat].color }}>
                  {t.cat}
                </span>
              </div>

              {/* Body */}
              <div style={{ padding: "14px 16px" }}>
                <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{t.name}</h3>
                <p style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>{t.desc}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 600 }}>
                    ₹{t.price} <span style={{ fontSize: 11, fontWeight: 400, fontFamily: "sans-serif", color: "#999" }}>one-time</span>
                  </span>
                  {ownedTemplates[t.id] ? (
                    <a
                      href={ownedTemplates[t.id].canvaLink || t.canvaLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{ background: "#7B61FF", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer", textDecoration: 'none' }}
                    >
                      Open in Canva
                    </a>
                  ) : (
                    <button
                      onClick={() => openModal(t)}
                      style={{ background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer" }}
                    >
                      Buy & unlock
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}
        >
          <div style={{ background: "#fff", borderRadius: 12, padding: "1.5rem", maxWidth: 340, width: "100%" }}>

            {!canvaLink ? (
              <>
                <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.2rem", marginBottom: 4 }}>{selected.name}</h2>
                <p style={{ fontSize: 12, color: "#888", marginBottom: "1rem" }}>{selected.desc} · {selected.cat}</p>

                <div style={{ borderTop: "0.5px solid #eee", paddingTop: "1rem", marginBottom: "1rem" }}>
                  {[
                    ["Template price", `₹${selected.price}`],
                    ["After payment",  "Unique Canva link"],
                    ["Editable in",    "Canva (free)"],
                    ["Downloads",      "Unlimited (your copy)"],
                  ].map(([label, val]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                      <span style={{ color: "#888" }}>{label}</span>
                      <span style={{ fontWeight: 500 }}>{val}</span>
                    </div>
                  ))}
                </div>

                {error && <p style={{ fontSize: 12, color: "red", marginBottom: 8 }}>{error}</p>}

                <button
                  onClick={() => handlePayment(selected)}
                  disabled={loading}
                  style={{ width: "100%", padding: 10, background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? "Processing..." : `Pay ₹${selected.price} via Razorpay`}
                </button>
                <button onClick={closeModal} style={{ width: "100%", padding: "6px 12px", background: "none", border: "0.5px solid #ddd", borderRadius: 8, fontSize: 12, color: "#888", cursor: "pointer", marginTop: 8 }}>
                  Cancel
                </button>
              </>
            ) : (
              /* Success state */
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>✅</div>
                <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.1rem", marginBottom: 6 }}>Payment successful!</h3>
                <p style={{ fontSize: 12, color: "#888", marginBottom: "1rem" }}>
                  Your unique Canva template link is ready. Edit and download your resume anytime.
                </p>
                <a
                  href={canvaLink}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "block", width: "100%", padding: 10, background: "#7B61FF", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: "none", textAlign: "center" }}
                >
                  Open in Canva →
                </a>
                <button onClick={closeModal} style={{ width: "100%", padding: "6px 12px", background: "none", border: "0.5px solid #ddd", borderRadius: 8, fontSize: 12, color: "#888", cursor: "pointer", marginTop: 8 }}>
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