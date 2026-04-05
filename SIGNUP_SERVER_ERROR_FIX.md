# Signup Server Error - Root Causes & Fixes

## 🔴 Critical Issues Found

### Issue 1: Password Minimum Length Mismatch
**Location**: `backend/models/User.js` line 44
```javascript
password: {
  minlength: 8,  // ❌ Model requires 8 characters
}
```

**Frontend**: `frontend/src/components/signup.jsx` line 62
```javascript
} else if (formData.password.length < 6) {  // ❌ Frontend allows 6 characters
  newErrors.password = "Password must be at least 6 characters";
}
```

**Problem**: Frontend allows 6-character passwords, but backend model requires 8 characters minimum. This causes validation error on save.

**Fix**: Update frontend validation to match backend requirement.

---

### Issue 2: GoogleId Field Validation Conflict
**Location**: `backend/models/User.js` lines 7-13
```javascript
googleId: {
  type: String,
  required: function () {
    return !this.password; // ❌ Required if no password
  },
  unique: true,
  index: true
},
```

**Problem**: For regular signup (non-OAuth), users don't have `googleId`. The model has `required: function() { return !this.password }` which means if password exists, googleId is not required. But the `unique: true` constraint can cause issues.

**Fix**: Make googleId truly optional with sparse index.

---

### Issue 3: Role Value Mismatch
**Frontend sends**: `role: "user"` or `role: "mentor"`
**Backend expects**: `role: "user"` or `role: "mentor"` or `role: "admin"`
**Default**: `role: "student"` in signup route (line 60)

**Problem**: Frontend sends "user" but backend defaults to "student" if role is missing. The enum in model doesn't include "student".

---

## ✅ Solutions

### Fix 1: Update Frontend Password Validation
