import React, { useState, useEffect } from 'react';
import { optimizeCloudinaryImage, getCloudinaryBlurUrl } from '../utils/cloudinaryHelper';

const OptimizedImage = ({ src, alt = '', width = 80, height = 80, className = '' }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => { setLoaded(false); setError(false); }, [src]);

  const optimized = src?.includes('cloudinary.com')
    ? optimizeCloudinaryImage(src, { width, height, quality: 'auto', format: 'auto' })
    : src;

  const placeholder = src?.includes('cloudinary.com') ? getCloudinaryBlurUrl(src) : null;

  return (
    <div style={{ width:`${width}px`, height:`${height}px`, borderRadius:'50%', overflow:'hidden', position:'relative' }} className="image-container">
      {!loaded && !error && placeholder && <img src={placeholder} alt="" aria-hidden style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', filter:'blur(16px)', transform:'scale(1.05)' }} />}
      {!loaded && !error && !placeholder && <div className="skeleton-avatar" style={{width:'100%',height:'100%',background:'#eee'}} />}
      <img
        src={error ? '/default-profile-image.jpg' : (optimized || '/default-profile-image.jpg')}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{ width:'100%',height:'100%',objectFit:'cover',display:(loaded||error)?'block':'none',position:'relative',zIndex:1 }}
      />
    </div>
  );
};

export default OptimizedImage;