# Live Website CSS Fix

## Problem
Live website pe CSS bigad gaya hai but localhost pe sahi chal raha hai.

## Root Cause
- Browser/CDN caching issue
- Vercel build cache issue

## Solutions

### 1. Clear Browser Cache (User Side)
```
Chrome/Edge: Ctrl + Shift + Delete
Firefox: Ctrl + Shift + Delete
Safari: Cmd + Option + E
```

### 2. Hard Refresh
```
Windows: Ctrl + Shift + R or Ctrl + F5
Mac: Cmd + Shift + R
```

### 3. Redeploy on Vercel (Your Side)

#### Option A: Force Redeploy via Git
```bash
# Add a comment or small change
git commit --allow-empty -m "Force redeploy - clear cache"
git push origin main
```

#### Option B: Redeploy via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Deployments tab
4. Click on latest deployment
5. Click "Redeploy" button
6. Check "Use existing Build Cache" - UNCHECK this
7. Click "Redeploy"

### 4. Clear Vercel Build Cache
```bash
# In your project
vercel --force
```

### 5. Add Cache Busting (Permanent Fix)
Add this to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*).css",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

## Quick Fix Command
```bash
# Commit and push to trigger redeploy
git add .
git commit -m "fix: CSS updates for internship page"
git push origin main
```

## Verification
After deployment:
1. Open live site in incognito/private window
2. Check if CSS is fixed
3. If not, wait 2-3 minutes for CDN propagation
4. Hard refresh again

## Note
CSS file locally sahi hai - ye sirf caching issue hai.
