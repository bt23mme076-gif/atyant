import React, { useEffect, useState } from 'react';

const LazyAnalytics = () => {
  const [Analytics, setAnalytics] = useState(null);

  useEffect(() => {
    // ✅ Load analytics after 3 seconds (when page is interactive)
    const timer = setTimeout(() => {
      import('@vercel/analytics/react').then((module) => {
        setAnalytics(() => module.Analytics);
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!Analytics) return null;
  return <Analytics />;
};

export default LazyAnalytics;