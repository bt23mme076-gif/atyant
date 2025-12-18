// src/components/MentorCard.jsx
import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './MentorCards.css';
import { useNavigate } from 'react-router-dom';
import MentorRating from './MentorRating';
import { Navigation as NavigationIcon, MapPin } from 'lucide-react';

// ✅ HAVERSINE FORMULA - Calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  
  return distance;
}

// ========== SINGLE MENTOR CARD COMPONENT ==========
const MentorCard = ({ mentor, userLocation }) => {
  
  // Generate avatar placeholder
  const getAvatarPlaceholder = () => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)'
    ];
    const nameStr = (mentor.name || mentor.username || 'M');
    const hash = nameStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradientIndex = hash % gradients.length;
    const isFemale = hash % 2 === 0;
    
    return (
      <div className="mentor-image-placeholder" style={{ background: gradients[gradientIndex], width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
        {isFemale ? (
          <svg className="avatar-icon" style={{ width: '60%', height: '60%' }} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="white" fillOpacity="0.95"/>
            <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="white" fillOpacity="0.95"/>
          </svg>
        ) : (
          <svg className="avatar-icon" style={{ width: '60%', height: '60%' }} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="7" r="4" fill="white" fillOpacity="0.95"/>
            <path d="M5 21C5 16.5817 8.13401 13 12 13C15.866 13 19 16.5817 19 21H5Z" fill="white" fillOpacity="0.95"/>
          </svg>
        )}
      </div>
    );
  };
  
  // ✅ Get distance from backend or calculate if needed
  const getDistanceText = () => {
    // If backend already provided distance (from NearbyMentors)
    if (mentor.distanceText) {
      return mentor.distanceText;
    }

    // Otherwise calculate manually
    if (!userLocation?.lat || !userLocation?.lng || !mentor.location?.coordinates) {
      return 'undefined away';
    }

    const mentorLat = mentor.location.coordinates[1];
    const mentorLng = mentor.location.coordinates[0];
    
    const dist = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      mentorLat,
      mentorLng
    );

    if (dist < 1) {
      return `${Math.round(dist * 1000)}m away`;
    } else if (dist < 10) {
      return `${dist.toFixed(1)} km away`;
    } else {
      return `${Math.round(dist)} km away`;
    }
  };

  const openDirections = () => {
    if (!userLocation || !mentor.location?.coordinates) {
      alert('Location information not available');
      return;
    }

    const origin = `${userLocation.lat},${userLocation.lng}`;
    const destination = `${mentor.location.coordinates[1]},${mentor.location.coordinates[0]}`;
    
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    
    window.open(directionsUrl, '_blank');
  };

  return (
    <div className="mentor-card">
      {/* Profile Picture */}
      <div className="mentor-image-wrapper" style={{ width: '110px', height: '110px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto' }}>
        {(mentor.profilePicture || mentor.image) ? (
          <img 
            src={mentor.profilePicture || mentor.image} 
            alt={mentor.name || mentor.username}
            className="mentor-image"
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          getAvatarPlaceholder()
        )}
      </div>
      
      {/* Name */}
      <h3 className="mentor-name">
        {mentor.name || mentor.username}
      </h3>
      
      {/* Bio */}
      <p className="mentor-interest">
        {mentor.bio || mentor.interest || 'Passionate mentor ready to guide you'}
      </p>

      {/* ✅ DISTANCE BADGE - Use backend's distanceText */}
      <div className="location-badge">
        <MapPin size={16} />
        {getDistanceText()}
      </div>

      {/* ✅ CITY/STATE */}
      {mentor.location?.city && (
        <div className="mentor-location">
          <MapPin size={18} />
          <span>{mentor.location.city}, {mentor.location.state || 'India'}</span>
        </div>
      )}
      
      {/* Rating */}
      <MentorRating mentorId={mentor._id} showDetails={false} />
      
      {/* Directions Button */}
      <button 
        className="message-button" 
        onClick={openDirections}
      >
        <NavigationIcon size={18} />
        Get Directions
      </button>
    </div>
  );
};

// ========== MENTOR CARDS CAROUSEL ==========
const MentorCards = ({ mentors, userLocation }) => { // ✅ Receive userLocation
  const navigate = useNavigate();

  if (!mentors || mentors.length === 0) {
    return (
      <div className="mentor-cards-container">
        <p style={{ textAlign: 'center', color: '#64748b' }}>
          No mentors found
        </p>
      </div>
    );
  }

  console.log('👤 User Location:', userLocation); // ✅ Debug
  console.log('👥 Mentors:', mentors.length);

  return (
    <div className="mentor-cards-container">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ 
          clickable: true,
          dynamicBullets: true
        }}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={mentors.length > 1}
        speed={600}
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
        touchRatio={1.5}
        touchAngle={45}
        grabCursor={true}
      >
        {mentors.map((mentor) => (
          <SwiperSlide key={mentor._id}>
            <MentorCard 
              mentor={mentor} 
              userLocation={userLocation} // ✅ Pass userLocation
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default MentorCards;