# 🐳 Docker Deployment Guide (Hindi + English)

## Problem
CORS error aa raha hai kyunki VPS par purana code chal raha hai.

---

## Solution: VPS par Docker se deploy karo

### Step 1: VPS mein login karo

```bash
ssh root@api.atyant.in
```

Ya agar username alag hai:
```bash
ssh your-username@api.atyant.in
```

---

### Step 2: Project folder mein jao

```bash
cd /var/www/atyant
# Ya jahan tumhara project hai
```

Agar path nahi pata to search karo:
```bash
find ~ -name "docker-compose.yml" 2>/dev/null
```

---

### Step 3: Latest code pull karo

```bash
git pull origin main
```

---

### Step 4: Docker containers stop karo

```bash
docker-compose down
```

---

### Step 5: Fresh build karo (IMPORTANT!)

```bash
docker-compose build --no-cache
```

`--no-cache` zaroori hai, warna purana code use karega!

---

### Step 6: Start karo

```bash
docker-compose up -d
```

`-d` means background mein chalega.

---

### Step 7: Logs check karo

```bash
docker-compose logs -f backend
```

Yeh line dikhni chahiye:
```
🔒 CORS Allowed Origins: [ 'https://atyant.in', 'https://www.atyant.in', 'http://localhost:5173' ]
```

Agar yeh line dikhi, matlab backend updated hai! ✅

---

### Step 8: Test karo

Browser mein jao: `https://www.atyant.in`

Google login try karo. CORS error nahi aana chahiye!

---

## 🚀 Quick One-Liner (All Steps)

VPS par yeh ek command run karo:

```bash
cd /var/www/atyant && git pull origin main && docker-compose down && docker-compose build --no-cache && docker-compose up -d && docker-compose logs --tail=50 backend
```

---

## 🔍 Troubleshooting

### Issue 1: Git pull nahi ho raha

```bash
# Check git status
git status

# Discard local changes
git reset --hard origin/main
git pull origin main
```

---

### Issue 2: Docker build fail ho raha

```bash
# Check Docker logs
docker-compose logs backend

# Remove all containers and rebuild
docker-compose down -v
docker system prune -a -f
docker-compose build --no-cache
docker-compose up -d
```

---

### Issue 3: CORS line logs mein nahi dikh raha

Matlab backend start nahi hua properly. Check karo:

```bash
# Container running hai ya nahi
docker ps

# Backend logs dekho
docker-compose logs backend

# Container restart karo
docker-compose restart backend
```

---

### Issue 4: Nginx CORS headers add kar raha hai

Nginx config check karo:

```bash
cat /etc/nginx/sites-available/api.atyant.in
```

Agar yeh lines hain to **REMOVE** karo:
```nginx
add_header 'Access-Control-Allow-Origin' '*';
add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization';
```

Phir Nginx restart:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## ✅ Success Checklist

- [ ] VPS mein login ho gaye
- [ ] `git pull origin main` successful
- [ ] `docker-compose build --no-cache` successful
- [ ] `docker-compose up -d` successful
- [ ] Logs mein "CORS Allowed Origins" line dikhi
- [ ] `docker ps` mein container running dikha
- [ ] www.atyant.in par login test kiya
- [ ] CORS error nahi aaya

---

## 📝 Important Notes

1. **Hamesha `--no-cache` use karo** build karte waqt, warna purana code use karega
2. **Logs zaroor check karo** CORS line confirm karne ke liye
3. **Nginx config check karo** agar phir bhi CORS error aaye
4. **Browser cache clear karo** testing se pehle (Ctrl+Shift+Delete)

---

## 🆘 Agar Phir Bhi Nahi Hua

Mujhe yeh bhejo:

1. **Docker logs**:
```bash
docker-compose logs backend > backend-logs.txt
```

2. **Nginx config**:
```bash
cat /etc/nginx/sites-available/api.atyant.in > nginx-config.txt
```

3. **Container status**:
```bash
docker ps -a > docker-status.txt
```

4. **Browser console error** (screenshot)

---

## 🎯 Expected Result

Deployment ke baad:
- ✅ Backend updated code use karega
- ✅ CORS properly configured hoga
- ✅ Google login kaam karega
- ✅ API calls www.atyant.in se kaam karenge
- ✅ Notification system live hoga

**Time: 5-10 minutes** ⏱️
