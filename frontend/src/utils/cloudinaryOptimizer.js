// 🖼️ Cloudinary Image Optimization Utility for SEO & Performance

/**
 * Generate optimized Cloudinary URL with responsive sizing
 * @param {string} url - Original Cloudinary URL
 * @param {number} width - Target width in pixels
 * @param {object} options - Additional optimization options
 * @returns {string} Optimized URL
 */
export const getOptimizedCloudinaryUrl = (url, width, options = {}) => {
  const {
    format = 'auto',      // Auto-select best format (WebP, AVIF, etc.)
    quality = 'auto',     // Auto-optimize quality
    crop = 'scale',       // Scaling method
    gravity = 'auto',     // Smart cropping focus
    fetchFormat = 'auto'  // Deliver best format for browser
  } = options;

  // Build transformation string
  const transformations = [
    `w_${width}`,
    `f_${format}`,
    `q_${quality}`,
    `c_${crop}`,
    gravity !== 'auto' && `g_${gravity}`,
    'dpr_auto',          // Auto device pixel ratio
  ].filter(Boolean).join(',');

  // Insert transformations into Cloudinary URL
  return url.replace('/upload/', `/upload/${transformations}/`);
};

/**
 * Generate srcset for responsive images
 * @param {string} url - Original Cloudinary URL
 * @param {array} widths - Array of target widths [400, 800, 1200]
 * @returns {string} srcset string
 */
export const generateSrcSet = (url, widths = [400, 800, 1200, 1600]) => {
  return widths
    .map(width => `${getOptimizedCloudinaryUrl(url, width)} ${width}w`)
    .join(', ');
};

/**
 * Generate sizes attribute for responsive images
 * @param {object} breakpoints - Breakpoint configuration
 * @returns {string} sizes string
 */
export const generateSizes = (breakpoints = {
  mobile: '100vw',
  tablet: '90vw',
  desktop: '1200px'
}) => {
  return [
    `(max-width: 768px) ${breakpoints.mobile}`,
    `(max-width: 1024px) ${breakpoints.tablet}`,
    breakpoints.desktop
  ].join(', ');
};

/**
 * Preload critical images with link tag
 * @param {string} url - Image URL
 * @param {array} widths - Responsive widths
 */
export const preloadImage = (url, widths = [400, 800, 1200]) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = getOptimizedCloudinaryUrl(url, 1200);
  link.imageSrcset = generateSrcSet(url, widths);
  link.imageSizes = generateSizes();
  document.head.appendChild(link);
};

/**
 * Get optimal image format based on browser support
 * @returns {string} Best supported format
 */
export const getBestImageFormat = () => {
  // Check AVIF support
  if (document.createElement('canvas').toDataURL('image/avif').indexOf('data:image/avif') === 0) {
    return 'avif';
  }
  // Check WebP support
  if (document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0) {
    return 'webp';
  }
  return 'auto';
};

/**
 * Generate SEO-friendly image object for Schema.org
 * @param {object} photo - Photo object with src, alt, caption, description
 * @returns {object} Schema.org ImageObject
 */
export const generateImageSchema = (photo) => {
  return {
    "@type": "ImageObject",
    "contentUrl": photo.src,
    "url": photo.src,
    "description": photo.description,
    "name": photo.caption,
    "caption": photo.caption,
    "thumbnailUrl": getOptimizedCloudinaryUrl(photo.src, 400),
    "width": "1200",
    "height": "675",
    "encodingFormat": "image/jpeg"
  };
};

// Export all utilities
export default {
  getOptimizedCloudinaryUrl,
  generateSrcSet,
  generateSizes,
  preloadImage,
  getBestImageFormat,
  generateImageSchema
};
