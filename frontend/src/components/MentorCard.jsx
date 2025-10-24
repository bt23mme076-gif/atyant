// src/components/MentorCard.jsx
import React from 'react';

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
      <button className="message-button" onClick={() => openDirections(mentor.location)}>
        <Navigation size={16} />
        Directions
      </button>
    </div>
  );
};

export default MentorCard;