import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './ResumeHeroSection.css';
import InstallPWAButton from './InstallPWAButton';

export default function PremiumSectionHero({ 
  badgeText = ' NEW ON ATYANT🔥',
  mainTitle = 'Career Guides, No confusion',
  highlightText = '  SDE, Analytics, Product, Core & AI/ML',
  subText = 'Step-by-step guidance Roadmaps, projects, resources Prepration strategies & more',
  socialProofText = 'Join 1,200+ Tier-2 & Tier-3 students leveling up'
}) {
  const navigate = useNavigate();
  return (
    <section className="resume-hero-section">
      <div className="resume-hero-blob resume-hero-blob-1" />
      <div className="resume-hero-blob resume-hero-blob-2" />
      <div className="resume-hero-blob resume-hero-blob-3" />

      <div className="resume-hero-container">
        <motion.div 
          className="resume-hero-badge"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="resume-hero-badge-icon">🔥</span>
          {badgeText}
        </motion.div>

        <motion.h1 className="resume-hero-title" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          {mainTitle}
          <br />
          <span className="resume-hero-title-highlight">{highlightText}</span>
        </motion.h1>

        <motion.p className="resume-hero-subtitle" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          {subText}
        </motion.p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 16 }}>
          <motion.button onClick={() => navigate('/career-guides')} className="resume-hero-cta" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <span className="resume-hero-cta-text">Explore Career Guide</span>
          </motion.button>
          <InstallPWAButton />
        </div>
      </div>
    </section>
  );
}