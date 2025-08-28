// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css';

// Import all your components
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AboutUs from './components/AboutUs';
import HowItWorks from './components/HowItWorks';
import WhyChooseUs from './components/WhyChooseUs';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import Login from './components/Login';
import Signup from './components/Signup'; // <-- THEEK KIYA GAYA
import ChatPage from './components/ChatPage';
import MentorListPage from './components/MentorListPage';

// This component represents your homepage and its sections
const Home = () => (
  <>
    <div id="home">
      <HeroSection />
    </div>
    <div id="about">
      <AboutUs />
    </div>
    <div id="how-it-works">
      <HowItWorks />
    </div>
    <div id="why-choose-us">
      <WhyChooseUs />
    </div>
    <div id="contact">
      <ContactForm />
    </div>
  </>
);

function App() {
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';

  return (
    <div className={isChatPage ? 'App chat-active' : 'App'}>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} /> {/* <-- THEEK KIYA GAYA */}
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/mentors" element={<MentorListPage />} />
        </Routes>
      </main>
      {!isChatPage && <Footer />}
    </div>
  );
}

export default App;