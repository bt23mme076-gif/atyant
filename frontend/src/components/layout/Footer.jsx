import React, { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div>
        <h3>Atyant</h3>
        <p>AI-powered personal guidance engine for students. Internships, placements, career clarity.</p>
        <p style={{ marginTop: "12px", fontSize: "0.9rem", color: "var(--textMuted)" }}>
          © {currentYear} Atyant. All rights reserved.
        </p>
      </div>

      <div>
        <h3>Product</h3>
        <button onClick={() => window.location.hash = "#guides"}>Career Guides</button>
        <button onClick={() => window.location.hash = "#service"}>Services</button>
        <button onClick={() => window.location.hash = "#process"}>How It Works</button>
        <button onClick={() => window.location.hash = "#faq"}>FAQ</button>
      </div>

      <div>
        <h3>Company</h3>
        <button onClick={() => window.scrollTo(0, 0)}>About</button>
        <a href="https://www.instagram.com/atyant.in" target="_blank" rel="noreferrer">Instagram</a>
        <a href="https://www.linkedin.com/company/atyant-in/" target="_blank" rel="noreferrer">LinkedIn</a>
        <a href="https://twitter.com/atyant_in" target="_blank" rel="noreferrer">Twitter</a>
      </div>

      <div>
        <h3>Newsletter</h3>
        <form onSubmit={handleSubscribe} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ fontSize: "0.9rem", padding: "10px 12px" }}
          />
          <button type="submit" className="primary-btn" style={{ width: "100%", minHeight: "40px" }}>
            {subscribed ? "✓ Subscribed!" : "Subscribe"}
          </button>
        </form>
        <p style={{ fontSize: "0.85rem", marginTop: "8px" }}>
          Get weekly guidance updates and career tips directly to your inbox.
        </p>
      </div>
    </footer>
  );
}

