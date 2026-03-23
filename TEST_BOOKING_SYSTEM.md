# Quick Test Guide - Booking Payment System

## 🚀 How to Test the Fixed Booking System

### Prerequisites
1. Backend running on `http://localhost:5000` or `api.atyant.in`
2. Frontend running on `http://localhost:5173` or `atyant.in`
3. MongoDB connected
4. Razorpay test keys configured in `.env`

---

## Test Scenario 1: Video Call Booking

### Steps:
1. **Login as a student**
2. **Go to a mentor's profile** (or use Ask Question flow)
3. **Click on a Video Call service** (e.g., "30-min Career Guidance")
4. **Select a date** from available dates
5. **Select a time slot** from available times
6. **Add notes** (optional): "Looking forward to discussing my career path"
7. **Click "Pay ₹XXX"**
8. **Complete Razorpay payment** (use test card: 4111 1111 1111 1111)
9. **Verify success message**: "✅ Booking confirmed! Check your email for details."
10. **Check redirect**: Should go to `/my-bookings`

### Expected Results:
- ✅ Booking created in database
- ✅ Email sent to student with booking details
- ✅ Email sent to mentor with booking notification
- ✅ Meeting link generated (or fallback link)
- ✅ Service stats updated (totalSales +1, totalRevenue +amount)
- ✅ Booking visible in "My Bookings" page

---

## Test Scenario 2: Chat Service Booking

### Steps:
1. **Login as a student**
2. **Find a mentor with Chat service**
3. **Click "Book" on Chat service**
4. **Add notes** (optional)
5. **Click "Pay ₹XXX"**
6. **Complete payment**
7. **Verify redirect**: Should go to `/chat/:mentorId`

### Expected Results:
- ✅ Booking created (no scheduledAt required)
- ✅ Emails sent
- ✅ Redirected to chat page with mentor

---

## Test Scenario 3: No Availability Set

### Steps:
1. **Login as a student**
2. **Find a mentor who hasn't set availability**
3. **Try to book a Video Call service**
4. **Should see**: "😔 No available slots found in the next 30 days."
5. **Click "Request Custom Time"**
6. **Fill in preferred dates and times**
7. **Click "Send Request"**
8. **Should see**: "Custom availability request feature coming soon!"

### Expected Results:
- ✅ User can't book without availability
- ✅ Custom request UI works
- ⚠️ Backend endpoint not implemented yet (shows alert)

---

## Test Scenario 4: Payment Failure

### Steps:
1. **Start booking flow**
2. **Use Razorpay test card that fails**: 4000 0000 0000 0002
3. **Or close Razorpay modal without paying**

### Expected Results:
- ✅ No booking created
- ✅ User sees error message
- ✅ Can retry payment

---

## Test Scenario 5: Duplicate Payment Prevention

### Steps:
1. **Complete a successful booking**
2. **Manually call verify-booking API again** with same payment ID
3. **Should return**: "Already verified"

### Expected Results:
- ✅ No duplicate booking created
- ✅ Returns existing booking

---

## Check Database After Successful Booking

### MongoDB Query:
```javascript
// Check booking was created
db.bookings.find({ userId: ObjectId("your-user-id") }).sort({ createdAt: -1 }).limit(1)

// Should see:
{
  _id: ObjectId("..."),
  serviceId: ObjectId("..."),
  mentorId: ObjectId("..."),
  userId: ObjectId("..."),
  razorpayPaymentId: "pay_...",
  razorpayOrderId: "order_...",
  scheduledAt: ISODate("2026-03-25T10:00:00.000Z"),
  serviceType: "video-call",
  status: "confirmed",
  amount: 500,
  notes: "User notes",
  meetingLink: "https://meet.google.com/..." or "https://meet.atyant.in/...",
  rescheduleCount: 0,
  remindersSent: {
    email24h: false,
    email1h: false,
    sms1h: false
  },
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}

// Check service stats updated
db.services.findOne({ _id: ObjectId("service-id") })

// Should see:
{
  totalSales: 1, // incremented
  totalRevenue: 500 // incremented
}
```

---

## Check Email Delivery

### Gmail/SMTP Setup:
1. Check `.env` has correct SMTP credentials
2. For Gmail, use App Password (not regular password)
3. Check spam folder if emails not in inbox

### Email Content Should Include:
- ✅ Booking confirmation header
- ✅ Service details (title, duration, price)
- ✅ Date & time (formatted nicely)
- ✅ Meeting link (for video/audio calls)
- ✅ User notes
- ✅ What's next instructions
- ✅ Reminder schedule info

---

## Check Console Logs

### Backend Console Should Show:
```
✅ Booking created: 65f8a9b2c3d4e5f6a7b8c9d0 | video-call | ₹500
✅ Confirmation emails sent
✅ Service booking payment: ₹500 | Service:65f8a9b2c3d4e5f6a7b8c9d0
```

### Frontend Console Should Show:
```
Payment successful
Booking confirmed
Redirecting to /my-bookings
```

---

## Common Issues & Solutions

### Issue: "Failed to create booking"
**Solution**: ✅ FIXED - BookingService.createBooking() method now implemented

### Issue: "Payment verification failed"
**Solution**: Check Razorpay signature verification, ensure RAZORPAY_KEY_SECRET is correct

### Issue: No emails sent
**Solution**: 
- Check SMTP credentials in `.env`
- Check nodemailer initialization in BookingService
- Check console for email errors

### Issue: No meeting link generated
**Solution**: 
- Check GOOGLE_CALENDAR_ENABLED in `.env`
- If disabled, fallback link should be used: `https://meet.atyant.in/{bookingId}`

### Issue: Modal not full screen
**Solution**: ✅ FIXED - Both modals already full screen (100vw x 100vh)

---

## Razorpay Test Cards

### Successful Payment:
- **Card**: 4111 1111 1111 1111
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### Failed Payment:
- **Card**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### 3D Secure (OTP):
- **Card**: 4000 0025 0000 3155
- **OTP**: 1234

---

## API Endpoints to Test Manually

### 1. Create Booking Order
```bash
curl -X POST http://localhost:5000/api/payment/create-booking-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amount": 500,
    "serviceId": "SERVICE_ID",
    "mentorId": "MENTOR_ID",
    "scheduledAt": "2026-03-25T10:00:00",
    "notes": "Test booking"
  }'
```

### 2. Get Mentor Availability
```bash
curl http://localhost:5000/api/monetization/availability/mentor/MENTOR_ID
```

### 3. Get My Bookings
```bash
curl http://localhost:5000/api/monetization/my-bookings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Success Checklist ✅

Before marking as complete, verify:

- [ ] Video call booking works end-to-end
- [ ] Audio call booking works end-to-end
- [ ] Chat service booking works and redirects correctly
- [ ] Answer card booking works
- [ ] Emails are sent to both user and mentor
- [ ] Meeting links are generated (or fallback used)
- [ ] Service stats update correctly
- [ ] Duplicate payments are prevented
- [ ] Payment failures are handled gracefully
- [ ] Modals are full screen on desktop and mobile
- [ ] Available slots show correctly based on mentor schedule
- [ ] Blocked dates are respected
- [ ] Buffer time is applied between slots
- [ ] No console errors in browser or backend

---

## Next: Push to Production

Once all tests pass:

1. **Commit changes**:
```bash
git add .
git commit -m "Fix: Implement BookingService.createBooking() and complete payment flow"
```

2. **Push to repository**:
```bash
git push origin main
```

3. **Deploy backend** (VPS):
```bash
ssh your-vps
cd /path/to/backend
git pull
npm install
pm2 restart backend
```

4. **Deploy frontend** (Vercel):
- Vercel will auto-deploy on push to main

5. **Monitor logs** for any production issues

---

**Status**: 🎯 READY FOR TESTING

All critical bugs fixed. System is ready for comprehensive testing.
