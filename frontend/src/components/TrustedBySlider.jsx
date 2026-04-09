// src/components/TrustedBySlider.jsx
import React from 'react';
import './TrustedBySlider.css';

const TrustedBySlider = () => {
  // The user will add images to the public folder. 
  // We use placeholder names here so the user can just replace/add them as needed.
  // Example: '/college1.png', '/college2.png', etc.
  const logos = [
    { id: 1, src: '/vnit.png', alt: 'VNIT' },
    { id: 2, src: '/ghrc.png', alt: 'GHRC' },
    { id: 3, src: '/manit.png', alt: 'MANIT' },
    { id: 4, src: '/lnct.png', alt: 'LNCT' },
    { id: 5, src: '/iim-mumbai.png', alt: 'IIM MUMBAI' },
    { id: 6, src: '/bits-pilani.png', alt: 'BITS PILANI' },
  ];

  return (
    <section className="trusted-section">
      <div className="trusted-container">

        <h2 className="trusted-title">Trusted Across Top Campuses</h2>


        <div className="trusted-slider-wrapper">
          <div className="trusted-slider-track">
            {/* First Set of Logos */}
            {logos.map((logo) => (
              <div key={`first-${logo.id}`} className="trusted-logo-item">
                <img src={logo.src} alt={logo.alt} className="trusted-logo-img" onError={(e) => {
                  // Fallback if image doesn't exist yet
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }} />
                {/* Fallback Text if Image Fails to Load */}
                <div className="trusted-logo-fallback" style={{ display: 'none' }}>
                  {logo.alt}
                </div>
              </div>
            ))}

            {/* Second Set of Logos (for infinite scrolling effect) */}
            {logos.map((logo) => (
              <div key={`second-${logo.id}`} className="trusted-logo-item">
                <img src={logo.src} alt={logo.alt} className="trusted-logo-img" onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }} />
                <div className="trusted-logo-fallback" style={{ display: 'none' }}>
                  {logo.alt}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default TrustedBySlider;
