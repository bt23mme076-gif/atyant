# 🎨 Vertical Slider Setup Guide (Topmate Style)

## ✅ What's Added

Added Topmate-style vertical auto-scrolling sliders to InternshipPage hero section with:
- **Left Slider**: IIT intern photos (bottom to top animation)
- **Right Slider**: IIM intern photos (top to bottom animation)
- Smooth infinite loop animation
- Hover effects
- Mobile responsive (hidden on small screens)

---

## 📁 Where to Add Images

### Step 1: Create Images Folder

```
frontend/
  public/
    iit-intern-1.jpg
    iit-intern-2.jpg
    iit-intern-3.jpg
    iit-intern-4.jpg
    iit-intern-5.jpg
    iim-intern-1.jpg
    iim-intern-2.jpg
    iim-intern-3.jpg
    iim-intern-4.jpg
    iim-intern-5.jpg
```

---

## 🖼️ Image Requirements

### IIT Intern Photos (5 images)
- **Size**: 600x800px (3:4 aspect ratio)
- **Format**: JPG or PNG
- **Content**: Students in IIT campus/lab settings
- **Names**: `iit-intern-1.jpg` to `iit-intern-5.jpg`

### IIM Intern Photos (5 images)
- **Size**: 600x800px (3:4 aspect ratio)
- **Format**: JPG or PNG
- **Content**: Students in IIM campus/business settings
- **Names**: `iim-intern-1.jpg` to `iim-intern-5.jpg`

---

## 🎯 How It Works

### Animation Flow:

```
┌─────────────────┐     ┌─────────────────┐
│   IIT Slider    │     │   IIM Slider    │
│   (Left Side)   │     │  (Right Side)   │
│                 │     │                 │
│   ↑ ↑ ↑ ↑ ↑    │     │   ↓ ↓ ↓ ↓ ↓    │
│   Bottom→Top    │     │   Top→Bottom    │
│                 │     │                 │
│  IIT Bombay     │     │  IIM Ahmedabad  │
│  IIT Delhi      │     │  IIM Bangalore  │
│  IIT Kanpur     │     │  IIM Calcutta   │
│  IIT Madras     │     │  IIM Lucknow    │
│  IIT Kharagpur  │     │  IIM Indore     │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
```

### Features:
- ✅ Infinite loop (seamless)
- ✅ Smooth 30s animation
- ✅ Hover zoom effect
- ✅ Badge with institute name
- ✅ Mobile responsive (hidden < 768px)

---

## 🎨 Customization

### Change Animation Speed

In `InternshipPage.css`:

```css
/* Faster (20s) */
.slider-up .slider-track {
  animation: slideUp 20s linear infinite;
}

/* Slower (40s) */
.slider-up .slider-track {
  animation: slideUp 40s linear infinite;
}
```

---

### Change Badge Colors

```css
/* IIT Badge - Blue */
.intern-badge {
  background: rgba(59, 130, 246, 0.95); /* Change this */
}

/* IIM Badge - Green */
.iim-badge {
  background: rgba(16, 185, 129, 0.95); /* Change this */
}
```

---

### Add More Images

In `InternshipPage.jsx`, add more cards:

```jsx
<div className="intern-card">
  <img src="/iit-intern-6.jpg" alt="IIT Intern 6" loading="lazy" />
  <div className="intern-badge">IIT Roorkee</div>
</div>
```

---

## 📱 Mobile Behavior

- **Desktop (>768px)**: Sliders visible on right side
- **Tablet (768px-1024px)**: Smaller sliders
- **Mobile (<768px)**: Sliders hidden, full-width hero

---

## 🔧 Troubleshooting

### Issue 1: Images Not Showing

**Check**:
1. Images are in `frontend/public/` folder
2. File names match exactly (case-sensitive)
3. Images are JPG/PNG format

**Fix**:
```bash
# Check if images exist
ls frontend/public/*.jpg
```

---

### Issue 2: Animation Not Smooth

**Check**:
1. Browser supports CSS animations
2. No performance issues (too many images)

**Fix**: Reduce animation duration or number of images

---

### Issue 3: Sliders Overlapping Content

**Check**: Hero section height

**Fix** in CSS:
```css
.internship-hero {
  min-height: 700px; /* Increase if needed */
}
```

---

## 🎯 Where to Get Images

### Option 1: Use Placeholder Images (Testing)

Replace image paths with placeholders:
```jsx
<img src="https://via.placeholder.com/600x800/3b82f6/ffffff?text=IIT+Intern" />
```

### Option 2: Use Real Photos

1. Take photos from college events
2. Use stock photos (Unsplash, Pexels)
3. Get permission from students
4. Blur faces if needed for privacy

### Option 3: Use Cloudinary (Recommended)

Upload to Cloudinary and use URLs:
```jsx
<img src="https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1234/iit-intern-1.jpg" />
```

---

## ✅ Testing Checklist

- [ ] All 10 images added to `public/` folder
- [ ] Images load correctly on page
- [ ] Animations are smooth
- [ ] Hover effects work
- [ ] Badges show correct institute names
- [ ] Mobile view hides sliders
- [ ] No console errors

---

## 🚀 Deployment

### Before Pushing to Git:

1. **Add images to public folder**
2. **Test locally**: `npm run dev`
3. **Check animations work**
4. **Test on mobile** (responsive)
5. **Commit and push**

```bash
git add frontend/public/*.jpg
git add frontend/src/components/InternshipPage.jsx
git add frontend/src/components/InternshipPage.css
git commit -m "Add Topmate-style vertical sliders to InternshipPage"
git push origin main
```

---

## 📊 Performance Tips

1. **Optimize images**: Use WebP format (smaller size)
2. **Lazy loading**: Already added (`loading="lazy"`)
3. **Reduce image size**: Max 200KB per image
4. **Use CDN**: Cloudinary for faster loading

---

## 🎨 Design Inspiration

Based on: https://topmate.io/

Features copied:
- ✅ Vertical auto-scroll
- ✅ Opposite direction sliders
- ✅ Smooth infinite loop
- ✅ Hover effects
- ✅ Badge overlays

---

## 📝 Summary

**Files Modified**:
- `frontend/src/components/InternshipPage.jsx` - Added slider HTML
- `frontend/src/components/InternshipPage.css` - Added slider styles

**Files to Add**:
- 10 images in `frontend/public/` folder

**Result**: Beautiful Topmate-style vertical sliders showcasing IIT & IIM interns! 🎉
