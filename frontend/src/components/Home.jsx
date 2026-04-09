// src/components/Home.jsx
import React, { useEffect } from 'react';
import SEO from './SEO'; // ✅ NEW IMPORT
import HeroSection from './HeroSection';
import TrustedBySlider from './TrustedBySlider';
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
            // Show notification only when permission is FIRST granted
            showTestNotification();
            // Mark that we've shown the welcome notification
            localStorage.setItem('welcomeNotificationShown', 'true');
          }
        });
      } else if (Notification.permission === 'granted') {
        // Check if we've already shown the welcome notification
        const hasShownWelcome = localStorage.getItem('welcomeNotificationShown');
        if (!hasShownWelcome) {
          showTestNotification();
          localStorage.setItem('welcomeNotificationShown', 'true');
        }
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
        title="Atyant | Intelligent Career Guidance Engine"
        description="Atyant is an AI-powered guidance engine that analyzes your career block and connects you directly with the verified roadmap or individual who solved it."
        keywords="AI career guidance, problem solving engine, career roadmap AI, semantic matching, Atyant"
        url="https://atyant.in/"
      />

      <div id="home"><HeroSection /></div>
      <TrustedBySlider />
      <AtyantJourneySlider />
      <ResumeheroSection />
      <div id="why-choose-us"><WhyChooseUs /></div>
      <div id="how-it-works"><HowItWorks /></div>
      {/* <ReviewsSlider /> */}
    </>
  );
};

export default Home;