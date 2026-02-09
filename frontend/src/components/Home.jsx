// src/components/Home.jsx
import React from 'react';
import SEO from './SEO'; // ✅ NEW IMPORT
import HeroSection from './HeroSection';
import AboutUs from './AboutUs';
import HowItWorks from './HowItWorks';
import WhyChooseUs from './WhyChooseUs';
import FeedbackForm from './FeedbackForm';
import MentorGallery from '../components/MentorGallery';
import ReviewsSlider from './ReviewsSlider';
import AtyantJourneySlider from './AtyantJourneySlider';

const Home = () => {
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
      <MentorGallery />
      <AtyantJourneySlider />
      <div id="about"><AboutUs /></div>
      <div id="how-it-works"><HowItWorks /></div>
      <div id="why-choose-us"><WhyChooseUs /></div>
      <div id="FeedbackForm"><FeedbackForm /></div>
      <ReviewsSlider />
    </>
  );
};

export default Home;