# 🚀 Quick Testing Guide - Booking System

## Step 1: Start Backend
```bash
cd backend
npm start
```

**Expected Output:**
```
✅ MongoDB connected
✅ Reminder cron job started
🚀 Server running on port 5000
```

## Step 2: Start Frontend
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
```

## Step 3: Test Complete Booking Flow

### A. User Side - Book a Service

1. **Login as User**
   - Go to `http://localhost:5173/login`
   - Login with your user account

2. **Ask a Question**
   - Go to `http://localhost:5173/ask`
   - Fill in question details
   - Submit question

3. **Get Matched with Mentor**
   - Wait for AI to match you with a mentor
   - Modal will show mentor details + services

4. **Book a Service**
   - Click on any service (Video Call, Audio Call, etc.)
   - Select date and time
   - Add notes (optional)
   - Click "Proceed to Payment"

5. **Complete Payment**
   - Razorpay modal opens
   - Use test card: `4111 1111 1111 1111`
   - CVV: `123`, Expiry: Any future date
   - Complete payment

6. **Check Confirmation**
   - ✅ Success message appears
   - ✅ Check email for confirmation (both user and mentor)
   - ✅ Email contains Google Meet link

7. **View Your Bookings**
   - Go to `http://localhost:5173/my-bookings`
   - See your booking in "Upcoming" tab
   - Check booking details

8. **Test Reschedule**
   - Click "Reschedule" button
   - Select new date/time
   - Confirm reschedule
   - ✅ New Google Meet link generated
   - ✅ Email sent with new details

9. **Test Cancel**
   - Click "Cancel" button
   - Select cancellation reason
   - Confirm cancellation
   - ✅ Refund processed based on timing
   - ✅ Email sent with cancellation confirmation

### B. Mentor Side - Manage Services

1. **Login as Mentor**
   - Go to `http://localhost:5173/login`
   - Login with mentor account

2. **Go to Monetization Dashboard**
   - Go to `http://localhost:5173/mentor-monetization`
   - See Overview, Services, Bookings, Availability, Earnings tabs

3. **Create a Service**
   - Click "Services" tab
   - Click "Create Service" button
   - Fill in service details:
     - Title: "1-on-1 Career Guidance"
     - Type: Video Call
     - Duration: 30 minutes
     - Price: ₹500
     - Description: "Personalized career guidance session"
   - Click "Save Service"

4. **Set Availability**
   - Click "Availability" tab
   - Select timezone
   - Toggle days (Mon-Sun)
   - Add time slots (e.g., 9:00 AM - 5:00 PM)
   - Set buffer time (e.g., 15 minutes)
   - Click "Save Availability"

5. **View Bookings**
   - Click "Bookings" tab
   - See all bookings with status
   - Filter by status (Upcoming, Completed, Cancelled)

6. **Check Earnings**
   - Click "Earnings" tab
   - See total earnings, pending, completed
   - View transaction history

## Step 4: Test Automated Reminders

### Test 24h Reminder
1. Create a booking for exactly 24 hours from now
2. Wait for cron job to run (runs every hour at :00)
3. Check email for 24h reminder
4. Email should contain:
   - Session details
   - Google Meet link
   - Time remaining

### Test 1h Reminder
1. Create a booking for exactly 1 hour from now
2. Wait for cron job to run
3. Check email for 1h reminder
4. Email should contain:
   - "Your session starts in 1 hour"
   - Google Meet link
   - Join button

### Manual Trigger (for testing)
```bash
# In backend directory
node -e "import('./services/ReminderCron.js').then(m => m.default.checkAndSendReminders())"
```

## Step 5: Test Edge Cases

### A. Refund Logic
- **24+ hours before**: 100% refund
  - Create booking for 2 days from now
  - Cancel immediately
  - Check refund amount = full price

- **12-24 hours before**: 50% refund
  - Create booking for 18 hours from now
  - Cancel immediately
  - Check refund amount = 50% of price

- **Less than 12 hours**: 0% refund
  - Create booking for 6 hours from now
  - Cancel immediately
  - Check refund amount = 0

### B. Reschedule Limit
- Reschedule a booking once ✅
- Reschedule same booking again ✅
- Try to reschedule third time ❌ (should show error)

### C. Email Delivery
- Check inbox for confirmation email
- Check spam folder if not received
- Verify email contains:
  - Booking details
  - Google Meet link
  - Calendar invite (if Google Calendar enabled)

### D. Payment Failure
- Start booking process
- Close Razorpay modal without paying
- Booking should not be created
- No email should be sent

## Step 6: Check Console Logs

### Backend Console
```
✅ MongoDB connected
✅ Reminder cron job started
🚀 Server running on port 5000
📡 CORS: https://atyant.in, https://www.atyant.in, http://localhost:5173
🌍 Environment: production

# When booking is created:
✅ Booking created: [booking_id]
📧 Confirmation email sent to user
📧 Confirmation email sent to mentor

# When reminder is sent:
🔔 Running reminder check...
✅ Sent 2 24h reminders and 1 1h reminders
```

### Frontend Console
```
# Should be clean, no errors
# If you see errors, check:
- API_URL is correct
- VITE_GOOGLE_CLIENT_ID is set
- All imports are correct
```

## Common Issues & Solutions

### Issue 1: Email not received
**Solution:**
- Check spam folder
- Verify SMTP credentials in `.env`
- Check backend console for email errors
- Test with different email provider

### Issue 2: Cron job not running
**Solution:**
- Check backend console for "Reminder cron job started"
- Verify `node-cron` is installed
- Check `ReminderCron.start()` is called in `server.js`

### Issue 3: Payment not working
**Solution:**
- Verify Razorpay keys in `.env`
- Check Razorpay dashboard for test mode
- Use test card: `4111 1111 1111 1111`

### Issue 4: Google Meet link not generated
**Solution:**
- Check if `GOOGLE_CALENDAR_ENABLED=true` in `.env`
- Verify `google-key.json` exists
- If disabled, system uses fallback Meet link

### Issue 5: Booking not showing in My Bookings
**Solution:**
- Check MongoDB connection
- Verify booking was created (check backend console)
- Refresh page
- Check browser console for errors

## Success Criteria

✅ Backend starts without errors
✅ Frontend starts without errors
✅ User can book a service
✅ Payment completes successfully
✅ Confirmation emails sent
✅ Booking appears in My Bookings
✅ User can reschedule (up to 2 times)
✅ User can cancel with correct refund
✅ Mentor can see bookings
✅ Cron job runs every hour
✅ Reminders sent at correct times

## Next Steps After Testing

1. **Deploy to Production**
   - Push code to GitHub
   - Deploy backend to VPS
   - Deploy frontend to Vercel
   - Update environment variables

2. **Monitor System**
   - Check email delivery rates
   - Monitor booking conversion
   - Track cancellation reasons
   - Analyze popular services

3. **Gather Feedback**
   - Ask users about booking experience
   - Check mentor satisfaction
   - Identify pain points
   - Plan improvements

---

**Happy Testing! 🎉**

If you encounter any issues, check:
1. Console logs (backend & frontend)
2. Environment variables
3. MongoDB connection
4. Email configuration
5. Razorpay integration
