# Quick Start Guide - Fix Razorpay Payment Error

## 🚨 The Problem
```
❌ Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

## ✅ The Solution (3 Steps)

### Step 1: Start Backend Server
```bash
# Open Terminal 1
cd backend
npm start
```

**Wait for**:
```
✅ MongoDB connected
✅ Server running on port 5000
```

### Step 2: Start Frontend
```bash
# Open Terminal 2
cd frontend
npm run dev
```

**Wait for**:
```
  ➜  Local:   http://localhost:5173/
```

### Step 3: Test Payment
1. Open browser: `http://localhost:5173`
2. Login as a user
3. Find a mentor with services
4. Click "Book" on any service
5. Select date/time (if required)
6. Click "Pay ₹XXX"
7. **Open DevTools (F12)** → Console tab
8. Watch the logs

---

## 📊 What You Should See

### Browser Console (F12)
```javascript
Creating booking order... {
  API_URL: 'http://localhost:5000',
  amount: 500,
  serviceId: '...',
  mentorId: '...'
}
Order response status: 200
Order response: { success: true, order: {...} }
```

### Backend Console
```
POST /api/payment/create-booking-order 200
✅ Order created: order_...
```

---

## 🐛 If It Still Doesn't Work

### Check 1: Is Backend Running?
```bash
curl http://localhost:5000
```
**Should see**: Some response (not "connection refused")

### Check 2: Is MongoDB Connected?
Look at backend console for:
```
✅ MongoDB connected
```

### Check 3: Are Razorpay Keys Set?
```bash
# In backend folder
cat .env | grep RAZORPAY
```
**Should see**:
```
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

### Check 4: Is User Logged In?
Open browser console:
```javascript
localStorage.getItem('token')
```
**Should see**: A long string (JWT token)
**If null**: Login again

---

## 🎯 Quick Test

```bash
# Test backend endpoint
curl -X POST http://localhost:5000/api/payment/create-booking-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount":500,"serviceId":"test","mentorId":"test"}'
```

**Expected**: JSON response (even if error about invalid IDs)
**Not Expected**: HTML page

---

## 📞 Still Having Issues?

### Check These Files:

1. **Backend .env**
```env
MONGODB_URI=mongodb://...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
PORT=5000
```

2. **Frontend .env**
```env
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_...
```

3. **Backend server.js**
```javascript
// Should have CORS enabled
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
```

---

## ✅ Success Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] MongoDB connected
- [ ] User logged in
- [ ] Razorpay keys configured
- [ ] Browser console open (F12)
- [ ] Backend console visible

---

## 🎉 When It Works

You'll see:
1. ✅ Razorpay modal opens
2. ✅ Payment completes
3. ✅ "Booking confirmed!" message
4. ✅ Redirect to /my-bookings or /chat
5. ✅ Email received

---

**Need more help?** Check `RAZORPAY_PAYMENT_FIX.md` for detailed troubleshooting.
