# Production Module Import Error Fix

## Error
```
Failed to fetch dynamically imported module: https://www.atyant.in/assets/signup-DxfoGvrE.js
```

## Root Cause
- Vite build created chunked files with hash names
- Browser cached old HTML with old chunk references
- New deployment has different chunk hashes
- Browser trying to load old chunks that don't exist

## Immediate Solution

### Step 1: Clear Vercel Build Cache
```bash
# In your local terminal
vercel --force
```

OR via Vercel Dashboard:
1. Go to Vercel Dashboard
2. Project Settings → General
3. Scroll to "Build & Development Settings"
4. Click "Redeploy" on latest deployment
5. **UNCHECK** "Use existing Build Cache"
6. Deploy

### Step 2: Add Cache Headers to vercel.json

Create or update `vercel.json` in frontend root:

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
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Step 3: Update vite.config.js

Add build options to prevent caching issues:

```javascript
export default defineConfig({
  // ... existing config
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
```

### Step 4: Force Rebuild and Deploy

```bash
# Clean everything
rm -rf frontend/dist
rm -rf frontend/node_modules/.vite
rm -rf frontend/.vite

# Rebuild
cd frontend
npm run build

# Commit and push
git add .
git commit -m "fix: resolve production module import error"
git push origin main
```

## For Users - Clear Browser Cache

Tell users to:
1. Hard refresh: Ctrl + Shift + R (Windows) or Cmd + Shift + R (Mac)
2. Or clear browser cache completely
3. Or open in incognito/private window

## Prevention

### Add to index.html (in <head>):
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

### Add Service Worker Cache Busting

Update your service worker to clear old caches on activation.

## Quick Fix Command

```bash
# Run this to fix immediately
cd frontend
rm -rf dist .vite node_modules/.vite
npm run build
git add .
git commit -m "fix: clear build cache and rebuild"
git push origin main
```

## Verification

After deployment:
1. Open https://www.atyant.in in incognito window
2. Check if signup page loads
3. Check browser console for errors
4. If still failing, wait 2-3 minutes for CDN propagation

## Technical Details

The error occurs because:
1. Vite generates hashed filenames for code splitting (signup-DxfoGvrE.js)
2. When you redeploy, new hashes are generated (signup-AbC123.js)
3. Cached HTML still references old hashes
4. Browser gets 404 when trying to load old chunks

Solution: Ensure HTML is never cached, but assets are cached forever (immutable).
