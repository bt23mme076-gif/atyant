// src/components/Home.jsx
import React, { useEffect } from 'react';
import SEO from './SEO';
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
    if ('Notification' in window && navigator.serviceWorker) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            showTestNotification();
            localStorage.setItem('welcomeNotificationShown', 'true');
          }
        });
      } else if (Notification.permission === 'granted') {
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
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
          });
        }
      });
    }

    async function setupPush() {
      try {
        const subscription = await subscribeUserToPush();
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
