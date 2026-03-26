import { motion } from "framer-motion";

export default function PremiumSectionHero({ 
  badgeText = "🔥 NEW ON ATYANT", 
  mainTitle = "Real career playbooks from students who",
  highlightText = "already cracked it",
  subText = "Stop guessing. Access the exact resumes, cold email scripts, and roadmaps used by students to land roles at IITs, IIMs, and Top MNCs.",
  socialProofText = "Join 1,200+ Tier-2 & Tier-3 students leveling up"
}) {
  return (
    <div style={{
      textAlign: "center",
      marginBottom: "2.5rem",
      borderRadius: 24,
      padding: "4rem 2rem",
      background: "linear-gradient(145deg, #f0f4ff 0%, #e9f0ff 45%, #f5e6ff 100%)",
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 10px 40px rgba(99,102,241,0.12)",
      border: "1px solid rgba(255,255,255,0.6)",
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Decorative Background Blobs */}
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "rgba(99,102,241,0.12)", filter: "blur(80px)", top: -120, left: -100, zIndex: 0 }} />
      <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: "rgba(168,85,247,0.1)", filter: "blur(80px)", bottom: -120, right: -100, zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* 1. Animated Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "inline-flex", alignItems: "center",
            background: "#fff7ed", border: "1.5px solid #fb923c",
            borderRadius: 30, fontSize: 11, color: "#9a3412",
            padding: "6px 18px", marginBottom: 24,
            fontWeight: 800, letterSpacing: "0.05em",
            boxShadow: "0 4px 12px rgba(245,158,11,0.1)",
          }}>
          {badgeText}
        </motion.div>

        {/* 2. Headline */}
        <h1 style={{
          fontSize: "clamp(2rem, 5vw, 3rem)",
          fontWeight: 900, color: "#0f172a",
          lineHeight: 1.15, marginBottom: 20,
          fontFamily: "Georgia, serif",
          maxWidth: "850px", margin: "0 auto 20px"
        }}>
          {mainTitle}
          <br />
          <span style={{ color: "#4f46e5", background: "linear-gradient(90deg, #4f46e5, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {highlightText}
          </span>
        </h1>

        {/* 3. Subtext */}
        <p style={{ fontSize: "1.1rem", color: "#475569", maxWidth: 650, margin: "0 auto 35px", lineHeight: 1.7 }}>
          {subText}
        </p>

        {/* 4. Two CTA Buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap", marginBottom: "30px" }}>
          <button style={{
            background: "#4f46e5", color: "#fff", border: "none",
            padding: "14px 28px", borderRadius: 12, fontSize: "16px",
            fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 25px rgba(79,70,229,0.3)"
          }}>
            Explore Playbooks
          </button>
          <button style={{
            background: "#fff", border: "1px solid #e2e8f0",
            padding: "14px 28px", borderRadius: 12, fontSize: "16px",
            fontWeight: 600, color: "#334155", cursor: "pointer"
          }}>
            How it Works
          </button>
        </div>

        {/* 5. Trust Indicator / Social Proof */}
        <div style={{ 
          marginTop: "20px", 
          fontSize: "14px", 
          color: "#64748b", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          gap: "8px" 
        }}>
          <span style={{ display: "flex", alignItems: "center" }}>
            {/* Simple dot for active users look */}
            <span style={{ height: 8, width: 8, backgroundColor: "#22c55e", borderRadius: "50%", display: "inline-block", marginRight: 8 }}></span>
            {socialProofText}
          </span>
        </div>
      </div>
    </div>
  );
}