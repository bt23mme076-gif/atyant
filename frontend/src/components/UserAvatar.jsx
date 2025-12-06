import React, { useState } from 'react';
import { User } from 'lucide-react';

const UserAvatar = ({ user, size = 40 }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  React.useEffect(() => {
    console.log('🖼️ UserAvatar Props:', {
      user: user,
      hasUser: !!user,
      name: user?.name,
      username: user?.username,
      profilePicture: user?.profilePicture,
      imageError: imageError,
      imageLoaded: imageLoaded
    });
  }, [user, imageError, imageLoaded]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name) => {
    if (!name) return '#667eea';
    
    const colors = [
      '#667eea', '#764ba2', '#f093fb', '#4facfe',
      '#43e97b', '#fa709a', '#fee140', '#30cfd0',
      '#a8edea', '#ff6b6b', '#4ecdc4', '#45b7d1'
    ];
    
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const userName = user?.name || user?.username || 'User';

  const avatarStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${size * 0.4}px`,
    fontWeight: '600',
    color: 'white',
    backgroundColor: getAvatarColor(userName),
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    border: '2px solid rgba(255,255,255,0.3)',
    flexShrink: 0,
  };

  const imgStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: imageLoaded ? 1 : 0,
    transition: 'opacity 0.3s ease',
  };

  const profilePicture = user?.profilePicture || user?.avatar || user?.image || user?.photo;
  const hasProfilePicture = profilePicture && !imageError;

  return (
    <div style={avatarStyle}>
      {!imageLoaded && <span>{getInitials(userName)}</span>}
      
      {hasProfilePicture && (
        <img
          src={profilePicture}
          alt={userName}
          style={imgStyle}
          onLoad={() => {
            console.log('✅ Avatar image loaded:', profilePicture);
            setImageLoaded(true);
          }}
          onError={(e) => {
            console.error('❌ Avatar image failed:', profilePicture, e);
            setImageError(true);
          }}
          loading="lazy"
        />
      )}
    </div>
  );
};

export default UserAvatar;