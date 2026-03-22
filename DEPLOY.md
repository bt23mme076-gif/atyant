# Deployment Guide

## VPS Backend Deployment (api.atyant.in)

### 1. SSH into your VPS
```bash
ssh user@your-vps-ip
```

### 2. Navigate to your backend directory
```bash
cd /path/to/atyant
```

### 3. Pull latest code from git
```bash
git pull origin main
```

### 4. Update the .env file on VPS
```bash
cd backend
nano .env
```

Make sure these values are set:
```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://atyant.in
FRONTEND_URL_WWW=https://www.atyant.in
DEV_URL=http://localhost:5173
BACKEND_URL=https://api.atyant.in
PYTHON_ENGINE_URL=https://embed.atyant.in
```

### 5. Restart the backend

If using Docker:
```bash
docker compose down
docker compose up -d --build
```

If using PM2:
```bash
npm install  # Install any new dependencies
pm2 restart atyant-backend
```

If using systemd:
```bash
npm install
sudo systemctl restart atyant-backend
```

### 6. Verify the backend is running
```bash
curl https://api.atyant.in/api/health
```

Should return:
```json
{"status":"OK","timestamp":"...","uptime":...}
```

### 7. Check logs
```bash
docker compose logs --tail=20
# or
pm2 logs atyant-backend --lines 20
```

Look for:
```
📡 CORS: https://atyant.in, https://www.atyant.in, http://localhost:5173
🌍 Environment: production
```

## Frontend Deployment (Vercel)

### Option 1: Trigger redeploy via Git (Recommended)
```bash
# Commit and push to trigger auto-deploy
git add .
git commit -m "fix: Update API configuration"
git push origin main
```

Vercel will automatically detect the push and redeploy.

### Option 2: Manual redeploy in Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project (atyant)
3. Go to "Deployments" tab
4. Click the three dots on the latest deployment
5. Click "Redeploy"

### Option 3: Vercel CLI
```bash
cd frontend
vercel --prod
```

### Verify Environment Variables in Vercel
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Make sure `VITE_API_URL` is set to `https://api.atyant.in` for Production
3. If you change env vars, you MUST redeploy for them to take effect

### Clear Vercel Cache (if needed)
If the old build is still being served:
1. Vercel Dashboard → Project → Settings → General
2. Scroll to "Build & Development Settings"
3. Click "Clear Cache"
4. Redeploy

### Test the deployment
```bash
# Check if API_URL is correct in production build
curl https://www.atyant.in | grep -o 'api.atyant.in'
```

## Python Embedding Service (embed.atyant.in)

Make sure your Python service is running and accessible at `https://embed.atyant.in/embed`

Test it:
```bash
curl -X POST https://embed.atyant.in/embed \
  -H "Content-Type: application/json" \
  -d '{"text":"test question"}'
```

Should return:
```json
{"embedding": [0.123, 0.456, ...]}
```
