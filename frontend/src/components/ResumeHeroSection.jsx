// src/components/ResumeHeroSection.jsx
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './ResumeHeroSection.css';

const ResumeHeroSection = () => {
  const navigate = useNavigate();

  const features = [
    { icon: "🧠", text: "AI-Powered ATS Matching" },
    { icon: "🚀", text: "Optimized for Tech & Product Roles" },
    { icon: "📊", text: "Data-Backed Architectures" }
  ];

  return (
    <section className="resume-hero-section">
      {/* AI Futuristic Blobs */}
      <div className="resume-hero-blob resume-hero-blob-1"></div>
      <div className="resume-hero-blob resume-hero-blob-2"></div>
      <div className="resume-hero-blob resume-hero-blob-3"></div>

      <div className="resume-hero-container">
        {/* Badge */}
        <motion.div 
          className="resume-hero-badge"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="resume-hero-badge-icon">⚡</span>
           PLACEMENT INTELLIGENCE SYSTEM
        </motion.div>

        {/* Main Heading */}
        <motion.h1 
          className="resume-hero-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Resume Architectures Built for
          <br />
          <span className="resume-hero-title-highlight">Algorithmic Shortlisting</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          className="resume-hero-subtitle"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Stop getting rejected by automated filters. Our engine provides high-fidelity, computationally optimized resume frameworks guaranteed to bypass ATS for internships and placements.
        </motion.p>

        {/* Features Grid */}
        <motion.div 
          className="resume-hero-features"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
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
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)" }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="resume-hero-cta-text">Access Resume Intelligence</span>
          <span className="resume-hero-cta-icon">→</span>
        </motion.button>
      </div>
    </section>
  );
};

export default ResumeHeroSection;
