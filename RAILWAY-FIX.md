# Fix Railway Cookie/Session Issues (401 Errors)

## The Problem

You're getting **401 Unauthorized** errors because:
1. Cookies aren't being sent from Vercel (different domain) to Railway
2. Railway session configuration isn't set up for cross-domain cookies

## The Solution

### Step 1: Update Railway Environment Variables

Go to your Railway project settings and **UPDATE** these variables:

```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://sakshikhartadevi785_db_user:GLtyDz6D6WJrV9tT@cluster0.4re2x7p.mongodb.net/?appName=Cluster0
SESSION_SECRET=ndiedidnedn2oeldiund4nd2jn34ni4d8dnundjnwejhjeqn

# CRITICAL: Add your Vercel URL here
CLIENT_URL=https://learnsphere-client-eta.vercel.app

# CRITICAL: These are required for cross-domain cookies
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
TRUST_PROXY=1
```

### Step 2: Verify Each Setting

Double-check these specific values:

- ✅ `CLIENT_URL` = `https://learnsphere-client-eta.vercel.app` (NO trailing slash!)
- ✅ `COOKIE_SECURE` = `true` (not "1" or "yes")
- ✅ `COOKIE_SAME_SITE` = `none` (lowercase)
- ✅ `TRUST_PROXY` = `1` (the number 1)

### Step 3: Redeploy Railway

After updating environment variables:
- Railway should automatically redeploy
- Or manually trigger a redeploy if it doesn't

### Step 4: Test

1. Open https://learnsphere-client-eta.vercel.app
2. Open DevTools (F12) → **Application** tab → **Cookies**
3. Try to log in
4. After login, you should see a cookie: `learnsphere.sid`
5. Check the cookie properties:
   - ✅ Secure: Yes
   - ✅ SameSite: None
   - ✅ Domain: `.up.railway.app`

## Why This Is Needed

### Cross-Domain Cookie Requirements

When your frontend (Vercel) and backend (Railway) are on different domains:

1. **`COOKIE_SECURE=true`**: Cookies MUST be sent over HTTPS only
2. **`COOKIE_SAME_SITE=none`**: Allows cookies to be sent cross-domain
3. **`TRUST_PROXY=1`**: Railway uses a proxy; this tells Express to trust it
4. **`CLIENT_URL`**: Tells CORS which domain is allowed to send requests

### What Happens Without These Settings

- ❌ Browser blocks cookies (SameSite=Lax default blocks cross-domain)
- ❌ Server rejects requests (CORS policy)
- ❌ Sessions don't work (no cookie = not authenticated)
- ❌ You get 401 Unauthorized errors

## Troubleshooting

### Still Getting 401 Errors?

1. **Clear browser cookies**: DevTools → Application → Clear site data
2. **Check Network tab**: Look for `Set-Cookie` header in login response
3. **Check Console**: Look for cookie warnings
4. **Verify Railway env vars**: Make sure they're saved (no typos!)

### CORS Errors?

If you see "CORS policy" errors:
- Verify `CLIENT_URL` matches your Vercel URL EXACTLY
- No trailing slash
- Must include `https://`

### Cookies Not Being Set?

Check the login API response headers:
```
Set-Cookie: learnsphere.sid=...; Path=/; HttpOnly; Secure; SameSite=None
```

If you don't see `Secure` and `SameSite=None`, Railway environment variables aren't set correctly.

## Alternative: Deploy Both on Railway (Easier)

If cross-domain cookies continue to cause issues, consider deploying both frontend and backend on Railway. This eliminates cross-domain cookie issues completely since they'll be on the same domain.
