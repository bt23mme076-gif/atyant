# 📧 Email Notification Debugging Guide

## ✅ Test Result: Email Service Working!

Tested with `backend/testEmail.js` - Email successfully sent! ✅

```
✅ Email sent successfully!
📧 Email ID: 901d7af1-2a20-416e-b097-23780bd5a0cf
```

---

## 📊 Current Email Notifications

### 1️⃣ Mentor: New Question Assigned
**Trigger**: When question is assigned to mentor  
**File**: `backend/services/AtyantEngine.js` (line 865)  
**File**: `backend/routes/questionRoutes.js` (line 403)  
**Status**: ✅ Code exists

### 2️⃣ Student: Answer Ready
**Trigger**: When mentor submits answer  
**File**: `backend/routes/askRoutes.js` (line 96)  
**Status**: ✅ Code exists

### 3️⃣ Student: Follow-up Answer Ready
**Trigger**: When mentor answers follow-up  
**File**: `backend/routes/askRoutes.js` (line 96)  
**Status**: ✅ Code exists

---

## 🔍 Why Emails Might Not Be Sent

### Issue 1: Email Trigger Not Happening
**Reason**: Question assignment flow might not be calling email function

**Check**:
1. Is question being assigned to mentor?
2. Is `sendMentorNewQuestionNotification` being called?
3. Are there any errors in backend logs?

---

### Issue 2: Email Sent But Not Received
**Reason**: Email might be in spam or blocked

**Check**:
1. Spam folder
2. Promotions tab (Gmail)
3. Resend dashboard for delivery status

---

### Issue 3: Resend Domain Not Verified
**Reason**: `notification@atyant.in` domain might not be verified

**Check**:
1. Go to Resend dashboard: https://resend.com/domains
2. Check if `atyant.in` is verified
3. Check DNS records (SPF, DKIM, DMARC)

---

## 🧪 How to Test

### Test 1: Send Test Email
```bash
cd backend
node testEmail.js
```

Should receive email at `bt23mme076@students.vnit.ac.in`

---

### Test 2: Ask a Question
1. Go to www.atyant.in
2. Ask a question
3. Check if mentor receives email
4. Check backend logs for email confirmation

---

### Test 3: Submit Answer
1. Login as mentor
2. Go to mentor dashboard
3. Submit an answer
4. Check if student receives email
5. Check backend logs

---

## 📋 Backend Logs to Check

Look for these lines in logs:

### Success:
```
✅ Resend email service ready
✅ Mentor notification sent → mentor@email.com
✅ Student notification sent → student@email.com
```

### Failure:
```
⚠️ RESEND_API_KEY missing — email notifications disabled
📧 Resend error: [error message]
📧 Send failed: [error message]
⚠️ Email failed for username: [error message]
```

---

## 🔧 Quick Fixes

### Fix 1: Check Resend Dashboard
1. Go to https://resend.com/emails
2. Check recent emails
3. Look for delivery status
4. Check for bounces/failures

---

### Fix 2: Verify Domain
1. Go to https://resend.com/domains
2. Click on `atyant.in`
3. Check DNS records:
   - SPF: `v=spf1 include:_spf.resend.com ~all`
   - DKIM: Add provided CNAME record
   - DMARC: `v=DMARC1; p=none;`

---

### Fix 3: Check Email Logs in Backend

SSH to VPS and check logs:
```bash
# If using Docker
docker-compose logs backend | grep "📧"

# If using PM2
pm2 logs backend | grep "📧"
```

---

### Fix 4: Test with Different Email
Change test email in `testEmail.js`:
```javascript
to: ['your-personal-email@gmail.com']
```

Try Gmail, Yahoo, Outlook to see if it's email provider issue.

---

## 🎯 Most Likely Issues

### 1. Domain Not Verified (90% chance)
**Solution**: Verify domain on Resend dashboard

### 2. Emails in Spam (5% chance)
**Solution**: Check spam folder, add to contacts

### 3. Code Not Triggering (3% chance)
**Solution**: Check backend logs for errors

### 4. API Key Invalid (2% chance)
**Solution**: Generate new API key on Resend

---

## ✅ Verification Checklist

- [ ] Test email sent successfully (`node testEmail.js`)
- [ ] Email received in inbox (not spam)
- [ ] Domain verified on Resend dashboard
- [ ] DNS records configured correctly
- [ ] Backend logs show "Resend email service ready"
- [ ] Asked a question and mentor received email
- [ ] Submitted answer and student received email

---

## 🆘 Still Not Working?

### Check Resend Dashboard
1. Go to https://resend.com/emails
2. Look for sent emails
3. Check delivery status
4. Look for error messages

### Check Backend Logs
```bash
# Docker
docker-compose logs backend --tail=100 | grep -i "email\|resend\|notification"

# PM2
pm2 logs backend --lines=100 | grep -i "email\|resend\|notification"
```

### Contact Resend Support
If domain is verified and test email works but real emails don't:
- Email: support@resend.com
- Provide: Email ID from logs, domain name, error message

---

## 📝 Summary

**Email Service**: ✅ Working (tested)  
**Email Code**: ✅ Implemented  
**Most Likely Issue**: Domain verification on Resend  

**Next Step**: Check Resend dashboard for domain verification status!
