# 🚀 VPS Deployment Steps - Fix CORS & Updates

## ❌ Current Issues on Live Server

1. **CORS Error**: `No 'Access-Control-Allow-Origin' header`
2. **Google Login**: Not working due to CORS
3. **API Calls**: Blocked from www.atyant.in

---

## ✅ Solution: Deploy Updated Backend

### 📋 Pre-Deployment Checklist

- [ ] All code committed to Git
- [ ] Backend CORS fix in `server.js`
- [ ] Notification system added
- [ ] Security vulnerabilities fixed
- [ ] Welcome notification fix

---

## 🔧 Step-by-Step Deployment

### 1. **Connect to VPS**
```bash
ssh user@api.atyant.in
# Or
ssh user@YOUR_VPS_IP
```

### 2. **Navigate to Backend Directory**
```bash
cd /path/to/backend
# Common paths:
# cd /var/www/atyant-backend
# cd /home/user/atyant/backend
# cd ~/atyant/backend
```

### 3. **Pull Latest Code**
```bash
git status  # Check current state
git stash   # Stash any local changes
git pull origin main  # Pull latest code
```

### 4. **Install Dependencies**
```bash
npm install  # Install new packages (notification system)
```

### 5. **Check Environment Variables**
```bash
cat .env | grep FRONTEND_URL
```

Should show:
```
FRONTEND_URL=https://atyant.in
FRONTEND_URL_WWW=https://www.atyant.in
```

If not, add them:
```bash
nano .env
# Add:
# FRONTEND_URL=https://atyant.in
# FRONTEND_URL_WWW=https://www.atyant.in
# Save: Ctrl+O, Enter, Ctrl+X
```

### 6. **Restart Backend**

#### If using PM2:
```bash
pm2 restart backend
# Or restart all
pm2 restart all

# Check status
pm2 status

# View logs
pm2 logs backend --lines 50
```

#### If using Docker:
```bash
docker-compose down
docker-compose up -d --build

# Check logs
docker-compose logs -f backend
```

#### If running directly:
```bash
# Find and kill existing process
ps aux | grep node
kill -9 PID_NUMBER

# Start again
nohup node server.js > output.log 2>&1 &
```

### 7. **Verify Backend is Running**
```bash
curl http://localhost:5000/health
# Or
curl https://api.atyant.in/health
```

Should return: `{"status":"ok"}`

### 8. **Check CORS in Logs**
```bash
pm2 logs backend --lines 20
```

Look for:
```
🔒 CORS Allowed Origins: [ 'https://atyant.in', 'https://www.atyant.in', ... ]
```

### 9. **Test CORS from Browser**

Open browser console on www.atyant.in:
```javascript
fetch('https://api.atyant.in/api/profile/me', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

Should work without CORS error!

---

## 🧪 Testing Checklist

### Backend Tests
- [ ] Backend is running (`curl https://api.atyant.in/health`)
- [ ] CORS origins logged correctly
- [ ] No errors in PM2 logs
- [ ] Port 5000 listening (`netstat -tulpn | grep 5000`)

### Frontend Tests (on www.atyant.in)
- [ ] Login works
- [ ] Google login works
- [ ] Profile loads
- [ ] API calls work
- [ ] No CORS errors in console
- [ ] Notification bell appears
- [ ] Welcome notification (first time only)

---

## 🔍 Troubleshooting

### Issue 1: CORS Still Not Working

**Check Nginx Config**:
```bash
sudo nano /etc/nginx/sites-available/api.atyant.in
```

Make sure it does NOT have:
```nginx
add_header 'Access-Control-Allow-Origin' '*';
```

If it does, remove it and restart:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

**Let Express handle CORS, not Nginx!**

### Issue 2: Backend Not Starting

**Check logs**:
```bash
pm2 logs backend --err --lines 50
```

**Common issues**:
- Port already in use
- MongoDB connection failed
- Missing environment variables
- Syntax errors

**Fix**:
```bash
pm2 delete backend
pm2 start server.js --name backend
```

### Issue 3: Old Code Still Running

**Force update**:
```bash
git fetch --all
git reset --hard origin/main
npm install
pm2 restart backend --update-env
```

### Issue 4: Cloudflare Caching

If using Cloudflare:
1. Go to Cloudflare dashboard
2. Select api.atyant.in
3. Caching → Purge Everything
4. Wait 2-3 minutes

---

## 📝 Quick Commands Reference

### Check Backend Status
```bash
pm2 status
pm2 logs backend
curl https://api.atyant.in/health
```

### Restart Backend
```bash
pm2 restart backend
pm2 logs backend --lines 20
```

### View Logs
```bash
pm2 logs backend --lines 100
pm2 logs backend --err  # Only errors
```

### Update Code
```bash
cd /path/to/backend
git pull origin main
npm install
pm2 restart backend
```

---

## 🆘 Emergency Rollback

If something breaks:

```bash
# Go back to previous commit
git log --oneline  # Find previous commit hash
git reset --hard COMMIT_HASH
npm install
pm2 restart backend
```

---

## ✅ Success Indicators

### Backend Logs Should Show:
```
✅ MongoDB connected
🔒 CORS Allowed Origins: [ 'https://atyant.in', 'https://www.atyant.in', 'http://localhost:5173' ]
🚀 Server running on port 5000
📡 CORS: https://atyant.in, https://www.atyant.in
```

### Browser Console Should Show:
```
✅ No CORS errors
✅ API calls successful
✅ Login working
✅ Profile loading
```

---

## 📊 Deployment Summary

**Files Changed**:
- `backend/server.js` - CORS fix
- `backend/models/Notification.js` - New model
- `backend/utils/notificationService.js` - New service
- `backend/routes/notificationRoutes.js` - New routes
- `backend/package.json` - Updated dependencies

**Actions Required**:
1. SSH to VPS
2. Pull latest code
3. Run `npm install`
4. Restart backend
5. Test CORS

**Time Required**: 5-10 minutes

---

## 🎯 Final Verification

Run this on www.atyant.in console:
```javascript
// Test 1: Health check
fetch('https://api.atyant.in/health')
  .then(r => r.json())
  .then(d => console.log('✅ Health:', d))
  .catch(e => console.error('❌ Health:', e));

// Test 2: CORS check
fetch('https://api.atyant.in/api/profile/me', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
})
  .then(r => r.json())
  .then(d => console.log('✅ CORS:', d))
  .catch(e => console.error('❌ CORS:', e));
```

Both should work without errors!

---

## 📞 Need Help?

If still not working, send me:
1. PM2 logs: `pm2 logs backend --lines 50`
2. Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Browser console errors
4. Output of: `curl https://api.atyant.in/health`

---

## ✅ Deployment Complete!

Once deployed:
- ✅ CORS errors fixed
- ✅ Google login working
- ✅ API calls working
- ✅ Notification system live
- ✅ Security vulnerabilities fixed

**Ready to go live!** 🚀
