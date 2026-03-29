# 📧 Current Notifications Summary

## Overview
Atyant currently sends **6 types of email notifications** to users and mentors using **Resend** (for questions) and **Nodemailer/SMTP** (for bookings).

---

## 📨 Email Notifications

### 1️⃣ **Mentor: New Question Assigned** 🎯
**Trigger**: When a question is assigned to a mentor  
**Recipient**: Mentor  
**Service**: Resend  
**Subject**: `🎯 New Question Assigned to You`

**Content**:
- Mentor name
- Question text
- Related topics/keywords (up to 5)
- "Answer Question" button → `/mentor-dashboard`
- Reminder: Share real experience, not generic advice

**Sent From**:
- `backend/routes/questionRoutes.js` (line 401-406) - When question is submitted
- `backend/routes/engineRoutes.js` (line 282) - For follow-up questions
- `backend/services/AtyantEngine.js` (line 865) - When engine assigns mentor

**Email Template**: Green theme with keyword badges

---

### 2️⃣ **Student: Answer Ready** ✅
**Trigger**: When a mentor submits an answer  
**Recipient**: Student (question asker)  
**Service**: Resend  
**Subject**: `✅ Your Answer is Ready!` or `✅ Your Follow-up Answer is Ready!`

**Content**:
- Student name
- Original question text
- What they'll get:
  - Real experience from someone who solved this
  - Key mistakes to avoid
  - Step-by-step actionable plan
  - Realistic timeline and outcomes
- "View Your Answer" button → `/my-questions`
- Note: Can ask up to 2 follow-ups

**Sent From**:
- `backend/routes/askRoutes.js` (line 90, 191) - When answer is submitted
- `backend/routes/engineRoutes.js` (line 198) - When engine delivers answer

**Email Template**: Purple theme with benefits list

---

### 3️⃣ **User: Booking Confirmation** ✅
**Trigger**: After successful payment and booking creation  
**Recipient**: User (who booked)  
**Service**: Nodemailer (SMTP)  
**Subject**: `✅ Booking Confirmed - [Service Title]`

**Content**:
- User name
- Mentor name
- Booking details:
  - Service title
  - Date & time
  - Duration
  - Amount paid
  - Booking ID
- Meeting link (if video/audio call)
- User's notes
- What's next:
  - 24h reminder
  - 1h reminder
  - Join on time
  - Can reschedule/cancel

**Sent From**:
- `backend/services/BookingService.js` (line 247) - After booking creation

**Email Template**: Purple gradient header with booking details table

---

### 4️⃣ **Mentor: New Booking Notification** 🔔
**Trigger**: After successful payment and booking creation  
**Recipient**: Mentor (service provider)  
**Service**: Nodemailer (SMTP)  
**Subject**: `🔔 New Booking - [Service Title]`

**Content**:
- Mentor name
- Student name
- Same booking details as user confirmation
- Meeting link (if video/audio call)
- Student's notes

**Sent From**:
- `backend/services/BookingService.js` (line 187-195) - After booking creation

**Email Template**: Same as user confirmation, but addressed to mentor

---

### 5️⃣ **User: 24-Hour Reminder** ⏰
**Trigger**: 24 hours before scheduled session  
**Recipient**: User (who booked)  
**Service**: Nodemailer (SMTP)  
**Subject**: `⏰ Reminder: Session in 24 hours`

**Content**:
- User name
- Mentor name
- Service title
- Session time
- Duration
- Meeting link (if applicable)
- "Join Meeting" button

**Sent From**:
- `backend/services/ReminderCron.js` (line 44) - Cron job runs every hour
- Checks bookings 24-25 hours away

**Email Template**: Orange gradient header

---

### 6️⃣ **User: 1-Hour Reminder** ⏰
**Trigger**: 1 hour before scheduled session  
**Recipient**: User (who booked)  
**Service**: Nodemailer (SMTP)  
**Subject**: `⏰ Reminder: Session in 1 hour`

**Content**:
- Same as 24-hour reminder
- More urgent tone

**Sent From**:
- `backend/services/ReminderCron.js` (line 49) - Cron job runs every hour
- Checks bookings 1-2 hours away

**Email Template**: Orange gradient header

---

## 🔧 Email Services Used

### 1. **Resend** (Questions/Answers)
- **Used For**: Question assignments, answer notifications
- **From**: `Atyant <notification@atyant.in>`
- **Config**: `RESEND_API_KEY` in `.env`
- **File**: `backend/utils/emailNotifications.js`

### 2. **Nodemailer/SMTP** (Bookings)
- **Used For**: Booking confirmations, reminders
- **From**: `Atyant <[SMTP_USER]>`
- **Config**: 
  - `SMTP_HOST` (default: smtp.gmail.com)
  - `SMTP_PORT` (default: 587)
  - `SMTP_USER`
  - `SMTP_PASS`
- **File**: `backend/services/BookingService.js`

---

## 📊 Notification Flow

### Question Flow
```
1. Student submits question
   ↓
2. System assigns mentor
   ↓
3. 📧 Mentor receives "New Question Assigned" email
   ↓
4. Mentor answers question
   ↓
5. 📧 Student receives "Answer Ready" email
```

### Booking Flow
```
1. User books service + pays
   ↓
2. Booking created
   ↓
3. 📧 User receives "Booking Confirmed" email
   📧 Mentor receives "New Booking" email
   ↓
4. 24 hours before session
   ↓
5. 📧 User receives "24-Hour Reminder" email
   ↓
6. 1 hour before session
   ↓
7. 📧 User receives "1-Hour Reminder" email
```

---

## 🎨 Email Templates

### Question Emails (Resend)
- **Mentor Notification**: Green theme (#10b981)
- **Student Notification**: Purple theme (#6366f1)
- **Features**:
  - Keyword badges
  - Benefits list
  - CTA buttons
  - Professional design

### Booking Emails (Nodemailer)
- **Confirmation**: Purple gradient header
- **Reminders**: Orange gradient header
- **Features**:
  - Booking details table
  - Meeting links
  - What's next section
  - Professional design

---

## 📁 Files Involved

### Email Sending
- `backend/utils/emailNotifications.js` - Resend email functions
- `backend/services/BookingService.js` - Nodemailer email functions

### Triggers
- `backend/routes/questionRoutes.js` - Question submission
- `backend/routes/askRoutes.js` - Answer submission
- `backend/routes/engineRoutes.js` - Follow-ups, engine delivery
- `backend/services/AtyantEngine.js` - Mentor assignment
- `backend/services/ReminderCron.js` - Scheduled reminders

---

## ⚙️ Configuration

### Required Environment Variables

**For Questions (Resend)**:
```env
RESEND_API_KEY=re_xxxxx
FRONTEND_URL=https://www.atyant.in
```

**For Bookings (SMTP)**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## 🚀 Features

### Smart Features
1. **Fallback Names**: Uses `name || username || 'User'/'Mentor'`
2. **Non-blocking**: Email failures don't break the flow
3. **Logging**: All emails logged with ✅/⚠️ status
4. **Cron Jobs**: Reminders sent automatically every hour
5. **Duplicate Prevention**: Tracks `remindersSent.email24h` and `email1h`

### Email Content
1. **Personalized**: Uses actual names
2. **Actionable**: Clear CTA buttons
3. **Informative**: All relevant details included
4. **Professional**: Branded templates
5. **Mobile-friendly**: Responsive HTML

---

## 📈 Notification Stats

### Total Notifications: **6 types**

**By Recipient**:
- **Users**: 4 notifications
  - Answer ready
  - Booking confirmation
  - 24h reminder
  - 1h reminder

- **Mentors**: 2 notifications
  - New question assigned
  - New booking

**By Service**:
- **Resend**: 2 notifications (questions/answers)
- **Nodemailer**: 4 notifications (bookings/reminders)

---

## 🔮 Future Enhancements

### Potential Additions
1. **SMS Notifications** (Twilio)
2. **Push Notifications** (Web Push API - already set up!)
3. **WhatsApp Notifications** (Twilio/WhatsApp Business)
4. **In-app Notifications** (Real-time with Socket.io)
5. **Slack/Discord Webhooks** (For mentors)

### Additional Email Types
1. **Welcome Email** (New user signup)
2. **Password Reset** (Already exists in auth.js!)
3. **Payment Receipt** (Detailed invoice)
4. **Refund Confirmation** (When booking cancelled)
5. **Profile Completion Reminder**
6. **Credit Purchase Confirmation**
7. **Weekly Digest** (Activity summary)

---

## ✅ Summary

**Current Notifications**: 6 email types  
**Services Used**: Resend + Nodemailer  
**Recipients**: Users + Mentors  
**Automation**: Cron jobs for reminders  
**Status**: ✅ Fully functional

All notifications are working and being sent successfully! 🚀
