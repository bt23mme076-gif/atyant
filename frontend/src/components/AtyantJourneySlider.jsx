// src/components/AtyantJourneySlider.jsx
import React, { useState, useEffect } from 'react';
import './AtyantJourneySlider.css';

const AtyantJourneySlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // 📸 Campus photos array - Cloudinary hosted images + YouTube video
  // SEO-optimized with detailed alt text and descriptions
  const campusPhotos = [
    { 
      id: 1, 
      src: 'https://res.cloudinary.com/dny6dtmox/image/upload/v1770470901/Screenshot_2026-02-07_180016_waytsl.png', 
      caption: 'Atyant Journey 💻', 
      type: 'image',
      alt: 'Atyant AI-powered student mentorship platform journey - connecting students with senior mentors for career guidance',
      description: 'Overview of Atyant platform helping students with AI-matched senior mentorship and career roadmaps'
    },
    { 
      id: 2, 
      src: 'https://res.cloudinary.com/dny6dtmox/image/upload/v1770470902/IMG_20251107_172259_sewvlp.jpg', 
      caption: 'Campus Moments PCE 🎓', 
      type: 'image',
      alt: 'Atyant campus workshop at PCE - students learning about internships and placements guidance',
      description: 'Atyant conducting mentorship workshop at PCE campus for placement preparation'
    },
    { 
      id: 3, 
      src: 'https://res.cloudinary.com/dny6dtmox/image/upload/v1770472116/IMG_20251107_164843_1_xvslan.jpg', 
      caption: 'Workshop Sessions At GHRC', 
      type: 'image',
      alt: 'Atyant career guidance workshop at GHRC - student mentor interaction sessions',
      description: 'Interactive mentorship workshop at GHRC where students connect with experienced seniors'
    },
    { 
      id: 4, 
      src: 'https://res.cloudinary.com/dny6dtmox/image/upload/v1770470902/IMG_20251107_164833_bbtgnf.jpg', 
      caption: 'Campus Moments GHRC 🎓', 
      type: 'image',
      alt: 'Atyant team at GHRC campus - building student mentorship community',
      description: 'Atyant building strong peer-to-peer learning community at GHRC engineering college'
    },
    { 
      id: 5, 
      src: 'https://res.cloudinary.com/dny6dtmox/image/upload/v1770470902/IMG_20260202_140753_vb8fj4.jpg', 
      caption: 'ATYANT AT MANIT 🔥', 
      type: 'image',
      alt: 'Atyant at MANIT Bhopal - NIT student mentorship and placement guidance program',
      description: 'Atyant expanding to MANIT Bhopal NIT, providing AI-powered career guidance to engineering students'
    },
    { 
      id: 6, 
      src: 'https://res.cloudinary.com/dny6dtmox/image/upload/v1770470902/IMG_20260202_135846_hk6fyi.jpg', 
      caption: 'ECELL MANIT + ATYANT Together 📚', 
      type: 'image',
      alt: 'Atyant partnership with E-Cell MANIT for entrepreneurship and career mentorship',
      description: 'Strategic collaboration between Atyant and E-Cell MANIT for student career development'
    },
    { 
      id: 7, 
      src: 'https://res.cloudinary.com/dny6dtmox/image/upload/v1770470902/IMG_20251101_175501_fqxko5.jpg', 
      caption: 'Innovation INTER NIT\'25 🚀', 
      type: 'image',
      alt: 'Atyant at Inter NIT 2025 - showcasing AI student mentorship platform to NITs across India',
      description: 'Atyant presenting innovative AI-powered mentorship solution at Inter NIT Innovation Summit 2025'
    },
    { 
      id: 8, 
      src: 'https://res.cloudinary.com/dny6dtmox/image/upload/v1770470903/IMG_20260202_140103_zkemae.jpg', 
      caption: 'Workshop Sessions 💡', 
      type: 'image',
      alt: 'Atyant interactive workshop on placement preparation and career roadmaps',
      description: 'Students engaging in Atyant workshop learning about structured career guidance and mentorship'
    },
    { 
      id: 9, 
      src: 'https://res.cloudinary.com/dny6dtmox/image/upload/v1770470903/Screenshot_2026-02-07_180106_yynpqs.png', 
      caption: 'Growth & Success 🎯', 
      type: 'image',
      alt: 'Atyant platform growth metrics - successful student mentor connections and career outcomes',
      description: 'Demonstrating Atyant impact through student success stories and mentorship outcomes'
    },
    { 
      id: 10, 
      src: 'https://www.youtube.com/embed/NziKXiqjqBQ', 
      caption: 'Watch Our Journey 🎥', 
      type: 'video',
      alt: 'Atyant journey video - how AI matches students with senior mentors for career success',
      description: 'Video showcasing Atyant complete journey in revolutionizing student mentorship through AI'
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

  // Generate Schema.org structured data for SEO
  const generateSchemaMarkup = () => {
    const imageObjects = campusPhotos
      .filter(photo => photo.type === 'image')
      .map(photo => ({
        "@type": "ImageObject",
        "contentUrl": photo.src,
        "description": photo.description,
        "name": photo.caption,
        "caption": photo.caption
      }));

    const schema = {
      "@context": "https://schema.org",
      "@type": "ImageGallery",
      "name": "Atyant Journey - Student Mentorship Platform Campus Activities",
      "description": "Photo gallery showcasing Atyant AI-powered student mentorship platform journey across top engineering colleges including MANIT, VNIT, GHRC, and PCE. Features workshops, mentorship sessions, and student success stories.",
      "image": imageObjects,
      "author": {
        "@type": "Organization",
        "name": "Atyant",
        "url": "https://atyant.in"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Atyant",
        "url": "https://atyant.in",
        "logo": {
          "@type": "ImageObject",
          "url": "https://atyant.in/favicon.png"
        }
      }
    };

    return schema;
  };

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
      itemScope 
      itemType="https://schema.org/ImageGallery"
      aria-label="Atyant Journey Photo Gallery"
    >
      {/* Schema.org Structured Data for Rich Snippets */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateSchemaMarkup()) }}
      />

      <div className="journey-container">
        {/* 🎯 SEO-Optimized Heading with Semantic HTML */}
        <header className="journey-header">
          <div className="heading-wrapper">
            <span className="heading-icon" aria-hidden="true">✨</span>
            <h2 className="journey-title" itemProp="name">
              My Journey with Atyant: Student Mentorship Success Stories
            </h2>
            <span className="heading-icon" aria-hidden="true">✨</span>
          </div>
          <p className="journey-subtitle" itemProp="description">
            Discover Atyant journey across top engineering colleges - MANIT, VNIT, GHRC, PCE. 
            Witness how AI-powered mentorship transforms student careers through workshops, 
            mentor connections, and placement guidance 📸
          </p>
          
          {/* SEO Content - Hidden but crawlable */}
          <div className="seo-content" style={{ position: 'absolute', left: '-9999px' }}>
            <h3>About This Gallery</h3>
            <p>
              This photo gallery showcases Atyant platform journey in revolutionizing student 
              mentorship across India premier engineering institutions. From workshops at GHRC 
              to partnerships with E-Cell MANIT, see how we connecting students with senior 
              mentors for internship guidance, placement preparation, and career roadmaps.
            </p>
            <p>
              Features include: AI-powered mentor matching, campus workshops, Inter NIT presentations, 
              student success stories, and community building at top engineering colleges. 
              Keywords: student mentorship, career guidance, placement preparation, internship help, 
              senior advice, engineering college mentorship, AI career guidance India.
            </p>
          </div>
        </header>

        {/* 🎨 Slider Container with 3D Effect and SEO Optimization */}
        <div className="slider-wrapper" role="region" aria-roledescription="carousel" aria-label="Atyant Journey Image Carousel">
          <div 
            className="slides-container"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            role="group"
            aria-live="polite"
            aria-atomic="false"
          >
            {campusPhotos.map((photo, index) => (
              <article 
                key={photo.id} 
                className={`slide ${index === currentSlide ? 'active' : ''}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`Slide ${index + 1} of ${campusPhotos.length}: ${photo.caption}`}
                aria-hidden={index !== currentSlide}
                itemProp="associatedMedia"
                itemScope
                itemType="https://schema.org/ImageObject"
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
                      itemProp="contentUrl"
                    />
                  ) : (
                    <>
                      <img 
                        src={photo.src} 
                        alt={photo.alt}
                        title={photo.caption}
                        className="slide-image"
                        loading={index === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                        itemProp="contentUrl"
                        width="1200"
                        height="675"
                      />
                      <meta itemProp="name" content={photo.caption} />
                      <meta itemProp="description" content={photo.description} />
                    </>
                  )}
                  <div className="slide-overlay">
                    <p className="slide-caption" itemProp="caption">{photo.caption}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* 🎮 Navigation Controls with Accessibility */}
          <button 
            className="nav-btn prev-btn" 
            onClick={prevSlide}
            aria-label="View previous slide in Atyant journey gallery"
            aria-controls="journey-slides"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button 
            className="nav-btn next-btn" 
            onClick={nextSlide}
            aria-label="View next slide in Atyant journey gallery"
            aria-controls="journey-slides"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* 🔵 Dot Indicators with Semantic Labels */}
          <div className="dots-container" role="tablist" aria-label="Gallery slide selection">
            {campusPhotos.map((photo, index) => (
              <button
                key={index}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                role="tab"
                aria-label={`Go to slide ${index + 1}: ${photo.caption}`}
                aria-selected={index === currentSlide}
                aria-controls={`slide-${index}`}
                tabIndex={index === currentSlide ? 0 : -1}
              />
            ))}
          </div>

          {/* ⏯️ Auto-play Toggle with Clear Labels */}
          <button 
            className="autoplay-toggle"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            aria-label={isAutoPlaying ? 'Pause automatic slideshow' : 'Play automatic slideshow'}
            aria-pressed={isAutoPlaying}
          >
            {isAutoPlaying ? '⏸️' : '▶️'}
          </button>
        </div>

        {/* 📊 Slide Counter with Semantic HTML */}
        <div className="slide-counter" role="status" aria-live="polite" aria-atomic="true">
          <span className="current-slide" aria-label="Current slide">{currentSlide + 1}</span>
          <span className="counter-divider" aria-hidden="true">/</span>
          <span className="total-slides" aria-label="Total slides">{campusPhotos.length}</span>
        </div>
      </div>
    </section>
  );
};

export default AtyantJourneySlider;
