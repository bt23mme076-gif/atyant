# Environment Variables Setup

## Backend (`backend/.env`)

```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGO_URI=mongodb+srv://...

# JWT
JWT_SECRET=your-secret-key

# Frontend URLs (for CORS)
FRONTEND_URL=https://atyant.in
FRONTEND_URL_WWW=https://www.atyant.in
DEV_URL=http://localhost:5173

# Backend URL (for profile pictures, etc.)
BACKEND_URL=https://api.atyant.in

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_EMAIL=...
GOOGLE_PRIVATE_KEY=...
GOOGLE_SHEET_ID1=...
GOOGLE_SHEET_ID2=...

# Cloudinary
CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email (Resend)
RESEND_API_KEY=...

# Payment (Razorpay)
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...

# AI
GEMINI_API_KEY=...

# Python Embedding Service (for vector search)
PYTHON_ENGINE_URL=https://embed.atyant.in

# Email (Nodemailer - optional)
EMAIL_USER=...
EMAIL_PASS=...
```

## Frontend (`frontend/.env`)

```env
# Development
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=...
```

## Frontend Production (`frontend/.env.production`)

```env
# Production
VITE_API_URL=https://api.atyant.in
```

## Docker Deployment

The `docker-compose.yml` reads from `backend/.env` automatically. Make sure:

1. `backend/.env` has all required vars
2. `BACKEND_URL` points to your production domain
3. `FRONTEND_URL` and `FRONTEND_URL_WWW` are set for CORS

## Local Development

1. Backend: `cd backend && npm start`
2. Frontend: `cd frontend && npm run dev`

Frontend will use `VITE_API_URL=http://localhost:5000` from `.env`

## Production Build

```bash
# Backend
cd backend
docker compose up -d --build

# Frontend
cd frontend
npm run build
```

Frontend build will use `VITE_API_URL` from `.env.production`

## Python Embedding Service

The backend uses a separate Python service for generating embeddings (vector search). Configure it with:

```env
PYTHON_ENGINE_URL=http://127.0.0.1:8000  # Local development
PYTHON_ENGINE_URL=https://embed.atyant.in  # Production
```

If the Python service is unavailable, the backend will still work but vector search features (instant answer matching) will be disabled.

## Architecture

```
Frontend (Vercel)          Backend (VPS)           Python Service (VPS)
atyant.in              →   api.atyant.in       →   embed.atyant.in
www.atyant.in                                      (embeddings only)
```

CORS is configured to allow:
- `https://atyant.in`
- `https://www.atyant.in`
- `http://localhost:5173` (dev)


