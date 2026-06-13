import React, { useState, useEffect } from "react";

function Counter({ value, label }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let timeout;
    if (count < value) {
      timeout = setTimeout(() => {
        const increment = Math.ceil(value / 50);
        setCount(Math.min(count + increment, value));
      }, 30);
    }
    return () => clearTimeout(timeout);
  }, [count, value]);

  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          fontSize: "clamp(2rem, 4vw, 3.5rem)",
          fontWeight: "900",
          background: "linear-gradient(135deg, #7567c9, #8e80db)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: "8px",
        }}
      >
        {count.toLocaleString()}+
      </div>
      <p style={{ color: "var(--textSub)", fontSize: "1rem", margin: 0 }}>{label}</p>
    </div>
  );
}

export default function StatisticsSection() {
  const stats = [
    { value: 500, label: "Students Guided" },
    { value: 85, label: "Success Rate %" },
    { value: 120, label: "Placements Secured" },
    { value: 95, label: "Internships Landed" },
  ];

  return (
    <section
      className="section"
      style={{
        paddingTop: "80px",
        paddingBottom: "80px",
        borderTop: "1px solid var(--cardBorder)",
      }}
      id="stats"
    >
      <div className="section-heading compact" style={{ marginBottom: "60px" }}>
        <p className="eyebrow">Impact & Results</p>
        <h2>Proven outcomes for students across India.</h2>
        <p>
          Atyant has helped hundreds of students land internships, secure placements, and achieve career clarity through AI-matched senior guidance.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "40px",
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "0 20px",
        }}
      >
        {stats.map((stat, index) => (
          <Counter key={index} value={stat.value} label={stat.label} />
        ))}
      </div>

      <p
        style={{
          textAlign: "center",
          color: "var(--textSub)",
          marginTop: "60px",
          fontSize: "1rem",
          lineHeight: "1.6",
        }}
      >
        Every student deserves guidance from someone who's walked the same path.
        <br />
        <strong style={{ color: "var(--accentText)" }}>Atyant makes that connection possible.</strong>
      </p>
    </section>
  );
}
