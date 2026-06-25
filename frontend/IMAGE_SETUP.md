# How to Add Images in React (Vite)

## Method 1: Public Folder (Recommended for Static Assets)

**Folder Structure:**
```
frontend/
  ├── public/
  │   └── img/
  │       ├── uu.png
  │       ├── partner.png
  │       ├── u4.png
  │       ├── u5.png
  │       ├── u6.png
  │       └── u7.png
  └── src/
      └── pages/
          └── Home.tsx
```

**Usage in React:**
```tsx
// Use absolute path starting with /
<img src="/img/uu.png" alt="Profile" className="profile-image" />
```

**Pros:**
- ✅ Simple - just reference with `/img/filename.png`
- ✅ No imports needed
- ✅ Good for images that don't change often
- ✅ Images are copied as-is to the build output

**Note:** Your current code already uses this method correctly!

---

## Method 2: Import Method (Recommended for Dynamic Assets)

**Folder Structure:**
```
frontend/
  ├── src/
  │   ├── assets/
  │   │   └── images/
  │   │       ├── uu.png
  │   │       ├── partner.png
  │   │       └── ...
  │   └── pages/
  │       └── Home.tsx
```

**Usage in React:**
```tsx
// Import at the top of your file
import profileImage from '../assets/images/uu.png';
import partnerImage from '../assets/images/partner.png';

// Use the imported variable
<img src={profileImage} alt="Profile" className="profile-image" />
```

**Pros:**
- ✅ TypeScript support
- ✅ Vite optimizes images (compression, etc.)
- ✅ Build-time error if image is missing
- ✅ Better for images used in components

---

## Quick Setup for Your Project

Since you're using Method 1, create this folder structure:

1. Create `frontend/public/img/` folder
2. Place your images there:
   - `uu.png` (profile image)
   - `partner.png` (partner logos)
   - `u4.png`, `u5.png`, `u6.png`, `u7.png` (article images)

Your code at line 24 is already correct:
```tsx
<img src="/img/uu.png" alt="Profile" className="profile-image" />
```

The `/` at the start means it looks in the `public` folder.

