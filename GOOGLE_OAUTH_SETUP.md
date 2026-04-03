# Google OAuth Setup - Complete

## Status: ✅ WORKING

The Google OAuth integration is now fully configured and working.

## What Was Fixed

### 1. Backend Configuration
- Added missing imports: `express-session` and `connect-mongo`
- Fixed passport initialization order (must be after dotenv.config())
- Configured session middleware with MongoDB store
- Set up passport serialization/deserialization
- Configured Google OAuth Strategy with proper credentials

### 2. Route Configuration
- Auth routes mounted at both `/api/auth` and `/auth`
- `/auth` path used for Google OAuth callbacks (matches .env)
- Meetings routes moved to `/api/meetings` to avoid conflicts

### 3. OAuth Callback Flow
- User clicks "Continue with Google"
- Redirected to Google for authentication
- Google redirects back to `/auth/google/callback`
- Backend creates/updates user in database
- Generates JWT token
- Redirects to frontend `/auth-success?token=<jwt>`
- Frontend stores token and redirects to profile

## Environment Variables Required

```env
# Google OAuth
GOOGLE_CALENDAR_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=https://api.atyant.in/auth/google/callback

# Session
SESSION_SECRET=your-session-secret

# Frontend URLs
FRONTEND_URL=https://atyant.in
```

## Testing Locally

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Visit: `http://localhost:5000/auth/google`
4. Complete Google authentication
5. Should redirect to `http://localhost:5173/auth-success?token=...`
6. Should auto-redirect to profile page

## Production Setup

### Backend (.env)
```env
GOOGLE_CALLBACK_URL=https://api.atyant.in/auth/google/callback
FRONTEND_URL=https://atyant.in
```

### Google Cloud Console
1. Go to: https://console.cloud.google.com/apis/credentials
2. Edit OAuth 2.0 Client ID
3. Add Authorized redirect URIs:
   - `https://api.atyant.in/auth/google/callback`
   - `http://localhost:5000/auth/google/callback` (for local testing)

## Files Modified

- `backend/server.js` - Added session, passport imports and initialization
- `backend/config/passport.js` - Configured Google OAuth strategy
- `backend/routes/auth.js` - Added OAuth routes and callback handler
- `frontend/src/components/AuthSuccess.jsx` - Created callback handler page
- `frontend/src/App.jsx` - Added /auth-success route

## How to Use in Frontend

Add a "Continue with Google" button:

```jsx
<button onClick={() => {
  window.location.href = `${API_URL}/auth/google`;
}}>
  Continue with Google
</button>
```

## User Data Stored

When a user authenticates via Google:
- `googleId`: Google user ID
- `email`: User's email
- `name`: Display name
- `picture`: Profile picture URL
- `accessToken`: Google access token (for Calendar API)
- `refreshToken`: Refresh token (if granted)
- `lastLogin`: Timestamp

## Calendar Integration

The OAuth scope includes:
- `userinfo.profile`
- `userinfo.email`
- `calendar.events` - For Google Meet integration

Access tokens are stored in the user document for future Calendar API calls.
