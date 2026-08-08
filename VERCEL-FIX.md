# URGENT: Fix Vercel 404 Errors

## The Problem

Your Vercel app is getting 404s because it's trying to call `/courses` instead of the Railway API.

## The Solution (DO THIS NOW)

### Step 1: Set Environment Variable in Vercel Dashboard

**Vercel does NOT use `.env` files from your repo automatically!**

1. Go to: https://vercel.com/dashboard
2. Click your project: `learnsphere-client-eta`
3. Click **Settings** tab
4. Click **Environment Variables** (left sidebar)
5. Click **Add New**
6. Enter:
   ```
   Name: VITE_API_URL
   Value: https://learnsphere-course-registration-production.up.railway.app/api
   ```
7. Check all boxes: ✓ Production ✓ Preview ✓ Development
8. Click **Save**

### Step 2: Verify Root Directory Setting

While in Settings → General:

- **Root Directory**: Should be `client`
- **Output Directory**: Should be `dist`

If not set, update them and save.

### Step 3: Redeploy

1. Click **Deployments** tab (top)
2. Find the latest deployment
3. Click the **...** (three dots) on the right
4. Click **Redeploy**
5. Wait for deployment to finish (~1-2 minutes)

### Step 4: Test

Open https://learnsphere-client-eta.vercel.app

Open browser DevTools (F12) → Network tab → Refresh page

You should now see API calls going to:
✅ `https://learnsphere-course-registration-production.up.railway.app/api/...`

NOT:
❌ `https://learnsphere-client-eta.vercel.app/courses`

---

## Why This Happened

Vercel ignores `.env` files in your repo. Environment variables MUST be set in the Vercel dashboard for them to be available during the build process.

The `.env` and `.env.production` files are only used for local development.
