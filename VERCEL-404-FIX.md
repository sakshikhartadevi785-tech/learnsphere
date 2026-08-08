# Fix Vercel 404 on Page Refresh

## The Problem

When you refresh the page on Vercel (or navigate directly to a route like `/courses` or `/about`), you get:

```
404: NOT_FOUND
Code: NOT_FOUND
```

## Why This Happens

Your React app uses **client-side routing** (React Router). When you:
- Click links → React Router handles it ✅ Works
- Refresh page → Vercel looks for actual file `/courses.html` ❌ Doesn't exist

Vercel needs to be told: "For ALL routes, serve `index.html` and let React Router handle it."

## The Solution

I've created the necessary configuration files. Now you need to:

### Step 1: Commit the New Files

```bash
git add vercel.json client/vercel.json client/public/_redirects
git commit -m "Fix Vercel 404 on page refresh - add SPA routing config"
git push
```

### Step 2: Wait for Vercel to Redeploy

Vercel will automatically detect the push and redeploy (1-2 minutes).

### Step 3: Test

After deployment completes:
1. Go to any page on your site
2. Press **F5** (refresh)
3. Should load correctly (no 404 error)

---

## What the Files Do

### `vercel.json` (root)
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
Tells Vercel: "All requests → serve index.html"

### `client/vercel.json`
Same thing, but specific to the client directory (in case Vercel is looking there).

### `client/public/_redirects`
Backup fallback configuration (some hosting platforms use this format).

---

## Verifying the Fix

### Before (Broken):
1. Go to: https://learnsphere-client-eta.vercel.app/courses
2. Refresh (F5)
3. ❌ Shows 404 error

### After (Fixed):
1. Go to: https://learnsphere-client-eta.vercel.app/courses
2. Refresh (F5)
3. ✅ Shows courses page correctly

---

## If Still Not Working

### Option 1: Check Vercel Build Settings

In Vercel Dashboard → Settings → General:

Make sure:
- **Root Directory**: `client`
- **Output Directory**: `dist`

### Option 2: Manually Add Rewrite in Vercel Dashboard

1. Go to Vercel Dashboard → Your Project
2. Settings → Rewrites
3. Add rewrite:
   - **Source**: `/(.*)`
   - **Destination**: `/index.html`

### Option 3: Check Deployment Logs

1. Go to Deployments tab
2. Click latest deployment
3. Check "Building" logs
4. Verify `vercel.json` was detected:
   ```
   Detected vercel.json
   ```

---

## How SPA Routing Works

### Traditional Multi-Page App (MPA):
```
/              → index.html
/about         → about.html
/courses       → courses.html
```
Each route = actual HTML file

### Single-Page App (SPA):
```
/              → index.html (React loads)
/about         → index.html (React Router shows About component)
/courses       → index.html (React Router shows Courses component)
```
All routes = same HTML file, React handles which component to show

### The Problem on Vercel:
Without configuration, Vercel thinks you want traditional routing:
```
User requests: /courses
Vercel looks for: courses.html
Vercel finds: Nothing ❌
Vercel returns: 404
```

### The Solution:
With `vercel.json` configuration:
```
User requests: /courses
Vercel rewrites to: /index.html
Vercel serves: index.html ✅
React Router: Sees URL is /courses, shows Courses component ✅
```

---

## Alternative: Deploy Both on Railway

If Vercel continues to cause issues, you can deploy the entire app (frontend + backend) on Railway:

**Benefits:**
- No CORS issues (same domain)
- No cookie issues (same domain)
- Simpler configuration
- Single deployment

Your backend already handles this correctly in `server/src/app.js`:
```javascript
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method === 'GET' && req.accepts('html') && !req.path.startsWith('/api/')) {
      return res.sendFile(path.join(clientDist, 'index.html'));
    }
    return next();
  });
}
```

This automatically handles SPA routing!

To deploy both on Railway:
1. Push to repository
2. Railway uses `railway.toml` (already configured)
3. Builds client + starts server
4. Server serves both API and static files
5. Single URL for everything

---

## Summary

**Quick Fix:**
1. Commit the files I created
2. Push to repository
3. Wait for Vercel to redeploy
4. Test by refreshing any page

The `vercel.json` file tells Vercel to serve `index.html` for all routes, allowing React Router to handle navigation properly.
