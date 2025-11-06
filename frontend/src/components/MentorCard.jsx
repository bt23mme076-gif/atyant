// src/components/MentorCard.jsx
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './MentorCards.css';
import { useNavigate } from 'react-router-dom';
import MentorRating from './MentorRating'; // ✅ ADD THIS IMPORT

const MentorCard = ({ mentor }) => {
  const openDirections = (mentorLocation) => {
    if (!userLocation || !mentorLocation) {
      alert('Location information not available');
      return;
    }

    // ========== USE EXACT COORDINATES, NOT "Your location" ==========
    const origin = `${userLocation.lat},${userLocation.lng}`;
    const destination = `${mentorLocation.coordinates[1]},${mentorLocation.coordinates[0]}`;
    
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    
    console.log('🗺️ Opening Google Maps:');
    console.log('   From:', origin);
    console.log('   To:', destination);
    
    window.open(directionsUrl, '_blank');
  };

  return (
    <div className="mentor-card">
      <img src={mentor.image} alt={mentor.name} className="mentor-image" />
      <h3 className="mentor-name">{mentor.name}</h3>
      <p className="mentor-interest">{mentor.interest}</p>
      
      {/* ✅ ADD RATING COMPONENT HERE */}
      <MentorRating mentorId={mentor._id} showDetails={false} />
      
      <button className="message-button" onClick={() => openDirections(mentor.location)}>
        <Navigation size={16} />
        Directions
      </button>
    </div>
  );
};

const MentorCards = ({ mentors }) => {
  const navigate = useNavigate();

  const handleViewProfile = (mentorId) => {
    // ✅ Scroll to top before navigating
    window.scrollTo(0, 0);
    
    // Then navigate
    navigate(`/mentor/${mentorId}`);
  };

  return (
    <div className="mentor-cards-container">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={true}
        speed={600}
        // ✅ Mobile-specific breakpoints
        breakpoints={{
          320: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
          480: {
            slidesPerView: 1,
            spaceBetween: 15,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
        }}
        // ✅ Touch events for mobile
        touchRatio={1}
        touchAngle={45}
        grabCursor={true}
        simulateTouch={true}
        allowTouchMove={true}
      >
        {mentors.map((mentor) => (
          <SwiperSlide key={mentor._id}>
            <div className="mentor-card">
              <MentorCard mentor={mentor} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default MentorCards;