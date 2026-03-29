# 🚀 DEPLOY TO FIX CORS ERROR

## ❌ Current Error
```
Access to fetch at 'https://api.atyant.in/api/auth/google-login' from origin 'https://www.atyant.in' 
has been blocked by CORS policy
```

## ✅ Solution: Deploy Updated Backend

Your code is ready locally. Now push and deploy to VPS:

---

## Step 1: Push to GitHub

```bash
git push origin main
```

---

## Step 2: SSH to VPS

```bash
ssh user@api.atyant.in
```

Replace `user` with your actual VPS username (might be `root`, `ubuntu`, `admin`, etc.)

---

## Step 3: Update Backend on VPS

Once connected to VPS, run these commands:

```bash
# Navigate to backend directory
cd /var/www/atyant-backend
# OR
cd ~/atyant/backend
# OR wherever your backend is located

# Pull latest code
git pull origin main

# Install dependencies (for notification system + security fixes)
npm install

# Restart backend
pm2 restart backend

# Check logs
pm2 logs backend --lines 30
```

---

## Step 4: Verify CORS Fix

Look for this line in the logs:
```
🔒 CORS Allowed Origins: [ 'https://atyant.in', 'https://www.atyant.in', 'http://localhost:5173' ]
```

---

## Step 5: Test on Live Site

1. Go to `https://www.atyant.in`
2. Open browser console (F12)
3. Try to login with Google
4. Should work without CORS errors!

---

## 🔍 If Using Docker Instead of PM2

```bash
cd /path/to/backend
git pull origin main
docker-compose down
docker-compose up -d --build
docker-compose logs -f backend
```

---

## 🆘 Troubleshooting

### Can't find backend directory?
```bash
# Search for it
find ~ -name "server.js" -type f 2>/dev/null | grep backend
```

### Don't know if using PM2 or Docker?
```bash
# Check PM2
pm2 list

# Check Docker
docker ps
```

### Backend not restarting?
```bash
# Force restart
pm2 delete backend
pm2 start server.js --name backend

# Or with Docker
docker-compose restart backend
```

---

## ✅ Success Indicators

After deployment, you should see:

1. **In VPS logs**: `🔒 CORS Allowed Origins: [ 'https://atyant.in', 'https://www.atyant.in', ... ]`
2. **In browser**: No CORS errors
3. **Google Login**: Works perfectly
4. **All API calls**: Working from www.atyant.in

---

## 📝 What Was Fixed

1. **CORS Configuration**: Added dynamic origin checking with both `atyant.in` and `www.atyant.in`
2. **Security Vulnerabilities**: Fixed nodemailer and path-to-regexp vulnerabilities
3. **Notification System**: Added in-app notifications
4. **Welcome Notification**: Fixed to show only once

All changes are committed and ready to deploy!

---

## ⏱️ Time Required

- Push to GitHub: 10 seconds
- SSH to VPS: 30 seconds
- Pull and restart: 2-3 minutes
- **Total: ~5 minutes**

---

## 🎯 Next Steps

1. Run `git push origin main` (in your local terminal)
2. SSH to your VPS
3. Run the update commands above
4. Test on www.atyant.in

**That's it!** The CORS error will be gone. 🎉
