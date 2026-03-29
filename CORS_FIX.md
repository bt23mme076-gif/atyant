# 🔧 CORS Error Fix

## ❌ Error
```
Access to fetch at 'https://api.atyant.in/api/profile/me' from origin 'https://www.atyant.in' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

---

## ✅ Solution

### 1. Updated CORS Configuration
Changed from static array to dynamic function that:
- Allows both `atyant.in` and `www.atyant.in`
- Allows localhost for development
- Logs blocked origins for debugging
- Allows requests with no origin (mobile apps, curl)

### 2. Changes Made in `backend/server.js`

**Before**:
```javascript
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_WWW,
  process.env.DEV_URL || 'http://localhost:5173',
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  // ...
}));
```

**After**:
```javascript
const allowedOrigins = [
  'https://atyant.in',
  'https://www.atyant.in',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_WWW,
  process.env.DEV_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn('⚠️ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  // ...
}));
```

---

## 🚀 Deployment Steps

### On VPS (api.atyant.in)

1. **Pull latest code**:
```bash
cd /path/to/backend
git pull origin main
```

2. **Restart backend**:
```bash
# If using PM2
pm2 restart backend

# If using Docker
docker-compose down
docker-compose up -d --build

# If running directly
pkill node
node server.js &
```

3. **Check logs**:
```bash
# PM2
pm2 logs backend

# Docker
docker-compose logs -f backend

# Direct
tail -f nohup.out
```

4. **Verify CORS**:
Look for this line in logs:
```
🔒 CORS Allowed Origins: [ 'https://atyant.in', 'https://www.atyant.in', 'http://localhost:5173' ]
```

---

## 🧪 Testing

### 1. Test from Browser Console
```javascript
fetch('https://api.atyant.in/api/profile/me', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### 2. Test with curl
```bash
curl -H "Origin: https://www.atyant.in" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Authorization" \
     -X OPTIONS \
     https://api.atyant.in/api/profile/me -v
```

Should see:
```
< Access-Control-Allow-Origin: https://www.atyant.in
< Access-Control-Allow-Credentials: true
```

---

## 🔍 Debugging

### Check if backend is running
```bash
curl https://api.atyant.in/health
```

### Check CORS headers
```bash
curl -I https://api.atyant.in/api/profile/me
```

### Check backend logs
```bash
pm2 logs backend --lines 100
```

---

## ⚠️ Common Issues

### 1. Backend not restarted
**Solution**: Restart backend service

### 2. Old code still running
**Solution**: 
```bash
git pull
pm2 restart backend --update-env
```

### 3. Nginx blocking CORS
**Solution**: Check nginx config at `/etc/nginx/sites-available/api.atyant.in`

Should NOT have:
```nginx
add_header 'Access-Control-Allow-Origin' '*';
```

Let Express handle CORS, not Nginx.

### 4. Cloudflare caching old response
**Solution**: 
- Go to Cloudflare dashboard
- Purge cache for api.atyant.in
- Or wait 5 minutes

---

## ✅ Verification Checklist

- [ ] Backend code updated with new CORS config
- [ ] Backend restarted on VPS
- [ ] Logs show "CORS Allowed Origins" with correct URLs
- [ ] Browser console shows no CORS errors
- [ ] Login works on www.atyant.in
- [ ] Profile loads on www.atyant.in
- [ ] API calls work from frontend

---

## 📝 Notes

- CORS is now more permissive and logs blocked origins
- Both `atyant.in` and `www.atyant.in` are allowed
- Localhost is allowed for development
- Credentials (cookies) are enabled
- Preflight requests are handled

---

## 🆘 If Still Not Working

1. **Check if backend is actually running**:
```bash
ps aux | grep node
```

2. **Check if port 5000 is listening**:
```bash
netstat -tulpn | grep 5000
```

3. **Check nginx logs**:
```bash
tail -f /var/log/nginx/error.log
```

4. **Restart everything**:
```bash
pm2 restart all
sudo systemctl restart nginx
```

5. **Contact me with**:
- Backend logs
- Nginx logs
- Browser console errors
- Output of `curl https://api.atyant.in/health`
