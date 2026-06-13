import React, { useState } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 3000);
    }, 1200);
  };

  return (
    <section
      className="section"
      style={{
        paddingTop: "80px",
        paddingBottom: "80px",
        borderTop: "1px solid var(--cardBorder)",
      }}
      id="newsletter"
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "60px 40px",
          borderRadius: "var(--radiusLg)",
          background:
            "linear-gradient(160deg, rgba(117, 103, 201, 0.12), rgba(61, 190, 130, 0.05)), rgba(34, 30, 51, 0.6)",
          border: "1px solid rgba(117, 103, 201, 0.3)",
          textAlign: "center",
        }}
      >
        <p className="eyebrow" style={{ justifyContent: "center", gap: "8px", marginBottom: "16px" }}>
          📬 Weekly Insights
        </p>

        <h2 style={{ marginBottom: "16px" }}>
          Career guidance delivered to your inbox.
        </h2>

        <p
          style={{
            color: "var(--textSub)",
            fontSize: "1.04rem",
            lineHeight: "1.7",
            marginBottom: "32px",
          }}
        >
          Get weekly tips, success stories, and guidance on internships, placements, and career
          clarity. Join 1000+ students making informed career decisions with Atyant.
        </p>

        <form onSubmit={handleSubscribe} style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
          <input
            type="email"
            placeholder="your.email@college.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === "loading"}
            style={{
              flex: 1,
              minHeight: "48px",
              padding: "0 16px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.05)",
              color: "var(--text)",
              fontSize: "1rem",
              opacity: status === "loading" ? 0.6 : 1,
            }}
          />
          <button
            type="submit"
            className="primary-btn"
            disabled={status === "loading"}
            style={{
              minHeight: "48px",
              minWidth: "140px",
              opacity: status === "loading" ? 0.7 : 1,
            }}
          >
            {status === "loading"
              ? "Subscribing..."
              : status === "success"
              ? "✓ Subscribed!"
              : "Subscribe"}
          </button>
        </form>

        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--textMuted)",
            margin: "0",
          }}
        >
          ✓ No spam. Unsubscribe anytime. We respect your privacy.
        </p>
      </div>
    </section>
  );
}
