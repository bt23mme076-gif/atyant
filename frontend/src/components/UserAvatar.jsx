import React, { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function optimizeCloudinary(url, size) {
  try {
    if (!url) return null;
    if (!url.includes('cloudinary.com')) return url;
    const transform = `w_${size},h_${size},c_fill,g_face,q_auto,f_auto`;
    return url.replace('/upload/', `/upload/${transform}/`);
  } catch {
    return url;
  }
}

const UserAvatar = ({ user, size = 48, className = '' }) => {
  // Try common fields where photo may exist
  const initialPhoto =
    user?.profilePicture ||
    user?.photo ||
    user?.avatar ||
    user?.profile?.profilePicture ||
    '';

  const [photo, setPhoto] = useState(initialPhoto);

  const name = user?.name || user?.username || user?.email || 'User';

  const initials = useMemo(() => {
    const parts = String(name).trim().split(' ');
    const letters = (parts[0]?.[0] || 'U') + (parts[1]?.[0] || '');
    return letters.toUpperCase();
  }, [name]);

  // Fetch profile photo once if not present in context
  useEffect(() => {
    if (photo) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    let cancelled = false;

    const headers = { Authorization: `Bearer ${token}` };

    const tryFetch = async (path) => {
      try {
        const res = await fetch(`${API_URL}${path}`, { headers });
        if (!res.ok) return null;
        return res.json();
      } catch {
        return null;
      }
    };

    (async () => {
      const data =
        (await tryFetch('/api/profile/me')) ||
        (await tryFetch('/api/profile')) ||
        (await tryFetch('/api/users/me'));

      const url =
        data?.profilePicture ||
        data?.user?.profilePicture ||
        data?.data?.profilePicture;

      if (!cancelled && url) setPhoto(url);
    })();

    return () => {
      cancelled = true;
    };
  }, []); // ✅ Empty array - fetch only once on mount

  const src = optimizeCloudinary(photo, size);

  return (
    <div
      className={`ua-wrapper ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        background: 'linear-gradient(135deg,#667eea,#764ba2)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 600,
        fontSize: Math.max(12, Math.floor(size / 2.7)),
        border: '2px solid rgba(255,255,255,0.3)',
      }}
      title={name}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={() => setPhoto('')}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

export default UserAvatar;