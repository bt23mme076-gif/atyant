// src/components/AtyantJourneySlider.jsx
import React, { useState, useEffect } from 'react';
import './AtyantJourneySlider.css';

const AtyantJourneySlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // 📸 Campus photos array - Cloudinary hosted images + YouTube video
  const campusPhotos = [
    { id: 1, src: 'https://res.cloudinary.com/dny6dtmox/image/upload/v1770470901/Screenshot_2026-02-07_180016_waytsl.png', caption: 'Atyant Journey 💻', type: 'image' },
    { id: 2, src: 'https://res.cloudinary.com/dny6dtmox/image/upload/v1770470902/IMG_20251107_172259_sewvlp.jpg', caption: 'Campus Moments pce🎓 ', type: 'image' },
    { id: 3, src: 'https://res.cloudinary.com/dny6dtmox/image/upload/v1770472116/IMG_20251107_164843_1_xvslan.jpg', caption: 'Workshop Sessions At GHRC', type: 'image' },
    { id: 4, src: 'https://res.cloudinary.com/dny6dtmox/image/upload/v1770470902/IMG_20251107_164833_bbtgnf.jpg', caption: 'Campus Moments GHRC🎓', type: 'image' },
    { id: 5, src: 'https://res.cloudinary.com/dny6dtmox/image/upload/v1770470902/IMG_20260202_140753_vb8fj4.jpg', caption: 'ATYANT AT MANIT🔥', type: 'image' },
    { id: 6, src: 'https://res.cloudinary.com/dny6dtmox/image/upload/v1770470902/IMG_20260202_135846_hk6fyi.jpg', caption: 'ECELL MANIT + ATYANT Together 📚', type: 'image' },
    { id: 7, src: 'https://res.cloudinary.com/dny6dtmox/image/upload/v1770470902/IMG_20251101_175501_fqxko5.jpg', caption: 'Innovation INTER NIT\'25🚀', type: 'image' },
    { id: 8, src: 'https://res.cloudinary.com/dny6dtmox/image/upload/v1770470903/IMG_20260202_140103_zkemae.jpg', caption: 'Workshop Sessions 💡', type: 'image' },
    { id: 9, src: 'https://res.cloudinary.com/dny6dtmox/image/upload/v1770470903/Screenshot_2026-02-07_180106_yynpqs.png', caption: 'Growth & Success 🎯', type: 'image' },
    { id: 10, src: 'https://www.youtube.com/embed/NziKXiqjqBQ', caption: 'Watch Our Journey 🎥', type: 'video' },
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
    <section className="journey-slider-section">
      <div className="journey-container">
        {/* 🎯 Exciting Heading with Animation */}
        <div className="journey-header">
          <div className="heading-wrapper">
            <span className="heading-icon">✨</span>
            <h2 className="journey-title">My Journey with Atyant</h2>
            <span className="heading-icon">✨</span>
          </div>
          <p className="journey-subtitle">Capturing moments that shaped my path 📸</p>
        </div>

        {/* 🎨 Slider Container with 3D Effect */}
        <div className="slider-wrapper">
          <div 
            className="slides-container"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {campusPhotos.map((photo, index) => (
              <div 
                key={photo.id} 
                className={`slide ${index === currentSlide ? 'active' : ''}`}
              >
                <div className="slide-image-wrapper">
                  {photo.type === 'video' ? (
                    <iframe
                      src={photo.src}
                      title={photo.caption}
                      className="slide-video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <img 
                      src={photo.src} 
                      alt={photo.caption}
                      className="slide-image"
                    />
                  )}
                  <div className="slide-overlay">
                    <p className="slide-caption">{photo.caption}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 🎮 Navigation Controls */}
          <button className="nav-btn prev-btn" onClick={prevSlide}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="nav-btn next-btn" onClick={nextSlide}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* 🔵 Dot Indicators */}
          <div className="dots-container">
            {campusPhotos.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* ⏯️ Auto-play Toggle */}
          <button 
            className="autoplay-toggle"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            aria-label={isAutoPlaying ? 'Pause slideshow' : 'Play slideshow'}
          >
            {isAutoPlaying ? '⏸️' : '▶️'}
          </button>
        </div>

        {/* 📊 Slide Counter */}
        <div className="slide-counter">
          <span className="current-slide">{currentSlide + 1}</span>
          <span className="counter-divider">/</span>
          <span className="total-slides">{campusPhotos.length}</span>
        </div>
      </div>
    </section>
  );
};

export default AtyantJourneySlider;
