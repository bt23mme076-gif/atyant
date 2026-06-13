// src/components/NewHome.jsx
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Zap, 
  Brain, 
  ArrowRight,
  Menu,
  X,
  Sparkles,
  Target,
  Lightbulb,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import SEO from './SEO';

// ============================================
// NAVBAR COMPONENT
// ============================================
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Mentors', href: '/mentors' },
    { label: 'Career Guides', href: '/career-guides' },
    { label: 'Internships', href: '/internships' }
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-[#1E1E2E]' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button 
            onClick={() => navigate('/')}
            className="text-white font-bold text-xl tracking-tight hover:opacity-80 transition-opacity"
          >
            ATYANT
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  if (link.href.startsWith('/')) {
                    e.preventDefault();
                    navigate(link.href);
                  }
                }}
                className="text-[#888888] hover:text-white text-sm font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/ask')}
              className="bg-[#6C63FF] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#5A52E0] transition-all hover:scale-[1.03] flex items-center gap-2"
            >
              Ask a Question
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-[#111118] border-t border-[#1E1E2E]"
        >
          <div className="px-6 py-4 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  if (link.href.startsWith('/')) {
                    e.preventDefault();
                    navigate(link.href);
                  }
                  setMobileMenuOpen(false);
                }}
                className="block text-[#888888] hover:text-white text-sm font-medium"
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => {
                navigate('/login');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/5"
            >
              Login
            </button>
            <button
              onClick={() => {
                navigate('/ask');
                setMobileMenuOpen(false);
              }}
              className="block w-full bg-[#6C63FF] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#5A52E0]"
            >
              Ask a Question →
            </button>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

// ============================================
// HERO SECTION
// ============================================
const HeroSection = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-32 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[800px] h-[800px] bg-[#6C63FF] opacity-10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-5xl mx-auto text-center"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#6C63FF] bg-[#6C63FF]/10 text-[#6C63FF] text-sm font-medium mb-8">
          <Sparkles size={16} />
          AI-Powered Guidance for College Students
        </motion.div>

        {/* Main Headline */}
        <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6">
          <span className="text-white">Get Answers From Seniors</span>
          <br />
          <span className="text-white">Who Already </span>
          <span className="bg-gradient-to-r from-[#6C63FF] to-[#A78BFA] bg-clip-text text-transparent">
            Cracked It.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p variants={itemVariants} className="text-[#888888] text-lg md:text-xl max-w-3xl mx-auto mb-12">
          Atyant matches your exact problem with seniors who've solved it — and shows you step-by-step how they did it.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={() => navigate('/ask')}
            className="bg-[#6C63FF] text-white text-base font-semibold px-8 py-4 rounded-lg hover:bg-[#5A52E0] transition-all hover:scale-[1.03] flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            Ask Your First Question
            <ArrowRight size={20} />
          </button>
          <a
            href="#how-it-works"
            className="border border-white/20 text-white text-base font-semibold px-8 py-4 rounded-lg hover:bg-white/5 transition-all w-full sm:w-auto text-center"
          >
            See How It Works
          </a>
        </motion.div>

        {/* Trust Strip */}
        <motion.div variants={itemVariants} className="flex flex-col items-center gap-4">
          <p className="text-[#888888] text-sm">Trusted by students from</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {['IIT', 'NIT', 'BITS', 'MANIT', 'VNIT', 'DTU'].map((college) => (
              <span
                key={college}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm font-medium"
              >
                {college}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

// ============================================
// STATS BAR
// ============================================
const StatsBar = () => {
  const stats = [
    { number: '184+', label: 'Students Helped' },
    { number: '40+', label: 'Verified Mentors' },
    { number: '11+', label: 'Colleges Reached' }
  ];

  return (
    <section className="bg-[#111118] border-y border-[#1E1E2E] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:divide-x divide-[#1E1E2E]">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {stat.number}
              </div>
              <div className="text-[#888888] text-sm">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// HOW IT WORKS
// ============================================
const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      icon: Target,
      title: 'You Ask',
      description: 'One question with your college, branch, and goal'
    },
    {
      number: '02',
      icon: Brain,
      title: 'AI Processes',
      description: 'Context extracted, meaning understood'
    },
    {
      number: '03',
      icon: Zap,
      title: 'Smart Match',
      description: 'Vector search finds exact past solutions OR routes to best mentor'
    },
    {
      number: '04',
      icon: Lightbulb,
      title: 'AI Structures',
      description: 'Raw experience → Steps, timeline, mistakes, tips'
    },
    {
      number: '05',
      icon: CheckCircle,
      title: 'Your AnswerCard',
      description: 'Personalized, actionable, not generic'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-[#6C63FF]/10 border border-[#6C63FF]/30 text-[#6C63FF] text-xs font-semibold tracking-wider uppercase">
            THE PROCESS
          </span>
        </motion.div>

        {/* Section Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-white text-center mb-16"
        >
          From Question to Clarity — In Seconds
        </motion.h2>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#111118] border border-[#1E1E2E] border-l-4 border-l-[#6C63FF] rounded-2xl p-6 hover:border-[#6C63FF]/40 transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#6C63FF]/10 flex items-center justify-center">
                    <Icon size={20} className="text-[#6C63FF]" />
                  </div>
                  <span className="text-[#888888] text-sm font-bold">
                    STEP {step.number}
                  </span>
                </div>
                <h3 className="text-white text-lg font-bold mb-2">
                  {step.title}
                </h3>
                <p className="text-[#888888] text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ============================================
// WHY ATYANT
// ============================================
const WhyAtyant = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'Real Experience → Reusable Guidance',
      description: 'Senior journeys converted into structured AnswerCards. Not opinions. Proven paths.'
    },
    {
      icon: Zap,
      title: 'Instant Answers, Zero Waiting',
      description: 'If an AnswerCard exists, you get it in under 5 seconds. No chats. No delays.'
    },
    {
      icon: Brain,
      title: 'AI Routing. Human Truth.',
      description: 'Our AI decides who should answer — not what to answer. Always from real humans.'
    }
  ];

  return (
    <section className="py-24 px-6 bg-[#0A0A0F]">
      <div className="max-w-7xl mx-auto">
        {/* Section Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-[#6C63FF]/10 border border-[#6C63FF]/30 text-[#6C63FF] text-xs font-semibold tracking-wider uppercase">
            WHY ATYANT
          </span>
        </motion.div>

        {/* Section Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-white text-center mb-16"
        >
          Not Just Another Platform
        </motion.h2>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-8 hover:border-[#6C63FF]/40 transition-all group"
              >
                <div className="w-14 h-14 rounded-full bg-[#6C63FF]/10 flex items-center justify-center mb-6 group-hover:bg-[#6C63FF]/20 transition-colors">
                  <Icon size={28} className="text-[#6C63FF]" />
                </div>
                <h3 className="text-white text-xl font-bold mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#888888] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ============================================
// TESTIMONIALS
// ============================================
const Testimonials = () => {
  const testimonials = [
    { quote: 'Practical cheezein batate hain, bookish gyaan nahi.', name: 'Kiran Kumari', college: 'NIT Trichy' },
    { quote: 'It gave me more confidence in making decisions.', name: 'Palak Sharma', college: 'IIIT Hyderabad' },
    { quote: 'Bohot saare doubts jo pending the, ek hi jagah solve ho gaye.', name: 'Pratibha Thakur', college: 'NSUT Delhi' },
    { quote: 'Clarity milti hai bina awkward feel ke.', name: 'Israel Rodrigues', college: 'NIT Warangal' },
    { quote: 'The answers are actually useful in real situations.', name: 'Harsh Yadav', college: 'DTU Delhi' },
    { quote: 'It genuinely saves time.', name: 'Rahul Gupta', college: 'IIT Kanpur' },
    { quote: 'Pehli baar kisi platform pe itni clarity mili.', name: 'Kalash', college: 'BITS Pilani' },
    { quote: 'Bas jo chahiye wahi mil jata hai.', name: 'Vivek Bharti', college: 'XLRI Prep' },
    { quote: 'Practical advice instead of just theoretical talk.', name: 'Mohit Pathak', college: 'VIT Vellore' }
  ];

  // Duplicate for infinite scroll
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-white text-center"
        >
          What Students Are Saying
        </motion.h2>
      </div>

      {/* Scrolling Ticker */}
      <div className="relative">
        <div className="flex animate-scroll hover:pause-animation">
          {duplicatedTestimonials.map((testimonial, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-[400px] mx-3"
            >
              <div className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-6 h-full">
                <p className="text-white text-base mb-4 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#6C63FF] flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">
                      {testimonial.name}
                    </div>
                    <div className="text-[#888888] text-xs">
                      {testimonial.college}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// CTA SECTION
// ============================================
const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#6C63FF]/10 to-[#A78BFA]/10 border border-[#6C63FF]/30 rounded-3xl p-12 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Stop Guessing?
          </h2>
          <p className="text-[#888888] text-lg mb-8">
            Join 184+ students who are already getting clarity.
          </p>
          <button
            onClick={() => navigate('/ask')}
            className="bg-[#6C63FF] text-white text-lg font-semibold px-10 py-4 rounded-lg hover:bg-[#5A52E0] transition-all hover:scale-[1.03] inline-flex items-center gap-2"
          >
            Ask Your First Question
            <ArrowRight size={20} />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

// ============================================
// FOOTER
// ============================================
const Footer = () => {
  const navigate = useNavigate();

  const footerLinks = {
    Platform: [
      { label: 'Home', href: '/' },
      { label: 'Mentors', href: '/mentors' },
      { label: 'Career Guides', href: '/career-guides' },
      { label: 'Internships', href: '/internships' },
      { label: 'Resume Store', href: '/resume-store' }
    ],
    Company: [
      { label: 'About', href: '/about' },
      { label: 'Become a Mentor', href: '/mentor-dashboard' },
      { label: 'Blog', href: '/career-guides' }
    ],
    Connect: [
      { label: 'LinkedIn', href: 'https://linkedin.com/company/atyant', external: true },
      { label: 'Instagram', href: 'https://instagram.com/atyant.in', external: true },
      { label: 'Twitter', href: 'https://twitter.com/atyant_in', external: true }
    ]
  };

  return (
    <footer className="bg-[#0A0A0F] border-t border-[#1E1E2E] pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div>
            <h3 className="text-white font-bold text-xl mb-3">ATYANT</h3>
            <p className="text-[#888888] text-sm mb-4">
              From Confused to Confident.
            </p>
            <a 
              href="mailto:support@atyant.in"
              className="text-[#6C63FF] text-sm hover:underline"
            >
              support@atyant.in
            </a>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-3">
              {footerLinks.Platform.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.href)}
                    className="text-[#888888] text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.Company.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.href)}
                    className="text-[#888888] text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              Connect
            </h4>
            <ul className="space-y-3">
              {footerLinks.Connect.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#888888] text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <button
                      onClick={() => navigate(link.href)}
                      className="text-[#888888] text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#1E1E2E] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#888888] text-sm">
            © 2026 Atyant. All rights reserved.
          </p>
          <p className="text-[#888888] text-sm">
            Made with ❤️ in India
          </p>
        </div>
      </div>
    </footer>
  );
};

// ============================================
// MAIN HOMEPAGE COMPONENT
// ============================================
const NewHome = () => {
  return (
    <>
      <SEO 
        title="Atyant - Get Answers From Seniors Who Already Cracked It"
        description="AI-powered mentorship platform matching Indian college students with seniors who've solved their exact problems. Get step-by-step guidance from IIT, NIT, BITS students."
        keywords="college mentorship, senior guidance, IIT mentors, NIT mentors, career guidance, internship help, placement preparation, student mentorship India"
        url="https://www.atyant.in/"
      />
      
      <div className="bg-[#0A0A0F] min-h-screen">
        <Navbar />
        <HeroSection />
        <StatsBar />
        <HowItWorks />
        <WhyAtyant />
        <Testimonials />
        <CTASection />
        <Footer />
      </div>
    </>
  );
};

export default NewHome;
