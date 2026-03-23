# Razorpay Payment Error Fix - "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"

## 🔍 Error Analysis

### What This Error Means
```
❌ Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

This error occurs when:
1. The API endpoint returns HTML instead of JSON
2. Usually means the backend is not running or the endpoint doesn't exist
3. Could be a 404 error page or 500 error page being returned

---

## ✅ Fixes Applied

### 1. Added Better Error Handling in ServiceBookingModal

**File**: `frontend/src/components/ServiceBookingModal.jsx`

**Changes**:
```javascript
// Before payment order creation
console.log('Creating booking order...', {
  API_URL,
  amount: service.price,
  serviceId: service._id,
  mentorId,
  scheduledAt,
  notes
});

// Check if response is JSON before parsing
const contentType = orderRes.headers.get('content-type');
if (!contentType || !contentType.includes('application/json')) {
  const text = await orderRes.text();
  console.error('Non-JSON response:', text.substring(0, 500));
  throw new Error(`Server error (${orderRes.status}). Please check if the backend is running at ${API_URL}`);
}

// Log response details
console.log('Order response status:', orderRes.status);
console.log('Order response headers:', Object.fromEntries(orderRes.headers.entries()));
```

### 2. Added Verification Error Handling

```javascript
// Check if verification response is JSON
const contentType = verifyRes.headers.get('content-type');
if (!contentType || !contentType.includes('application/json')) {
  const text = await verifyRes.text();
  console.error('Non-JSON response:', text);
  throw new Error('Server error during payment verification. Please contact support with payment ID: ' + response.razorpay_payment_id);
}
```

---

## 🔧 Troubleshooting Steps

### Step 1: Check if Backend is Running

```bash
# Check if backend is running
curl http://localhost:5000/api/payment/create-booking-order

# Or open in browser
http://localhost:5000
```

**Expected**: Should see some response (even if it's an error about missing auth)
**If you see**: HTML page or connection refused → Backend is not running

### Step 2: Start the Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies (if not done)
npm install

# Start the server
npm start
# OR
node server.js
```

**Expected output**:
```
✅ MongoDB connected
✅ Server running on port 5000
```

### Step 3: Check Backend Logs

When you click "Pay" button, check the backend console for:
```
POST /api/payment/create-booking-order
```

**If you see errors**, they will show in the backend console.

### Step 4: Check Frontend Console

Open browser DevTools (F12) → Console tab

Look for:
```javascript
Creating booking order... { API_URL: 'http://localhost:5000', ... }
Order response status: 200
Order response: { success: true, order: {...} }
```

**If you see**:
- `Order response status: 404` → Endpoint doesn't exist
- `Order response status: 500` → Server error
- `Non-JSON response: <!DOCTYPE html>` → Backend returned error page

---

## 🚀 Complete Payment Flow (With Logging)

### 1. User Clicks "Pay ₹XXX"
```javascript
// Frontend logs:
Creating booking order... {
  API_URL: 'http://localhost:5000',
  amount: 500,
  serviceId: '65f8a9b2c3d4e5f6a7b8c9d0',
  mentorId: '65f8a9b2c3d4e5f6a7b8c9d1',
  scheduledAt: '2026-03-25T10:00:00',
  notes: 'Looking forward to the session'
}
```

### 2. Backend Creates Razorpay Order
```javascript
// Backend logs:
POST /api/payment/create-booking-order
✅ Order created: order_NXYz123456789
```

### 3. Frontend Receives Order
```javascript
// Frontend logs:
Order response status: 200
Order response: {
  success: true,
  order: {
    id: 'order_NXYz123456789',
    amount: 50000,
    currency: 'INR'
  },
  razorpayKeyId: 'rzp_test_...'
}
```

### 4. Razorpay Modal Opens
```javascript
// User enters card details and pays
```

### 5. Payment Success → Verification
```javascript
// Frontend logs:
Payment successful, verifying... {
  razorpay_order_id: 'order_NXYz123456789',
  razorpay_payment_id: 'pay_ABC123456789',
  razorpay_signature: '...'
}
```

### 6. Backend Verifies Payment
```javascript
// Backend logs:
POST /api/payment/verify-booking
✅ Payment verified: pay_ABC123456789
✅ Booking created: 65f8a9b2c3d4e5f6a7b8c9d2
✅ Confirmation emails sent
```

### 7. Frontend Redirects
```javascript
// Frontend logs:
Verification response: {
  success: true,
  message: 'Booking confirmed successfully',
  booking: { _id: '...', status: 'confirmed', ... }
}

// Redirects to:
// - /chat/:mentorId (for chat services)
// - /my-bookings (for other services)
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Backend Not Running
**Error**: `Failed to fetch` or `Network error`
**Solution**: Start the backend server
```bash
cd backend
npm start
```

### Issue 2: Wrong API URL
**Error**: `404 Not Found`
**Solution**: Check `frontend/.env`
```env
VITE_API_URL=http://localhost:5000
```

### Issue 3: Missing Razorpay Keys
**Error**: `Payment service not configured`
**Solution**: Check `backend/.env`
```env
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

### Issue 4: CORS Error
**Error**: `CORS policy: No 'Access-Control-Allow-Origin' header`
**Solution**: Check `backend/server.js` has CORS enabled
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
```

### Issue 5: Invalid Token
**Error**: `Unauthorized` or `Invalid token`
**Solution**: 
1. Check if user is logged in
2. Check if token is in localStorage
3. Re-login if needed

### Issue 6: MongoDB Not Connected
**Error**: `MongoError` or `Connection refused`
**Solution**: 
1. Check if MongoDB is running
2. Check `backend/.env` has correct `MONGODB_URI`
3. Start MongoDB service

---

## 📋 Pre-Flight Checklist

Before testing payment, ensure:

- [ ] Backend server is running (`npm start` in backend folder)
- [ ] MongoDB is connected (check backend console)
- [ ] Frontend is running (`npm run dev` in frontend folder)
- [ ] User is logged in (has valid token)
- [ ] Razorpay keys are configured in `backend/.env`
- [ ] API_URL is correct in `frontend/.env`
- [ ] Browser console is open (F12) to see logs
- [ ] Backend console is visible to see server logs

---

## 🧪 Testing the Fix

### Test 1: Check Backend Health
```bash
# Should return JSON (not HTML)
curl http://localhost:5000/api/payment/create-booking-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -X POST \
  -d '{"amount":500,"serviceId":"test","mentorId":"test"}'
```

**Expected**: JSON response (even if error about invalid IDs)
**Not Expected**: HTML page

### Test 2: Check Frontend Logs
1. Open browser DevTools (F12)
2. Go to Console tab
3. Click "Pay" button
4. Look for logs starting with "Creating booking order..."

### Test 3: Check Backend Logs
1. Look at backend console
2. Should see: `POST /api/payment/create-booking-order`
3. Should see: Order creation logs

### Test 4: Complete Payment Flow
1. Select service
2. Select date/time (if required)
3. Click "Pay ₹XXX"
4. Check console logs
5. Complete Razorpay payment (use test card)
6. Verify booking is created
7. Check email for confirmation

---

## 🔍 Debug Commands

### Check if Backend is Reachable
```bash
# Windows PowerShell
Test-NetConnection localhost -Port 5000

# Or use curl
curl http://localhost:5000
```

### Check Backend Routes
```bash
# List all routes (if you have a route listing endpoint)
curl http://localhost:5000/api/routes

# Or check specific endpoint
curl http://localhost:5000/api/payment/create-booking-order
```

### Check MongoDB Connection
```bash
# In backend console, you should see:
✅ MongoDB connected
```

### Check Environment Variables
```bash
# In backend folder
cat .env | grep RAZORPAY
cat .env | grep MONGODB

# In frontend folder
cat .env | grep VITE_API_URL
```

---

## 📊 Expected vs Actual

### Expected Flow
```
User clicks Pay
  ↓
Frontend: Creating booking order...
  ↓
Backend: POST /api/payment/create-booking-order
  ↓
Backend: ✅ Order created
  ↓
Frontend: Order response: { success: true, ... }
  ↓
Razorpay modal opens
  ↓
User pays
  ↓
Frontend: Payment successful, verifying...
  ↓
Backend: POST /api/payment/verify-booking
  ↓
Backend: ✅ Payment verified
  ↓
Backend: ✅ Booking created
  ↓
Frontend: ✅ Booking confirmed!
  ↓
Redirect to /my-bookings or /chat/:mentorId
```

### Actual Flow (With Error)
```
User clicks Pay
  ↓
Frontend: Creating booking order...
  ↓
Backend: NOT RUNNING ❌
  ↓
Frontend: ❌ Unexpected token '<', "<!DOCTYPE "...
  ↓
STOPS HERE
```

---

## ✅ Solution Summary

1. **Start Backend**: Make sure backend is running
2. **Check Logs**: Open browser console and backend console
3. **Verify Config**: Check .env files
4. **Test Endpoint**: Use curl to test API endpoint
5. **Follow Logs**: Watch console logs during payment flow

---

## 🎯 Quick Fix Commands

```bash
# Terminal 1: Start Backend
cd backend
npm install
npm start

# Terminal 2: Start Frontend
cd frontend
npm install
npm run dev

# Terminal 3: Check Backend Health
curl http://localhost:5000

# Browser: Open DevTools
Press F12
Go to Console tab
Try payment flow
```

---

## 📝 Files Modified

1. ✅ `frontend/src/components/ServiceBookingModal.jsx` - Added error handling and logging

---

## 🎉 Success Indicators

When everything works, you should see:

**Browser Console**:
```
Creating booking order... { API_URL: 'http://localhost:5000', ... }
Order response status: 200
Order response: { success: true, order: {...} }
Payment successful, verifying...
Verification response: { success: true, ... }
✅ Booking confirmed!
```

**Backend Console**:
```
POST /api/payment/create-booking-order
✅ Order created: order_...
POST /api/payment/verify-booking
✅ Payment verified: pay_...
✅ Booking created: 65f8a9b2c3d4e5f6a7b8c9d2
✅ Confirmation emails sent
```

**User Experience**:
- Razorpay modal opens
- Payment completes successfully
- Success message appears
- Redirects to correct page
- Email received

---

**Status**: ✅ ERROR HANDLING IMPROVED
**Next Step**: Start backend and test payment flow
