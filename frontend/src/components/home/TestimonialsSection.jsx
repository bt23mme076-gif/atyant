import React from "react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Priya Sharma",
      college: "IIT Mumbai",
      role: "Data Analytics Intern @ Flipkart",
      avatar: "PS",
      text: "Atyant connected me with a senior who had already landed a data analytics role. Her roadmap saved me 3 months of confusion. Now I'm prepping my projects with confidence.",
      rating: 5,
    },
    {
      name: "Arjun Patel",
      college: "NIT Surat",
      role: "Software Engineer @ Amazon",
      avatar: "AP",
      text: "The DSA roadmap I got from a verified senior was game-changing. Not just theory, but real coding patterns companies actually look for. Landed Amazon SDE role.",
      rating: 5,
    },
    {
      name: "Zara Khan",
      college: "Delhi University",
      role: "Product Manager Intern @ OYO",
      avatar: "ZK",
      text: "Coming from a non-CS background, I was lost on the PM track. Atyant's matching algorithm found perfect seniors who guided me. Now interning at OYO!",
      rating: 5,
    },
    {
      name: "Rahul Verma",
      college: "IIT Delhi",
      role: "ML Engineer @ DeepMind",
      avatar: "RV",
      text: "The ML projects recommended by verified seniors helped me build a strong portfolio. The guidance was practical, not theoretical. Best investment in my career.",
      rating: 5,
    },
  ];

  const renderStars = (rating) => {
    return (
      <div style={{ color: "#f5a623", fontSize: "1.1rem", letterSpacing: "2px" }}>
        {"★".repeat(rating)}
      </div>
    );
  };

  return (
    <section
      className="section"
      style={{
        paddingTop: "80px",
        paddingBottom: "80px",
        borderTop: "1px solid var(--cardBorder)",
      }}
      id="testimonials"
    >
      <div className="section-heading compact" style={{ marginBottom: "60px" }}>
        <p className="eyebrow">Student Success Stories</p>
        <h2>Real guidance from real students who've cracked it.</h2>
        <p>
          Hear from students who used Atyant to navigate internships, placements, and career decisions.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="feature-card"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {renderStars(testimonial.rating)}

            <p
              style={{
                color: "var(--textSub)",
                lineHeight: "1.7",
                flex: 1,
                fontStyle: "italic",
              }}
            >
              "{testimonial.text}"
            </p>

            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "12px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #7567c9, #8e80db)",
                  display: "grid",
                  placeItems: "center",
                  color: "white",
                  fontWeight: "800",
                  fontSize: "0.9rem",
                }}
              >
                {testimonial.avatar}
              </div>
              <div>
                <p style={{ margin: "0", fontWeight: "800", color: "var(--text)" }}>
                  {testimonial.name}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--accentText)" }}>
                  {testimonial.role}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "var(--textMuted)" }}>
                  {testimonial.college}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
