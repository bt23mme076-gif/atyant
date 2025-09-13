// src/components/Home.jsx
import React from 'react';
import HeroSection from './HeroSection';
import AboutUs from './AboutUs';
import HowItWorks from './HowItWorks';
import WhyChooseUs from './WhyChooseUs';
import ContactForm from './ContactForm';

const Home = () => {
  return (
    <>
      <div id="home"><HeroSection /></div>
      <div id="about"><AboutUs /></div>
      <div id="how-it-works"><HowItWorks /></div>
      <div id="why-choose-us"><WhyChooseUs /></div>
      <div id="contact"><ContactForm /></div>
    </>
  );
};

export default Home;