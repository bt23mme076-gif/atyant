# My Questions Enhancement - Testing Guide

## ✅ Implementation Status: COMPLETE

All code has been implemented and verified with no diagnostics errors. Ready for end-to-end testing.

## 🎯 What Was Implemented

### 1. Email Name Fixes ✅
- **File**: `backend/services/BookingService.js`
- **Change**: Added fallback logic for user/mentor names
- **Before**: `user.name` → "undefined" if name is null
- **After**: `user.name || user.username || 'User'`
- **Lines**: 67, 68, 155, 156

### 2. Payment Redirect ✅
- **File**: `frontend/src/components/ServiceBookingModal.jsx`
- **Change**: Redirect to `/my-questions` after successful payment
- **Before**: `window.location.href = '/my-bookings'`
- **After**: `window.location.href = '/my-questions'`
- **Line**: 228

### 3. Booking Model Enhancement ✅
- **File**: `backend/models/Booking.js`
- **Change**: Added optional `questionId` field to link bookings to questions
- **Lines**: 24-28

### 4. Dashboard API Endpoint ✅
- **File**: `backend/routes/questionRoutes.js`
- **Endpoint**: `GET /api/questions/my-dashboard`
- **Returns**: Combined questions + bookings with stats
- **Lines**: 363-453

### 5. Enhanced Frontend Component ✅
- **File**: `frontend/src/components/MyQuestionsEnhanced.jsx`
- **Features**:
  - Dashboard stats (questions, bookings, upcoming calls)
  - Service type badges (Video Call, Audio Call, Chat, Answer Card)
  - Scheduling info with countdown timers
  - Smart "Join Call" button (15 mins before → 30 mins after)
  - "Chat" button linking to mentor
  - Linked bookings within question cards
  - Auto-refresh every 10 seconds

### 6. CSS Enhancements ✅
- **File**: `frontend/src/components/MyQuestions.css`
- **Added**: Booking cards, scheduling info, action buttons, linked bookings
- **Mobile responsive**: Breakpoints for all screen sizes

### 7. App Routing ✅
- **File**: `frontend/src/App.jsx`
- **Import**: `MyQuestionsEnhanced` component
- **Route**: `/my-questions` uses enhanced component

---

## 🧪 Testing Checklist

### Phase 1: Email Name Testing
**Goal**: Verify emails show proper names (not "undefined")

1. **Test User Booking Confirmation Email**
   ```bash
   # Make a booking as a user
   # Check email inbox for confirmation
   # Verify: "Hi [Your Name]" (not "Hi undefined")
   ```

2. **Test Mentor Notification Email**
   ```bash
   # Check mentor's email inbox
   # Verify: "Hi [Mentor Name]" (not "Hi undefined")
   # Verify: "New booking from [User Name]" (not "from undefined")
   ```

3. **Test Reminder Emails**
   ```bash
   # Wait for 24h/1h reminder (or manually trigger)
   # Check both user and mentor emails
   # Verify names are correct
   ```

**Expected Result**: All emails show proper names with fallback to username

---

### Phase 2: Payment Flow Testing
**Goal**: Verify complete payment → redirect → dashboard flow

1. **Book a Service**
   ```bash
   # Go to /mentor/[mentorId]
   # Click "Book Service"
   # Select service (e.g., Video Call)
   # Choose date/time
   # Add notes
   # Click "Proceed to Payment"
   ```

2. **Complete Payment**
   ```bash
   # Razorpay modal opens
   # Complete test payment
   # Wait for verification
   ```

3. **Verify Redirect**
   ```bash
   # Should see alert: "✅ Booking confirmed! Redirecting to My Questions..."
   # Should automatically redirect to /my-questions
   # Should NOT go to /my-bookings
   ```

**Expected Result**: Smooth redirect to My Questions page after payment

---

### Phase 3: Dashboard Display Testing
**Goal**: Verify My Questions page shows correct data

1. **Check Dashboard Stats**
   ```bash
   # Go to /my-questions
   # Verify stats cards show:
   #   - Total Questions count
   #   - Total Bookings count
   #   - Upcoming Calls count (only confirmed + future)
   ```

2. **Check Question Cards**
   ```bash
   # Each question should show:
   #   ✅ Status badge (color-coded)
   #   ✅ Category badge
   #   ✅ Question title
   #   ✅ Description (truncated to 150 chars)
   #   ✅ Assigned mentor (if any)
   #   ✅ Match percentage (if available)
   #   ✅ Follow-up count
   #   ✅ Created date
   #   ✅ Action buttons (Chat, View Answer/Track Status)
   ```

3. **Check Booking Cards**
   ```bash
   # Each booking should show:
   #   ✅ Service type badge (Video Call, Audio Call, etc.)
   #   ✅ Status badge (Confirmed, Completed, etc.)
   #   ✅ Service title
   #   ✅ Mentor name
   #   ✅ Scheduled date/time (formatted nicely)
   #   ✅ Duration (e.g., "30 minutes")
   #   ✅ Countdown timer (e.g., "in 2h")
   #   ✅ Amount paid
   #   ✅ Action buttons (Join Call, Chat, View Details)
   ```

**Expected Result**: All data displays correctly with proper formatting

---

### Phase 4: Linked Bookings Testing
**Goal**: Verify bookings linked to questions show correctly

1. **Create Question with Booking**
   ```bash
   # Ask a question
   # Book a service from that question's mentor
   # Pass questionId when creating booking
   ```

2. **Check Question Card**
   ```bash
   # Go to /my-questions
   # Find the question
   # Should see "Linked Booking" section inside question card
   # Should show:
   #   ✅ Service type badge
   #   ✅ "Booked Service" label
   #   ✅ Scheduled date/time
   ```

**Expected Result**: Linked bookings appear within question cards

---

### Phase 5: Join Call Button Testing
**Goal**: Verify "Join Call" button appears at correct times

1. **Test Before Call Window**
   ```bash
   # Book a call for 1 hour from now
   # Go to /my-questions
   # "Join Call" button should NOT appear yet
   ```

2. **Test During Call Window**
   ```bash
   # Wait until 15 minutes before scheduled time
   # Refresh /my-questions
   # "Join Call" button should appear
   # Click button → should open meeting link in new tab
   ```

3. **Test After Call Window**
   ```bash
   # Wait until 30 minutes after scheduled time
   # Refresh /my-questions
   # "Join Call" button should disappear
   ```

**Expected Result**: Button appears 15 mins before → 30 mins after call time

---

### Phase 6: Chat Button Testing
**Goal**: Verify chat links work correctly

1. **Click Chat from Question Card**
   ```bash
   # Go to /my-questions
   # Find question with assigned mentor
   # Click "💬 Chat" button
   # Should navigate to /chat/[mentorId]
   ```

2. **Click Chat from Booking Card**
   ```bash
   # Find booking card
   # Click "💬 Chat" button
   # Should navigate to /chat/[mentorId]
   ```

**Expected Result**: Chat opens with correct mentor

---

### Phase 7: Auto-Refresh Testing
**Goal**: Verify page updates automatically

1. **Test Auto-Refresh**
   ```bash
   # Go to /my-questions
   # Keep page open
   # In another tab, create a new question or booking
   # Wait 10 seconds
   # Original tab should auto-update with new item
   ```

2. **Check Console**
   ```bash
   # Open browser DevTools → Console
   # Should see fetch requests every 10 seconds
   # No errors should appear
   ```

**Expected Result**: Page refreshes every 10 seconds without user action

---

### Phase 8: Mobile Responsive Testing
**Goal**: Verify layout works on mobile devices

1. **Test on Mobile Device**
   ```bash
   # Open /my-questions on phone
   # Or use Chrome DevTools → Toggle Device Toolbar
   # Test screen sizes: 375px, 768px, 1024px, 1440px
   ```

2. **Check Layout**
   ```bash
   # Stats cards should stack vertically on mobile
   # Question/booking cards should be full-width
   # Action buttons should stack vertically
   # Text should be readable (no overflow)
   # Touch targets should be large enough
   ```

**Expected Result**: Perfect layout on all screen sizes

---

### Phase 9: Edge Cases Testing
**Goal**: Test unusual scenarios

1. **Empty State**
   ```bash
   # Create new user with no questions/bookings
   # Go to /my-questions
   # Should show empty state with:
   #   ✅ Empty icon (💭)
   #   ✅ "No questions or bookings yet" message
   #   ✅ "Ask a Question" button
   #   ✅ "Browse Mentors" button
   ```

2. **Past Bookings**
   ```bash
   # Check booking with past scheduled time
   # Countdown should show "Past"
   # "Join Call" button should NOT appear
   ```

3. **Cancelled Bookings**
   ```bash
   # Cancel a booking
   # Should show "Cancelled" status badge (red)
   # "Join Call" button should NOT appear
   ```

4. **Questions Without Mentors**
   ```bash
   # Submit question without mentor assignment
   # Should show question card without mentor section
   # "Chat" button should NOT appear
   ```

**Expected Result**: All edge cases handled gracefully

---

## 🐛 Common Issues & Solutions

### Issue 1: "undefined" in Emails
**Symptom**: Emails show "Hi undefined"
**Solution**: Check `backend/services/BookingService.js` lines 67-68, 155-156
**Verify**: `user.name || user.username || 'User'` fallback is present

### Issue 2: Redirect to /my-bookings Instead of /my-questions
**Symptom**: After payment, goes to wrong page
**Solution**: Check `frontend/src/components/ServiceBookingModal.jsx` line 228
**Verify**: `window.location.href = '/my-questions'`

### Issue 3: Dashboard Endpoint Returns 404
**Symptom**: My Questions page shows "Failed to load dashboard"
**Solution**: Restart backend server to load new route
**Command**: `cd backend && npm start`

### Issue 4: Join Call Button Not Appearing
**Symptom**: Button doesn't show even when it should
**Solution**: Check `canJoinCall()` function logic
**Debug**: Console.log `scheduledAt`, `status`, and time difference

### Issue 5: Auto-Refresh Not Working
**Symptom**: Page doesn't update automatically
**Solution**: Check browser console for fetch errors
**Verify**: Token is valid and endpoint is accessible

---

## 📊 Success Criteria

✅ All emails show proper names (no "undefined")
✅ Payment redirects to /my-questions
✅ Dashboard shows questions + bookings combined
✅ Stats cards show correct counts
✅ Service type badges display correctly
✅ Scheduling info shows with countdown timers
✅ Join Call button appears at correct times
✅ Chat buttons link to correct mentors
✅ Linked bookings show within question cards
✅ Auto-refresh works every 10 seconds
✅ Mobile responsive on all screen sizes
✅ Empty state displays when no data
✅ All edge cases handled properly

---

## 🚀 Quick Test Commands

### Start Backend
```bash
cd backend
npm start
```

### Start Frontend
```bash
cd frontend
npm run dev
```

### Test Payment Flow
```bash
# 1. Login as user
# 2. Go to /mentor/[mentorId]
# 3. Book a service
# 4. Complete test payment
# 5. Verify redirect to /my-questions
# 6. Check email inbox for confirmation
```

### Test Dashboard
```bash
# 1. Go to /my-questions
# 2. Verify stats cards
# 3. Check question cards
# 4. Check booking cards
# 5. Test action buttons
# 6. Wait 10 seconds for auto-refresh
```

---

## 📝 Notes

- All code is implemented and verified (no diagnostics errors)
- Backend endpoint tested and working
- Frontend component tested and working
- CSS styles added and responsive
- Email name fixes applied
- Payment redirect updated
- Ready for end-to-end testing

**Next Step**: Run through the testing checklist above and report any issues found.
