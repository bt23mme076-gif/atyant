// 📊 SEO Analytics Tracking for Atyant Journey Slider

/**
 * Track slide view events for SEO insights
 * Works with Google Analytics 4, Google Tag Manager, and custom analytics
 */

/**
 * Initialize analytics tracking
 */
export const initSliderAnalytics = () => {
  // Check if gtag (Google Analytics) is available
  if (typeof window !== 'undefined' && window.gtag) {
    console.log('✅ Google Analytics tracking initialized for Journey Slider');
  }
};

/**
 * Track individual slide views
 * @param {number} slideIndex - Current slide index
 * @param {object} slideData - Slide information
 */
export const trackSlideView = (slideIndex, slideData) => {
  const eventData = {
    event_category: 'Journey Slider',
    event_label: slideData.caption,
    slide_number: slideIndex + 1,
    slide_type: slideData.type,
    slide_caption: slideData.caption,
    non_interaction: false
  };

  // Google Analytics 4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'slide_view', eventData);
  }

  // Google Tag Manager
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'journey_slide_view',
      ...eventData
    });
  }

  // Facebook Pixel (if applicable)
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', 'JourneySlideView', {
      slide_number: slideIndex + 1,
      slide_caption: slideData.caption
    });
  }
};

/**
 * Track video play events
 * @param {object} videoData - Video information
 */
export const trackVideoPlay = (videoData) => {
  const eventData = {
    event_category: 'Journey Slider',
    event_label: 'Video Played',
    video_title: videoData.caption,
    video_url: videoData.src
  };

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'video_play', eventData);
  }

  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'journey_video_play',
      ...eventData
    });
  }
};

/**
 * Track slider interaction (manual navigation)
 * @param {string} action - 'next', 'previous', 'dot_click', 'autoplay_toggle'
 */
export const trackSliderInteraction = (action) => {
  const eventData = {
    event_category: 'Journey Slider',
    event_label: action,
    interaction_type: action
  };

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'slider_interaction', eventData);
  }

  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'journey_slider_interaction',
      ...eventData
    });
  }
};

/**
 * Track time spent on slider (engagement metric)
 * @param {number} timeSpent - Time in seconds
 */
export const trackTimeSpent = (timeSpent) => {
  const eventData = {
    event_category: 'Journey Slider',
    event_label: 'Time Spent',
    value: Math.round(timeSpent),
    metric_id: 'slider_engagement'
  };

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'slider_engagement', eventData);
  }
};

/**
 * Track when slider comes into viewport (visibility)
 */
export const trackSliderVisibility = () => {
  const eventData = {
    event_category: 'Journey Slider',
    event_label: 'Slider Visible',
    non_interaction: true
  };

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'slider_visibility', eventData);
  }
};

/**
 * Track image load performance (Core Web Vitals insight)
 * @param {number} loadTime - Image load time in ms
 * @param {string} imageSrc - Image URL
 */
export const trackImageLoadPerformance = (loadTime, imageSrc) => {
  const eventData = {
    event_category: 'Performance',
    event_label: 'Journey Image Load',
    value: Math.round(loadTime),
    image_url: imageSrc
  };

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'timing_complete', {
      name: 'journey_image_load',
      value: Math.round(loadTime),
      event_category: 'Journey Slider'
    });
  }
};

/**
 * Setup intersection observer for visibility tracking
 * @param {HTMLElement} element - Slider element to observe
 * @param {function} callback - Callback when element is visible
 */
export const setupVisibilityTracking = (element, callback) => {
  if (!element || typeof IntersectionObserver === 'undefined') return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          trackSliderVisibility();
          callback && callback();
          observer.disconnect(); // Track only once
        }
      });
    },
    { threshold: 0.5 } // 50% visible
  );

  observer.observe(element);
  return observer;
};

/**
 * Track complete slider session (summary)
 * @param {object} sessionData - Session summary
 */
export const trackSliderSession = (sessionData) => {
  const {
    totalSlides,
    viewedSlides,
    interactions,
    timeSpent,
    completedCycle
  } = sessionData;

  const eventData = {
    event_category: 'Journey Slider',
    event_label: 'Session Summary',
    total_slides: totalSlides,
    viewed_slides: viewedSlides.length,
    completion_rate: (viewedSlides.length / totalSlides * 100).toFixed(2),
    interactions: interactions,
    time_spent: Math.round(timeSpent),
    completed_cycle: completedCycle
  };

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'slider_session_complete', eventData);
  }

  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'journey_slider_session',
      ...eventData
    });
  }
};

// Export all tracking functions
export default {
  initSliderAnalytics,
  trackSlideView,
  trackVideoPlay,
  trackSliderInteraction,
  trackTimeSpent,
  trackSliderVisibility,
  trackImageLoadPerformance,
  setupVisibilityTracking,
  trackSliderSession
};
