// src/components/AtyantJourneySlider.jsx
import React, { useState, useEffect } from 'react';
import './AtyantJourneySlider.css';

const AtyantJourneySlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // 📸 Campus photos array - Cloudinary hosted images + YouTube video
  const campusPhotos = [
    { 
      id: 1, 
      src: 'https://res.cloudinary.com/dny6dtmox/image/upload/v1773683474/Yellow_Modern_Untold_Mystery_YouTube_Thumbnail_5_1_eyzls9.png', 
      caption: 'Atyant AI Trajectory 💻', 
      type: 'image',
      alt: 'Atyant AI-powered placement platform - connecting students with verified internship roadmaps',
      description: 'Overview of Atyant AI platform helping students with intelligent internship and placement algorithms'
    },
    { 
      id: 11, 
      src: 'https://www.youtube.com/embed/40RwkrtP4dA', 
      caption: 'IIM Mumbai Direct Match 🎯', 
      type: 'video',
      alt: 'Atyant student testimonial - How he secured IIM Mumbai internship with Atyant AI capabilities',
      description: 'Video testimonial showcasing how Atyant matched a student perfectly for an internship at IIM Mumbai'
    },
    { 
      id: 2, 
      src: 'https://res.cloudinary.com/dny6dtmox/image/upload/v1773681257/IMG_20251107_172259_sgixft.jpg', 
      caption: 'PCE Placement Drive 🎓', 
      type: 'image',
      alt: 'Atyant campus workshop at PCE - students learning about AI placement and resume parsing',
      description: 'Atyant conducting placement preparation using data-backed resume frameworks at PCE'
    },
    { 
      id: 3, 
      src: 'https://res.cloudinary.com/dny6dtmox/image/upload/v1773680981/WhatsApp_Image_2026-03-16_at_10.38.48_PM_pc7vaj.jpg', 
      caption: 'GHRC AI Roadmap Sessions', 
      type: 'image',
      alt: 'Atyant career trajectory engine workshop at GHRC',
      description: 'Interactive AI roadmap session at GHRC where students connect with exactly matched senior solutions'
    },
    { 
      id: 5, 
      src: 'https://res.cloudinary.com/dny6dtmox/image/upload/v1773682691/IMG_20260202_140103_1_pqtfmc.jpg', 
      caption: 'ATYANT AT MANIT 🔥', 
      type: 'image',
      alt: 'Atyant at MANIT Bhopal - NIT student placement and tech internship optimization',
      description: 'Atyant expanding to MANIT Bhopal NIT, providing exact placement matching data'
    },
    { 
      id: 6, 
      src: 'https://res.cloudinary.com/dny6dtmox/image/upload/v1773680772/IMG_20260202_135846_bf3lyw.jpg', 
      caption: 'ECELL MANIT + ATYANT Tech 📚', 
      type: 'image',
      alt: 'Atyant partnership with E-Cell MANIT for AI software placements',
      description: 'Strategic collaboration between Atyant and E-Cell MANIT for quantitative career development'
    },
    { 
      id: 9, 
      src: 'https://res.cloudinary.com/dny6dtmox/image/upload/v1770470903/Screenshot_2026-02-07_180106_yynpqs.png', 
      caption: 'Algorithmic Growth 🎯', 
      type: 'image',
      alt: 'Atyant platform growth metrics - accurate student outcome matching',
      description: 'Demonstrating Atyant impact through data points and placement successes'
    },
    { 
      id: 10, 
      src: 'https://www.youtube.com/embed/gLkwflzjU88', 
      caption: 'Watch Our Platform Pitch 🎥', 
      type: 'video',
      alt: 'Atyant First Pitch - how our engine resolves student blockers for career success',
      description: 'Video showcasing Atyant AI architecture revolutionizing student placements'
    },
  ];

  // Auto-slide effect
  useEffect(() => {
    if (!isAutoPlaying || campusPhotos.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % campusPhotos.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, campusPhotos.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % campusPhotos.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + campusPhotos.length) % campusPhotos.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  return (
    <section 
      className="journey-slider-section" 
      aria-label="Atyant Journey Photo Gallery"
    >
      <div className="journey-grid-pattern"></div>
      <div className="journey-container">
        
        {/* 🎯 SEO-Optimized Heading */}
        <header className="journey-header">
          <div className="heading-wrapper">
          <span className="journey-badge">DATA & OUTCOMES</span>
          </div>
          <h2 className="journey-title">
            The Atyant Trajectory: <br/>
            <span className="journey-title-highlight">Proven Internship & Placement Outcomes</span>
          </h2>
          <p className="journey-subtitle">
            See the real-world tech and product outcomes built through our career analytics engine.
          </p>
        </header>

        {/* 🎨 Slider Container */}
        <div className="slider-wrapper" role="region" aria-roledescription="carousel" aria-label="Atyant Journey Image Carousel">
          <div 
            className="slides-container"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            role="group"
            aria-live="polite"
          >
            {campusPhotos.map((photo, index) => (
              <article 
                key={photo.id} 
                className={`slide ${index === currentSlide ? 'active' : ''}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`Slide ${index + 1} of ${campusPhotos.length}: ${photo.caption}`}
                aria-hidden={index !== currentSlide}
              >
                <div className="slide-image-wrapper">
                  {photo.type === 'video' ? (
                    <iframe
                      src={photo.src}
                      title={photo.alt}
                      className="slide-video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  ) : (
                    <>
                      <img 
                        src={photo.src} 
                        alt={photo.alt}
                        title={photo.caption}
                        className="slide-image"
                        loading={index === 0 ? 'eager' : 'lazy'}
                        width="1200"
                        height="675"
                      />
                    </>
                  )}
                  <div className="slide-overlay">
                    <p className="slide-caption">{photo.caption}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* 🎮 Navigation Controls */}
          <button 
            className="nav-btn prev-btn" 
            onClick={prevSlide}
            aria-label="View previous slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button 
            className="nav-btn next-btn" 
            onClick={nextSlide}
            aria-label="View next slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* 🔵 Dot Indicators */}
          <div className="dots-container" role="tablist">
            {campusPhotos.map((photo, index) => (
              <button
                key={index}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                role="tab"
                aria-label={`Go to slide ${index + 1}`}
                aria-selected={index === currentSlide}
                tabIndex={index === currentSlide ? 0 : -1}
              />
            ))}
          </div>

          {/* ⏯️ Auto-play Toggle */}
          <button 
            className="autoplay-toggle"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            aria-label={isAutoPlaying ? 'Pause automatic slideshow' : 'Play automatic slideshow'}
          >
            {isAutoPlaying ? '⏸️' : '▶️'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default AtyantJourneySlider;
