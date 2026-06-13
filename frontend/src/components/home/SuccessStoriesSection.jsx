import React from "react";

export default function SuccessStoriesSection() {
  const stories = [
    {
      id: 1,
      title: "From Confused to Data Analyst in 4 Months",
      description:
        "Priya was lost between analytics and engineering. An Atyant-matched senior helped her focus on SQL, Python, and portfolio building.",
      stats: ["4 months to goal", "3 projects built", "Flipkart offer"],
      category: "Analytics",
      icon: "📊",
    },
    {
      id: 2,
      title: "DSA Bootcamp: Internship to Offer",
      description:
        "Arjun needed DSA clarity. Connected with a senior engineer, he followed a 12-week roadmap and went from first internship to full-time SDE offer.",
      stats: ["12-week journey", "100+ problems solved", "Amazon SDE"],
      category: "Software Development",
      icon: "💻",
    },
    {
      id: 3,
      title: "Non-CS to PM: Breaking Into Product",
      description:
        "Zara's background wasn't CS, but her PM dreams were real. Atyant paired her with a PM mentor who showed her the actual PM pathway.",
      stats: ["6-month prep", "2 case studies", "OYO internship"],
      category: "Product",
      icon: "🚀",
    },
    {
      id: 4,
      title: "AI/ML Portfolio: From Notebook to Offer",
      description:
        "Rahul had ML knowledge but no portfolio. A verified ML engineer showed him how to turn projects into a standout portfolio for top companies.",
      stats: ["4 ML projects", "GitHub showcase", "DeepMind role"],
      category: "AI/ML",
      icon: "🤖",
    },
    {
      id: 5,
      title: "Placement Clarity: Multiple Offers Achieved",
      description:
        "Multiple students used Atyant to navigate the placement season. With clear roadmaps from seniors, they received 3-5 offers each.",
      stats: ["3-5 offers each", "Multiple rounds cleared", "Dream companies"],
      category: "Placements",
      icon: "🎯",
    },
    {
      id: 6,
      title: "Internship Hunt: Off-Campus to Goldman Sachs",
      description:
        "Starting from scratch, an engineering student followed guidance from a GS intern. Through projects and referrals, landed the same company.",
      stats: ["6 months", "2 projects", "Goldman Sachs"],
      category: "Internships",
      icon: "🏆",
    },
  ];

  return (
    <section
      className="section"
      style={{
        paddingTop: "80px",
        paddingBottom: "80px",
        borderTop: "1px solid var(--cardBorder)",
      }}
      id="success-stories"
    >
      <div className="section-heading compact" style={{ marginBottom: "60px" }}>
        <p className="eyebrow">Case Studies</p>
        <h2>How students transformed their careers with Atyant.</h2>
        <p>
          Real journeys, real outcomes. Here's how Atyant-guided students moved from confusion to clarity to offers.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
          maxWidth: "1300px",
          margin: "0 auto",
        }}
      >
        {stories.map((story) => (
          <div
            key={story.id}
            className="feature-card"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-20px",
                right: "-20px",
                fontSize: "80px",
                opacity: 0.1,
              }}
            >
              {story.icon}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ fontSize: "2.5rem" }}>{story.icon}</div>
              <span
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  background: "rgba(117, 103, 201, 0.2)",
                  border: "1px solid #443a6b",
                  borderRadius: "999px",
                  color: "var(--accentText)",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {story.category}
              </span>
            </div>

            <h3 style={{ margin: "8px 0 0", fontSize: "1.15rem", lineHeight: "1.4" }}>
              {story.title}
            </h3>

            <p
              style={{
                color: "var(--textSub)",
                fontSize: "0.95rem",
                lineHeight: "1.6",
                flex: 1,
              }}
            >
              {story.description}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px",
                paddingTop: "16px",
                borderTop: "1px solid var(--cardBorder)",
              }}
            >
              {story.stats.map((stat, index) => (
                <div key={index} style={{ textAlign: "center" }}>
                  <p style={{ margin: "0", color: "var(--accentText)", fontWeight: "700", fontSize: "0.9rem" }}>
                    {stat}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        className="primary-btn centered"
        onClick={() => document.querySelector("#contact").scrollIntoView({ behavior: "smooth" })}
        style={{ marginTop: "50px" }}
      >
        Start Your Story
      </button>
    </section>
  );
}
