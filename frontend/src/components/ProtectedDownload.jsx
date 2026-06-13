import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Lock } from 'lucide-react';
import './ProtectedDownload.css';

const ProtectedDownload = ({ onClick, fileName, isLoggedIn }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      const shouldLogin = window.confirm(
        '🔒 Login Required!\n\nYou need to login to download this template.\n\nClick OK to go to login page.'
      );
      
      if (shouldLogin) {
        navigate('/login', { 
          state: { from: '/internships', action: 'download' } 
        });
      }
      return;
    }

    // If logged in, execute the download
    onClick();
  };

  return (
    <button 
      onClick={handleClick}
      className={`download-template-btn ${!isLoggedIn ? 'locked' : ''}`}
      title={isLoggedIn ? `Download ${fileName}` : 'Login required to download'}
    >
      {isLoggedIn ? (
        <Download size={20} />
      ) : (
        <Lock size={20} />
      )}
      <span>{isLoggedIn ? 'Download Email Template' : 'Login to Download Template'}</span>
    </button>
  );
};

export default ProtectedDownload;