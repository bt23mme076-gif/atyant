# Complete Authentication Flow - Atyant Backend

## Overview

Atyant backend uses **TWO different authentication methods**:

1. **JWT-based Auth** - For regular login/signup and API requests
2. **Passport Session Auth** - For Google OAuth only

## 🔐 Authentication Methods

### Method 1: Regular Login/Signup (JWT)

#### Flow:
```
User → Signup/Login → Backend validates → JWT token generated → Frontend stores token → API requests use token
```

#### Routes:
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google-login` - Login with Google ID token (frontend SDK)

#### Token Structure:
```javascript
{
  userId: "user_id",
  role: "user|mentor|admin",
  username: "username",
  name: "Full Name",
  email: "email@example.com",
  profilePicture: "url"
}
```

#### Token Usage:
```javascript
// Frontend sends token in Authorization header
Authorization: Bearer <jwt_token>

// Backend middleware verifies token
const token = req.headers.authorization?.split(' ')[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

---

### Method 2: Google OAuth (Passport + Session)

#### Flow:
```
User clicks "Continue with Google" 
→ Redirected to /auth/google 
→ Google consent screen 
→ User grants permission 
→ Google redirects to /auth/google/callback with auth code
→ Backend exchanges code for access token
→ Backend creates/updates user
→ Backend generates JWT token
→ Redirects to frontend with token
→ Frontend stores token
```

#### Routes:
- `GET /auth/google` - Initiates OAuth flow
- `GET /auth/google/callback` - Google redirects here after auth

#### Environment Variables:
```env
GOOGLE_CALENDAR_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=your-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
SESSION_SECRET=your-session-secret
```

---

## 🔴 Current Issue: TokenError Bad Request

### Problem:
Google OAuth is failing with "TokenError: Bad Request" because the **callback URL in Google Cloud Console doesn't match** the one in your code.

### Root Cause:
When you click "Continue with Google", Google needs to know where to redirect after authentication. This URL must be:
1. Registered in Google Cloud Console
2. Match exactly in your backend .env

### Solution:

#### Step 1: Check Your Current Callback URL
Your `.env` has:
```env
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
```

#### Step 2: Update Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID: `456343903812-6b2t3uriqksilstshto31m9pldn1rlag.apps.googleusercontent.com`
3. Click Edit
4. Under "Authorized redirect URIs", add:
   ```
   http://localhost:5000/auth/google/callback
   https://api.atyant.in/auth/google/callback
   ```
5. Save

#### Step 3: Verify Environment Variables

Check `backend/.env`:
```env
GOOGLE_CALENDAR_CLIENT_ID=456343903812-6b2t3uriqksilstshto31m9pldn1rlag.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
SESSION_SECRET=dbd2c2bf7ff05c736e30a0d75aeeceb230785c6bb06fd3f35a8d93bd8f3ad77a
FRONTEND_URL=http://localhost:5173
```

---

## 📋 Complete Auth Flow Details

### 1. Regular Signup Flow

```javascript
// Frontend sends
POST /api/auth/signup
{
  username: "john",
  email: "john@example.com",
  password: "password123",
  phone: "9876543210",
  role: "user"
}

// Backend creates user
const hashedPassword = await bcrypt.hash(password, 10);
const newUser = new User({
  username,
  email,
  password: hashedPassword,
  phone,
  role
});
await newUser.save();

// Backend generates JWT
const token = jwt.sign(
  { userId: newUser._id, role: newUser.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Backend responds
{
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: { id, username, email, role }
}

// Frontend stores token
localStorage.setItem('token', token);
```

### 2. Regular Login Flow

```javascript
// Frontend sends
POST /api/auth/login
{
  email: "john@example.com",
  password: "password123"
}

// Backend validates
const user = await User.findOne({ email }).select('+password');
const isMatch = await bcrypt.compare(password, user.password);

// Backend generates JWT with full user data
const token = jwt.sign(
  {
    userId: user._id,
    role: user.role,
    username: user.username,
    name: user.name,
    email: user.email,
    profilePicture: user.profilePicture
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Backend responds
{
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: { id, username, name, email, role, profilePicture }
}
```

### 3. Google OAuth Flow (Current Implementation)

```javascript
// Step 1: User clicks "Continue with Google"
window.location.href = 'http://localhost:5000/auth/google';

// Step 2: Backend redirects to Google
router.get('/google',
  passport.authenticate('google', { 
    accessType: 'offline',
    prompt: 'consent',
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/calendar.events'
    ]
  })
);

// Step 3: User grants permission on Google

// Step 4: Google redirects to callback with auth code
// URL: http://localhost:5000/auth/google/callback?code=4/0Aci98E-E-6dqeZQWRQKE7jSZXI457v64yI1yvE45RPS9yiUdhgjkUt-xy4nda7kc_K-udg

// Step 5: Passport exchanges code for access token
// This is where the error happens if callback URL is not registered

// Step 6: Passport strategy callback
async (accessToken, refreshToken, profile, done) => {
  // Find or create user
  let user = await User.findOne({ googleId: profile.id });
  
  if (!user) {
    // Generate username from email
    let username = profile.emails[0].value.split('@')[0];
    
    user = await User.create({
      googleId: profile.id,
      email: profile.emails[0].value,
      username: username,
      name: profile.displayName,
      profilePicture: profile.photos[0]?.value,
      accessToken: accessToken,
      refreshToken: refreshToken,
      role: 'user'
    });
  }
  
  return done(null, user);
}

// Step 7: Backend generates JWT
const token = jwt.sign(
  {
    userId: req.user._id,
    role: req.user.role,
    username: req.user.username,
    name: req.user.name,
    email: req.user.email,
    profilePicture: req.user.profilePicture
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Step 8: Backend redirects to frontend with token
res.redirect(`http://localhost:5173/auth-success?token=${token}`);

// Step 9: Frontend receives token
// URL: http://localhost:5173/auth-success?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Step 10: Frontend stores token
const token = new URLSearchParams(window.location.search).get('token');
localStorage.setItem('token', token);
```

### 4. Google Login (Frontend SDK) - Alternative Method

```javascript
// Frontend uses Google SDK
POST /api/auth/google-login
{
  token: "google_id_token"
}

// Backend verifies token with Google
const ticket = await client.verifyIdToken({
  idToken: token,
  audience: process.env.GOOGLE_CLIENT_ID
});

const { name, email, sub, picture } = ticket.getPayload();

// Find or create user
let user = await User.findOne({ email });
if (!user) {
  user = new User({
    username: generateUsername(name),
    email,
    password: await bcrypt.hash(sub + email, 8),
    profilePicture: picture,
    role: 'user'
  });
  await user.save();
}

// Generate JWT
const jwtToken = jwt.sign(
  { userId: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Respond with token
{
  token: jwtToken,
  role: user.role,
  user: { _id, username, email, role, profilePicture }
}
```

---

## 🔧 How to Fix Your Current Issue

### Option 1: Update Google Cloud Console (Recommended)

1. Go to Google Cloud Console
2. Add callback URL: `http://localhost:5000/auth/google/callback`
3. Save and wait 5 minutes for changes to propagate
4. Try OAuth again

### Option 2: Use Different Client ID

If you can't access the Google Cloud Console, create a new OAuth client:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Create new OAuth 2.0 Client ID
3. Application type: Web application
4. Authorized redirect URIs:
   - `http://localhost:5000/auth/google/callback`
   - `https://api.atyant.in/auth/google/callback`
5. Copy new Client ID and Secret to `.env`

---

## 🧪 Testing

### Test Regular Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Google OAuth
1. Visit: `http://localhost:5000/auth/google`
2. Complete Google authentication
3. Should redirect to: `http://localhost:5173/auth-success?token=...`

---

## 📝 Summary

Your backend has **two authentication systems**:

1. **JWT for API requests** - Works fine
2. **Passport OAuth for Google** - Needs callback URL registered in Google Cloud Console

The error happens because Google doesn't recognize your callback URL. Fix it by adding the URL to Google Cloud Console.
