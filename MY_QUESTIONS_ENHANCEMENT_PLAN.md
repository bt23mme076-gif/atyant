# My Questions Enhancement Plan

## 🎯 Goal
Transform "My Questions" into a central dashboard showing:
1. Questions asked
2. Services booked (bookings)
3. Mentor assignments
4. Call scheduling
5. Status tracking
6. Messages/Chat integration

## 📋 Current State
- Shows only questions
- Basic status badges
- No booking information
- No scheduling details
- No service type display

## ✅ Required Changes

### 1. Backend: Link Bookings to Questions
**Problem**: Bookings and Questions are separate entities
**Solution**: Add `questionId` field to Booking model (optional, for when booking is made from a question)

### 2. Backend: Fetch Combined Data
**New Endpoint**: `/api/questions/my-dashboard`
**Returns**:
```javascript
{
  success: true,
  items: [
    {
      type: 'question',
      _id: '...',
      title: 'How to prepare for PM interview?',
      status: 'mentor_assigned',
      mentor: { name: 'Aryan', username: 'aryan' },
      createdAt: '2026-03-24',
      hasBooking: true,
      booking: {
        serviceType: 'video-call',
        scheduledAt: '2026-03-25T10:00:00',
        meetingLink: 'https://meet.google.com/...',
        status: 'confirmed'
      }
    },
    {
      type: 'booking',
      _id: '...',
      service: { title: '1:1 Career Guidance', type: 'video-call' },
      mentor: { name: 'Priya', username: 'priya' },
      scheduledAt: '2026-03-26T14:00:00',
      status: 'confirmed',
      meetingLink: 'https://meet.google.com/...',
      amount: 500
    }
  ]
}
```

### 3. Frontend: Enhanced Card Display
Each card shows:
- **Question Title** or **Service Name**
- **Service Type Badge** (Video Call, Audio Call, Chat, Answer Card)
- **Mentor Info** (name, avatar)
- **Status Badge** (Pending, Confirmed, Scheduled, Completed)
- **Scheduled Time** (if applicable)
- **Action Buttons**:
  - View Details
  - Join Call (if scheduled and time is near)
  - Chat with Mentor
  - Reschedule
  - Cancel

### 4. UI Layout
```
┌─────────────────────────────────────────────────────────┐
│  📝 My Questions & Bookings                             │
│  Track all your questions, services, and call schedules │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  📹 Video Call - Career Guidance                        │
│  ⭐ Confirmed                                           │
│                                                         │
│  👤 Mentor: Aryan                                       │
│  📅 Scheduled: March 25, 2026 at 10:00 AM              │
│  ⏱️ Duration: 30 minutes                                │
│                                                         │
│  [View Details]  [Join Call]  [Chat]                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ❓ How to prepare for Product Manager interview?       │
│  ⏳ Awaiting Response                                   │
│                                                         │
│  👤 Mentor: Priya (85% match)                          │
│  📅 Asked: March 24, 2026                               │
│  💬 2 follow-ups                                        │
│                                                         │
│  [View Answer]  [Chat]  [Add Follow-up]                │
└─────────────────────────────────────────────────────────┘
```

## 🔧 Implementation Steps

### Step 1: Update Booking Model
Add optional `questionId` field to link bookings to questions

### Step 2: Create Dashboard Endpoint
New route: `GET /api/questions/my-dashboard`
- Fetch user's questions
- Fetch user's bookings
- Combine and sort by date
- Populate mentor and service details

### Step 3: Update Frontend Component
- Fetch from new dashboard endpoint
- Render unified card layout
- Show service type badges
- Display scheduling info
- Add action buttons

### Step 4: Add Scheduling Integration
- Show countdown to scheduled calls
- Enable "Join Call" button 15 minutes before
- Show meeting link when available
- Add calendar integration

### Step 5: Add Messaging Integration
- Link to chat with mentor
- Show unread message count
- Enable quick message from card

## 📊 Data Flow

```
User Books Service
  ↓
Payment Successful
  ↓
Booking Created (with optional questionId)
  ↓
Redirect to /my-questions
  ↓
Fetch Dashboard Data (questions + bookings)
  ↓
Display Unified Cards
  ↓
User Can:
  - View details
  - Join scheduled calls
  - Chat with mentor
  - Track status
  - Reschedule/Cancel
```

## 🎨 Status Badges

### Question Status
- 📝 Draft
- 📨 Submitted
- ⏳ Pending
- 👤 Assigned to Mentor
- ⏳ Awaiting Response
- ⚙️ Processing Answer
- ✅ Answer Ready
- ✓ Delivered
- ⚡ Instant Answer

### Booking Status
- ⏳ Pending
- ✅ Confirmed
- 📅 Scheduled
- ✓ Completed
- ❌ Cancelled
- 💰 Refunded

### Service Type Badges
- 📹 Video Call
- 🎤 Audio Call
- 💬 Chat
- 🎯 Answer Card

## 🔔 Notifications & Reminders
- Email 24h before scheduled call
- Email 1h before scheduled call
- In-app notification when answer ready
- In-app notification for new messages

## ✅ Success Criteria
- User sees all questions and bookings in one place
- Scheduled calls show time and meeting link
- Status is always up-to-date
- Easy access to chat and join call
- Clear visual hierarchy
- Mobile responsive

---

**Status**: READY TO IMPLEMENT
