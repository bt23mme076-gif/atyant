# Testing Mentor Notification System

## Problem
Mentor4 is being assigned questions but doesn't see them in the dashboard.

## What I Fixed

### 1. Backend Route Fix
**File**: `backend/routes/engineRoutes.js`

**Issue**: The route was checking `req.user.role` but the protect middleware only provides `req.user.userId`.

**Fix**: Now fetches the full user from database:
```javascript
const mentor = await User.findById(mentorId);
if (!mentor || mentor.role !== 'mentor') {
  return res.status(403).json({ error: 'Only mentors can access this' });
}
```

### 2. Auto-Refresh Added
**File**: `frontend/src/components/MentorDashboard.jsx`

**Added**: 
- Auto-refresh every 10 seconds
- Console logs to debug
- Visual indicator showing refresh status
- Count of pending questions

## How to Test

### Step 1: Verify Backend is Running
```bash
cd backend
npm start
```

You should see:
```
✅ MongoDB connected successfully!
Server running on port 3000
```

### Step 2: Login as Mentor4
1. Open browser: http://localhost:5173
2. Login with mentor4 credentials
3. Navigate to: http://localhost:5173/mentor-dashboard

### Step 3: Check Browser Console
Open DevTools (F12) and look for:
```
📋 Mentor Dashboard - Pending questions response: {...}
✅ Loaded X pending questions
```

### Step 4: Check Backend Console
You should see:
```
🔍 Fetching pending questions for mentor: mentor4
📋 Found X pending questions for mentor4
```

### Step 5: Verify Database
Open MongoDB Compass or shell:
```javascript
// Check if questions exist with mentor4 assigned
db.questions.find({ 
  selectedMentorId: ObjectId("mentor4_id_here"),
  status: { $in: ["mentor_assigned", "awaiting_experience"] }
})
```

## Common Issues & Solutions

### Issue 1: "No pending questions" shown but mentor is assigned
**Check**: 
```javascript
// In backend console, you should see:
✅ Question assigned to mentor: mentor4
```

**Solution**: Wait 10 seconds for auto-refresh or refresh the page manually

### Issue 2: 403 Forbidden error
**Check**: User's role in database
```javascript
db.users.findOne({ username: "mentor4" })
// Should show: role: "mentor"
```

**Solution**: Update user role:
```javascript
db.users.updateOne(
  { username: "mentor4" },
  { $set: { role: "mentor" } }
)
```

### Issue 3: Questions not being assigned
**Check backend logs**:
```
🔍 Atyant Engine: Finding best mentor for keywords: [...]
✅ Atyant Engine: Selected mentor: mentor4 Score: X
✅ Question assigned to mentor: mentor4
```

If you DON'T see these logs, the engine isn't running. Check:
- Backend server is running
- No errors in backend console
- Database connection is active

## Manual Test API Endpoints

### Test 1: Get Pending Questions (as mentor4)
```bash
curl -X GET http://localhost:3000/api/engine/mentor/pending-questions \
  -H "Authorization: Bearer YOUR_MENTOR4_TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "questions": [
    {
      "id": "...",
      "text": "How to start with good cgpa?",
      "keywords": ["start", "good", "cgpa"],
      "status": "mentor_assigned",
      "createdAt": "2025-12-20T..."
    }
  ]
}
```

### Test 2: Check Question Status (as student)
```bash
curl -X GET http://localhost:3000/api/engine/question-status/QUESTION_ID \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "question": {
    "id": "...",
    "text": "How to start with good cgpa?",
    "status": "mentor_assigned",
    "createdAt": "..."
  },
  "answerCard": null
}
```

## Debug Checklist

- [ ] Backend server running on port 3000
- [ ] Frontend running on port 5173
- [ ] MongoDB connected
- [ ] Mentor4 user exists with role: "mentor"
- [ ] Mentor4 is logged in
- [ ] Browser console shows fetch requests every 10 seconds
- [ ] Backend console shows "Finding best mentor" logs
- [ ] Backend console shows "Selected mentor: mentor4"
- [ ] Backend console shows "Question assigned to mentor: mentor4"
- [ ] Backend console shows "Fetching pending questions for mentor: mentor4"
- [ ] Backend console shows "Found X pending questions"

## What Should Happen Now

1. **User submits question** → Backend logs show mentor4 selected
2. **Every 10 seconds** → Mentor dashboard auto-refreshes
3. **Mentor sees question** → In pending questions grid
4. **Mentor clicks question** → Opens experience form
5. **Mentor fills form** → Submits experience
6. **Answer Card generated** → User receives answer

## If Still Not Working

### Check MongoDB Connection
```javascript
// In MongoDB shell or Compass
use atyant
db.questions.find().pretty()
```

Look for documents with:
- `selectedMentorId`: Should match mentor4's _id
- `status`: "mentor_assigned" or "awaiting_experience"

### Check User Token
Make sure mentor4's token is valid:
1. Login as mentor4
2. Open DevTools → Application → Local Storage
3. Look for auth token
4. Token should be valid JWT

### Restart Everything
```bash
# Stop backend
Ctrl+C in backend terminal

# Stop frontend  
Ctrl+C in frontend terminal

# Clear MongoDB cache (if needed)
# Restart MongoDB service

# Start backend
cd backend
npm start

# Start frontend (new terminal)
cd frontend
npm run dev
```

## Success Indicators

✅ Mentor dashboard shows: "You have X question(s) waiting for your expertise!"
✅ Questions appear in grid with status "MENTOR ASSIGNED"
✅ Console shows auto-refresh every 10 seconds
✅ Backend shows pending questions fetch logs
✅ Clicking question opens experience form

---

**Current Status**: Fixed
**Changes Made**: 
1. Added User model import to engineRoutes.js
2. Fixed mentor role check to fetch from database
3. Added auto-refresh polling (10 seconds)
4. Added console logs for debugging
5. Added visual indicators for pending questions

**Next**: Test by logging in as mentor4 and checking the dashboard
