// src/components/ResumeHeroSection.jsx
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './ResumeHeroSection.css';

const ResumeHeroSection = () => {
  const navigate = useNavigate();

  const stats = [
    ];
  const features = [
    { icon: "✅", text: "ATS-Friendly Designs" },
    { icon: "🎨", text: "Instant Google Slides Editing" },
    { icon: "🏆", text: "Used by IIT/IIM Students" }
  ];

  return (
    <section className="resume-hero-section">
      {/* Background Blobs */}
      <div className="resume-hero-blob resume-hero-blob-1"></div>
      <div className="resume-hero-blob resume-hero-blob-2"></div>
      <div className="resume-hero-blob resume-hero-blob-3"></div>

      <div className="resume-hero-container">
        {/* Badge */}
        <motion.div 
          className="resume-hero-badge"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="resume-hero-badge-icon">⚡</span>
           INDIA’S FIRST INSTANT EDIT RESUME SYSTEM
        </motion.div>

        {/* Main Heading */}
        <motion.h1 
          className="resume-hero-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Resume Links That Get You
          <br />
          <span className="resume-hero-title-highlight">Shortlisted & Selected</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          className="resume-hero-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Get a proven, ATS-friendly resume used by IIT/IIM students.
          <br />
          <strong>Buy → Edit → Download.</strong>
        </motion.p>

        {/* Features Grid */}
        <motion.div 
          className="resume-hero-features"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {features.map((feature, index) => (
            <div key={index} className="resume-hero-feature">
              <span className="resume-hero-feature-icon">{feature.icon}</span>
              <span className="resume-hero-feature-text">{feature.text}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.button
          className="resume-hero-cta"
          onClick={() => navigate('/resume-store')}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(99, 102, 241, 0.4)" }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="resume-hero-cta-text">Browse Resume Templates</span>
          <span className="resume-hero-cta-icon">→</span>
        </motion.button>

        {/* Stats */}
        <motion.div 
          className="resume-hero-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {stats.map((stat, index) => (
            <motion.div 
              key={index} 
              className="resume-hero-stat"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="resume-hero-stat-icon">{stat.icon}</div>
              <div className="resume-hero-stat-value">{stat.value}</div>
              <div className="resume-hero-stat-label">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Social Proof */}
        <motion.div 
          className="resume-hero-proof"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="resume-hero-proof-avatars">
            <div className="resume-hero-proof-avatar">👨‍🎓</div>
            <div className="resume-hero-proof-avatar">👩‍💼</div>
            <div className="resume-hero-proof-avatar">👨‍💻</div>
            <div className="resume-hero-proof-avatar">👩‍🔬</div>
          </div>
          <div className="resume-hero-proof-text">
            <strong>100+ students</strong> got shortlisted using our templates
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ResumeHeroSection;
