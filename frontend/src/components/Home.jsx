// src/components/Home.jsx
import React, { useEffect } from 'react';
import SEO from './SEO'; // ✅ NEW IMPORT
import HeroSection from './HeroSection';
import AboutUs from './AboutUs';
import HowItWorks from './HowItWorks';
import WhyChooseUs from './WhyChooseUs';
import FeedbackForm from './FeedbackForm';
import ReviewsSlider from './ReviewsSlider';
import AtyantJourneySlider from './AtyantJourneySlider';
import ResumeheroSection from './ResumeHeroSection';
import InstallPWAButton from './InstallPWAButton';
import { subscribeUserToPush } from '../utils/webPush';


const Home = () => {
  useEffect(() => {
    // Step 2: Ask for notification permission and show a test notification
    if ('Notification' in window && navigator.serviceWorker) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            showTestNotification();
          }
        });
      } else if (Notification.permission === 'granted') {
        showTestNotification();
      }
    }

    function showTestNotification() {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) {
          reg.showNotification('Welcome to Atyant!', {
            body: 'Notifications are enabled. You will get important updates here.',
            icon: '/icons/icon-192x192.png', // Update path if needed
            badge: '/icons/icon-72x72.png', // Update path if needed
          });
        }
      });
    }

    // Step 3: Subscribe user to push and send subscription to backend
    async function setupPush() {
      try {
        const subscription = await subscribeUserToPush();
        // Send subscription to backend
        await fetch('/api/save-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        });
      } catch (err) {
        console.error('Push subscription failed:', err);
      }
    }
    setupPush();
  }, []);

  return (
    <>
      {/* ✅ SEO FOR HOMEPAGE */}
      <SEO 
        title="AI-Powered Student Guidance | Senior Roadmaps for Placements"
        description="AI matches you with seniors who've already cracked it. Get human-verified roadmaps for internships, placements & career clarity — not generic AI answers."
        keywords="AI student guidance, senior roadmaps, internship help, placement preparation, career guidance AI, mentor matching, Atyant"
        url="https://atyant.in/"
      />

      <div id="home"><HeroSection /></div>
      <div id="about"><AboutUs /></div>
      <AtyantJourneySlider />
      <ResumeheroSection />
      <div id="why-choose-us"><WhyChooseUs /></div>
      <div id="how-it-works"><HowItWorks /></div>
      <ReviewsSlider />
    </>
  );
};

export default Home;