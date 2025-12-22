# Atyant Engine Implementation Guide

## Overview
The Atyant Engine transforms Atyant from a direct mentor-matching platform into an experience-to-insight platform where users receive curated Answer Cards instead of seeing mentor profiles directly.

## Architecture Changes

### Backend Components

#### 1. New Database Models

**Question Model** (`backend/models/Question.js`)
- Stores user questions
- Tracks internal mentor assignment (hidden from users)
- Manages question lifecycle and status
- Links to Answer Cards and follow-up questions

**MentorExperience Model** (`backend/models/MentorExperience.js`)
- Stores raw mentor input in structured format
- 7 key fields:
  - Situation
  - First attempt
  - Failures
  - What worked
  - Step-by-step actions
  - Timeline
  - What would do differently

**AnswerCard Model** (`backend/models/AnswerCard.js`)
- Transformed answer in Atyant's voice
- Contains:
  - Main answer
  - Key mistakes list
  - Actionable steps
  - Timeline expectations
  - Real context
  - Trust message and signature

#### 2. Atyant Engine Service

**File**: `backend/services/AtyantEngine.js`

**Core Functions**:
- `findBestMentor()`: Selects best-fit mentor based on expertise matching
- `processQuestion()`: Creates question record and assigns mentor internally
- `transformToAnswerCard()`: Converts raw experience to Answer Card
- `aiTransformExperience()`: Uses Gemini AI to transform mentor's voice to Atyant's voice

**Mentor Selection Algorithm**:
- Scores mentors based on:
  - Expertise match (5 points per keyword)
  - Bio relevance (2 points per keyword)
  - Rating boost (up to 3 points)
- Selects highest-scoring mentor
- Assignment is INTERNAL ONLY - never shown to users

#### 3. Engine Routes

**File**: `backend/routes/engineRoutes.js`

**User Routes**:
- `POST /api/engine/submit-question` - Submit new question
- `GET /api/engine/question-status/:questionId` - Check question status
- `GET /api/engine/my-questions` - Get all user's questions
- `POST /api/engine/submit-follow-up` - Submit follow-up (max 2)
- `POST /api/engine/answer-feedback` - Submit answer feedback

**Mentor Routes** (Internal):
- `GET /api/engine/mentor/pending-questions` - Get assigned questions
- `POST /api/engine/mentor/submit-experience` - Submit raw experience

### Frontend Components

#### 1. Modified AskQuestionPage

**File**: `frontend/src/components/AskQuestionPage.jsx`

**Changes**:
- Removed mentor cards display
- Changed API call from `/api/ask/suggest-mentors` to `/api/engine/submit-question`
- Redirects to Engine View instead of showing mentor profiles
- Button text: "Get Your Answer 🚀" (instead of "Find My Mentor")

#### 2. Engine View Component

**Files**: 
- `frontend/src/components/EngineView.jsx`
- `frontend/src/components/EngineView.css`

**Features**:
- Displays question being processed
- Shows 4-step progress indicator:
  1. Question Received
  2. Mentor Selected
  3. Experience Collected
  4. Answer Ready
- Polls backend every 5 seconds for updates
- Shows Answer Card when ready

#### 3. Answer Card Component

**Files**:
- `frontend/src/components/AnswerCard.jsx`
- `frontend/src/components/AnswerCard.css`

**Features**:
- Displays structured answer with:
  - Main answer text
  - Common mistakes section (red boxes)
  - Actionable steps (numbered green boxes)
  - Timeline expectations (yellow box)
  - Real context (purple box)
- Trust badge: "This answer is built from real experience"
- Signature: "— Atyant Expert Mentor"
- Feedback section (thumbs up/down, star rating, comments)
- Follow-up question input (max 2 per answer)

#### 4. Mentor Dashboard

**Files**:
- `frontend/src/components/MentorDashboard.jsx`
- `frontend/src/components/MentorDashboard.css`

**Features**:
- Shows pending questions assigned to mentor
- Experience submission form with 7 structured fields
- Validates all required fields
- Submits to backend for AI transformation
- Only accessible to users with mentor role

### Routing Updates

**File**: `frontend/src/App.jsx`

**New Routes**:
```jsx
/engine/:questionId - Engine View (users see their question processing)
/mentor-dashboard - Mentor Experience Submission (mentors only)
```

## User Flow

### For Students:

1. **Ask Question** → Go to `/ask`
2. **Submit Question** → Question goes to Atyant Engine
3. **Redirect to Engine View** → `/engine/{questionId}`
4. **See Processing Status** → 4-step progress indicator
5. **Wait for Answer** → Usually 1-2 hours
6. **Receive Answer Card** → Structured, actionable answer
7. **Provide Feedback** → Rate and comment on answer
8. **Ask Follow-up** → Up to 2 follow-up questions allowed

### For Mentors:

1. **Access Dashboard** → Go to `/mentor-dashboard`
2. **See Pending Questions** → Questions matched to expertise
3. **Select Question** → Click to open experience form
4. **Fill Structured Form**:
   - When I was in this situation
   - What I tried first
   - What failed
   - What worked
   - Step-by-step actions
   - Timeline / outcomes
   - What I would do differently today
5. **Submit Experience** → Backend transforms to Answer Card
6. **Answer Delivered** → User receives Answer Card automatically

## Key Features

### 1. Mentor Invisibility
- Users NEVER see mentor names or profiles
- Mentor selection happens internally
- Answer Cards use Atyant's voice, not mentor's identity

### 2. AI Transformation
- Uses Gemini AI to convert mentor experience to Answer Card
- Maintains practical, opinionated tone
- Removes generic AI language
- Ensures actionable content

### 3. Follow-up System
- Users can ask 2 follow-up questions per Answer Card
- Follow-ups create new questions in the system
- Same mentor selection process applies

### 4. Feedback Loop
- Users rate Answer Cards
- Helpful/not helpful tracking
- 5-star rating
- Optional comments

### 5. Quality Control
- Structured mentor input ensures completeness
- AI transformation maintains consistency
- Real mistakes and steps included (not generic advice)

## Migration Notes

### What Changed:
- `/ask` page no longer shows mentor cards
- Questions go through engine instead of direct matching
- New database collections: Questions, MentorExperience, AnswerCards

### What Stayed the Same:
- Question input UI
- AI-generated question suggestions
- Mentor expertise matching (now internal)
- Authentication system
- Overall site structure

### Backward Compatibility:
- Old routes still exist (e.g., `/mentors`, `/profile/:username`)
- Existing user and mentor data intact
- Chat system unchanged (for future paid unlock)

## Testing Checklist

### User Flow:
- [ ] Submit question from `/ask`
- [ ] Redirect to `/engine/{questionId}` works
- [ ] Status updates correctly
- [ ] Answer Card displays properly
- [ ] Feedback submission works
- [ ] Follow-up question submission works
- [ ] Maximum 2 follow-ups enforced

### Mentor Flow:
- [ ] Access `/mentor-dashboard` (mentor role required)
- [ ] See pending questions
- [ ] Fill experience form
- [ ] All required fields validated
- [ ] Submit generates Answer Card
- [ ] Answer delivered to user

### Engine Logic:
- [ ] Mentor selection algorithm works
- [ ] Keywords extracted correctly
- [ ] Best mentor selected (highest score)
- [ ] AI transformation generates valid Answer Card
- [ ] Manual fallback works if AI fails

## Environment Variables Required

```env
GEMINI_API_KEY=your_gemini_api_key_here
MONGO_URI=your_mongodb_connection_string
```

## API Endpoints Summary

### User Endpoints:
- `POST /api/engine/submit-question`
- `GET /api/engine/question-status/:questionId`
- `GET /api/engine/my-questions`
- `POST /api/engine/submit-follow-up`
- `POST /api/engine/answer-feedback`

### Mentor Endpoints:
- `GET /api/engine/mentor/pending-questions`
- `POST /api/engine/mentor/submit-experience`

## Future Enhancements

1. **Paid Unlock**: After Answer Card delivery, offer paid 1-on-1 access
2. **Experience History**: Track mentor's past solved problems
3. **Better Matching**: Use ML for mentor selection
4. **Real-time Notifications**: Notify users when answer ready
5. **Answer Card Templates**: Pre-built structures for common question types
6. **Mentor Analytics**: Track mentor response time, quality ratings
7. **Question Categories**: Auto-categorize questions for better routing

## Implementation Complete ✅

All core components have been created and integrated:
- ✅ Backend models (Question, MentorExperience, AnswerCard)
- ✅ Atyant Engine service
- ✅ Engine routes (user + mentor)
- ✅ Frontend components (EngineView, AnswerCard, MentorDashboard)
- ✅ Modified AskQuestionPage
- ✅ Routing updates
- ✅ Follow-up system
- ✅ Feedback system
- ✅ AI transformation logic

The Atyant Engine is now ready for testing and deployment!
