# Atyant Engine - Deployment & Testing Guide

## Pre-Deployment Checklist

### Backend Setup

#### 1. Install Dependencies
```bash
cd backend
npm install
```

No new dependencies required - all existing packages support the new features.

#### 2. Environment Variables
Ensure these are set in `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
MONGO_URI=your_mongodb_connection_string
PORT=3000
```

#### 3. Database Migration
The new models will be created automatically when the server starts:
- `questions` collection
- `mentorexperiences` collection  
- `answercards` collection

No manual migration needed - Mongoose handles schema creation.

#### 4. Start Backend
```bash
cd backend
npm start
```

Verify server starts without errors and shows:
```
✅ MongoDB connected successfully!
Server running on port 3000
```

### Frontend Setup

#### 1. Install Dependencies
```bash
cd frontend
npm install
```

#### 2. Environment Variables
Ensure `.env` has:
```env
VITE_API_URL=http://localhost:3000
```

For production:
```env
VITE_API_URL=https://your-backend-domain.com
```

#### 3. Start Frontend
```bash
cd frontend
npm run dev
```

Verify no build errors and app starts on `http://localhost:5173`

## Testing Workflow

### Phase 1: User Flow Testing

#### Test 1: Question Submission
1. **Login as a regular user** (role: 'user')
2. Navigate to `/ask`
3. Type a question (min 10 characters)
4. Click "Get Your Answer 🚀"
5. **Expected**: Redirect to `/engine/{questionId}`
6. **Verify**: 
   - Question displays correctly
   - Status shows "Processing"
   - Progress bar shows step 1 (Question Received)

#### Test 2: Engine View Polling
1. Stay on `/engine/{questionId}` page
2. **Expected**: Page polls backend every 5 seconds
3. **Verify**: Network tab shows periodic GET requests to `/api/engine/question-status/:id`

#### Test 3: Manual Status Check
Using Postman or curl:
```bash
GET http://localhost:3000/api/engine/question-status/{questionId}
Authorization: Bearer {user_token}
```

**Expected Response**:
```json
{
  "success": true,
  "question": {
    "id": "...",
    "text": "...",
    "status": "mentor_assigned",
    "createdAt": "..."
  },
  "answerCard": null
}
```

### Phase 2: Mentor Flow Testing

#### Test 4: Mentor Dashboard Access
1. **Login as a mentor** (role: 'mentor')
2. Navigate to `/mentor-dashboard`
3. **Expected**: Dashboard loads with pending questions
4. **Verify**: Questions assigned to this mentor appear

#### Test 5: Non-Mentor Access Block
1. **Login as regular user** (role: 'user')
2. Navigate to `/mentor-dashboard`
3. **Expected**: Redirect to home or error message
4. **Verify**: Only mentors can access

#### Test 6: Experience Submission
1. Login as mentor
2. Go to `/mentor-dashboard`
3. Click on a pending question
4. Fill ALL 7 required fields:
   - Situation
   - First Attempt
   - Failures
   - What Worked
   - Step by Step
   - Timeline
   - Would Do Differently
5. Click "Submit Experience"
6. **Expected**: 
   - Success message appears
   - Answer Card auto-generated
   - Question removed from pending list

#### Test 7: Validation Check
1. Try submitting experience with empty fields
2. **Expected**: Validation error showing which field is missing

### Phase 3: Answer Card Testing

#### Test 8: Answer Card Display
1. After mentor submits experience
2. User checks `/engine/{questionId}` again
3. **Expected**:
   - Progress bar shows step 4 (Answer Ready)
   - Answer Card displays with all sections:
     - Main answer
     - Key mistakes (red boxes)
     - Actionable steps (green boxes)
     - Timeline (yellow box)
     - Real context (purple box)
     - Trust message
     - Signature

#### Test 9: Feedback Submission
1. On Answer Card:
2. Click "Yes, very helpful"
3. Rate 5 stars
4. Add comment
5. Click "Submit Feedback"
6. **Expected**: Success message appears

#### Test 10: Verify Feedback Saved
```bash
GET http://localhost:3000/api/engine/question-status/{questionId}
```

**Expected**: `answerCard.userFeedback` contains submitted data

### Phase 4: Follow-up Testing

#### Test 11: First Follow-up
1. In Answer Card section, find "Follow-up Question"
2. Type a follow-up question
3. Click "Submit Follow-up Question"
4. **Expected**:
   - Success message
   - Redirect to new `/engine/{newQuestionId}`
   - Original answer shows "1 follow-up used"

#### Test 12: Second Follow-up
1. Repeat Test 11
2. **Expected**: Works, shows "2 follow-ups used"

#### Test 13: Third Follow-up (Should Block)
1. Try submitting a 3rd follow-up
2. **Expected**: Error message "Maximum 2 follow-up questions allowed"

### Phase 5: AI Transformation Testing

#### Test 14: Verify AI Transformation
After mentor submits experience, check the generated Answer Card:

**Manual API Test**:
```bash
POST http://localhost:3000/api/engine/mentor/submit-experience
Authorization: Bearer {mentor_token}
Content-Type: application/json

{
  "questionId": "...",
  "rawExperience": {
    "situation": "Test situation...",
    "firstAttempt": "Test first attempt...",
    "failures": "Test failures...",
    "whatWorked": "Test what worked...",
    "stepByStep": "Step 1...\nStep 2...",
    "timeline": "2 weeks",
    "wouldDoDifferently": "I would..."
  }
}
```

**Verify**:
- Answer Card created
- `answerContent.mainAnswer` is different from raw input
- Mistakes are formatted as list
- Steps are numbered and structured

#### Test 15: Fallback Test (No Gemini API Key)
1. Remove `GEMINI_API_KEY` from `.env`
2. Submit mentor experience
3. **Expected**: Manual fallback transformation works
4. **Verify**: Answer Card still created (less polished but functional)

### Phase 6: Error Handling

#### Test 16: Invalid Question ID
```bash
GET http://localhost:3000/api/engine/question-status/invalid_id
```
**Expected**: 404 error

#### Test 17: Unauthorized Access
Try accessing question without auth token:
```bash
GET http://localhost:3000/api/engine/question-status/{questionId}
```
**Expected**: 401 Unauthorized

#### Test 18: Question Too Short
```bash
POST http://localhost:3000/api/engine/submit-question
{
  "questionText": "Hi"
}
```
**Expected**: 400 error "Question must be at least 10 characters"

### Phase 7: Database Verification

#### Test 19: Check Collections Created
In MongoDB:
```javascript
show collections
```
**Expected**: Should see:
- questions
- mentorexperiences
- answercards

#### Test 20: Check Question Document
```javascript
db.questions.findOne()
```
**Expected Structure**:
```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  questionText: "...",
  keywords: ["web", "development", ...],
  selectedMentorId: ObjectId("..."),  // HIDDEN from user
  selectionReason: "Expertise: ...",
  status: "delivered",
  answerCardId: ObjectId("..."),
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

### Phase 8: Performance Testing

#### Test 21: Polling Performance
1. Open `/engine/{questionId}` in multiple tabs
2. **Verify**: No performance degradation
3. Check Network tab: Requests are 5 seconds apart

#### Test 22: Large Answer Card
1. Submit mentor experience with lots of text (near max limits)
2. **Verify**: Answer Card renders correctly, no UI breaks

## Production Deployment

### Backend Deployment

1. **Set Production Environment Variables**:
```env
MONGO_URI=mongodb+srv://production_connection_string
GEMINI_API_KEY=production_gemini_key
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://www.atyant.in
```

2. **Deploy to Server** (e.g., Render, Railway, Heroku):
```bash
git push production main
```

3. **Verify Routes**:
```bash
curl https://your-api.com/api/engine/question-status/test
```

### Frontend Deployment

1. **Update Environment**:
```env
VITE_API_URL=https://your-production-api.com
```

2. **Build**:
```bash
npm run build
```

3. **Deploy** (e.g., Vercel, Netlify):
```bash
vercel --prod
```

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Question Submission Rate**
   - Track: Questions per hour
   - Alert if: > 100/hour (potential abuse)

2. **Mentor Response Time**
   - Track: Time from question to experience submission
   - Alert if: > 24 hours average

3. **AI Transformation Success Rate**
   - Track: Successful vs fallback transformations
   - Alert if: < 80% success rate

4. **Follow-up Usage**
   - Track: % of users using follow-ups
   - Goal: > 30% engagement

### Error Logging

Add to backend:
```javascript
// In engineRoutes.js
console.log('📊 Question submitted:', { questionId, userId, keywords });
console.log('🎯 Mentor assigned:', { mentorId, score, reason });
console.log('✨ Answer generated:', { questionId, answerCardId });
console.error('❌ Error:', error);
```

## Rollback Plan

If issues occur:

1. **Quick Fix**: Disable new routes temporarily
   ```javascript
   // In server.js, comment out:
   // app.use('/api/engine', engineRoutes);
   ```

2. **Revert to Old Flow**: 
   - In `AskQuestionPage.jsx`, change back to `/api/ask/suggest-mentors`
   - Show mentor cards again

3. **Database**: No need to drop collections - old system still works

## Success Criteria

✅ Deployment successful if:
- [ ] Users can submit questions
- [ ] Questions assigned to mentors
- [ ] Mentors can submit experiences
- [ ] Answer Cards generated
- [ ] Follow-ups work
- [ ] Feedback submission works
- [ ] No visible mentor information to users
- [ ] AI transformation working (or fallback)
- [ ] < 2% error rate
- [ ] < 3s page load time

## Troubleshooting

### Issue: "Failed to submit question"
**Check**: 
- User has valid auth token
- Backend is running
- CORS configured for frontend domain

### Issue: "No mentors found"
**Check**:
- At least one user has role: 'mentor'
- Mentor has expertise matching question keywords

### Issue: "AI transformation failed"
**Check**:
- GEMINI_API_KEY is valid
- API quota not exceeded
- Fallback should still work

### Issue: "Answer Card not displaying"
**Check**:
- Mentor submitted experience
- `answerCardId` exists in question document
- Answer Card document exists in database

## Next Steps After Deployment

1. **Monitor first 24 hours closely**
2. **Gather user feedback on Answer Cards**
3. **Check mentor response times**
4. **Analyze AI transformation quality**
5. **Optimize mentor selection algorithm based on data**

---

**Testing Complete?** ✅
- [ ] All 22 tests passed
- [ ] Production environment configured
- [ ] Monitoring setup
- [ ] Rollback plan ready
- [ ] Team trained on new flow

**Ready to deploy!** 🚀
