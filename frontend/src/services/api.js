
// Mentor API helpers
export const mentorApi = {
  updateStrategy: (data) => {
    return apiCall('/api/mentor/update-strategy', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};
// ========================================
// API BASE URL CONFIGURATION
// ========================================
const getApiUrl = () => {
  // Check if we're in production
  if (import.meta.env.PROD) {
    // Production API URL
    return import.meta.env.VITE_API_URL || 'https://your-backend-api.onrender.com';
  }
  
  // Development API URL
  return import.meta.env.VITE_API_URL || 'http://localhost:3000';
};

const API_BASE = getApiUrl();
export const API_BASE_URL = API_BASE; // ✅ Export for compatibility

// ========================================
// API ENDPOINTS
// ========================================
export const API_ENDPOINTS = {
  ratings: {
    submit: '/api/ratings',
    getMentorRating: (mentorId) => `/api/ratings/mentor/${mentorId}`,
    getUserRatings: (userId) => `/api/ratings/user/${userId}`
  },
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    signup: '/api/auth/signup' // ✅ Added for consistency
  },
  chat: {
    messages: '/api/messages',
    contacts: '/api/contacts'
  }
};

// ========================================
// EXISTING API REQUEST HELPER
// ========================================
// A small helper for all API calls
export async function apiRequest(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
    });

    let data = {};
    try {
      data = await res.json();
    } catch {
      data = { message: "Unexpected server response" };
    }

    if (!res.ok) {
      throw new Error(data.message || `Error ${res.status}`);
    }

    return data;
  } catch (err) {
    throw new Error(err.message || "Network error");
  }
}

// ========================================
// NEW API CALL HELPER (with Auth Token)
// ========================================
// Helper function for API calls with automatic token handling
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  });

  if (!response.ok) {
    let error;
    try {
      error = await response.json();
    } catch {
      error = { message: 'API request failed' };
    }
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
};

// ========================================
// EXISTING AUTH HELPERS
// ========================================
// Example auth helpers
export function signup(data) {
  return apiRequest("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function login(data) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ========================================
// NEW RATING HELPERS
// ========================================
// Rating API helpers
export const ratingApi = {
  // Submit a rating
  submit: (data) => {
    return apiCall(API_ENDPOINTS.ratings.submit, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  // Get mentor rating
  getMentorRating: (mentorId) => {
    return apiCall(API_ENDPOINTS.ratings.getMentorRating(mentorId));
  },
  
  // Get user ratings
  getUserRatings: (userId) => {
    return apiCall(API_ENDPOINTS.ratings.getUserRatings(userId));
  }
};

// ========================================
// DEFAULT EXPORT
// ========================================
export default { 
  API_BASE_URL, 
  API_ENDPOINTS, 
  apiCall, 
  apiRequest,
  signup,
  login,
  ratingApi
};
