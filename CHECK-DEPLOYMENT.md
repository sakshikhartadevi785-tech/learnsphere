# Deployment Verification Checklist

## ✅ Vercel (Frontend) Checklist

### 1. Environment Variable Set
- [ ] Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- [ ] Verify `VITE_API_URL` = `https://learnsphere-course-registration-production.up.railway.app/api`
- [ ] Applied to: Production, Preview, Development

### 2. Root Directory Set
- [ ] Settings → General → Root Directory = `client`
- [ ] Output Directory = `dist`

### 3. Latest Deployment Uses Environment Variable
- [ ] Go to Deployments tab
- [ ] Check timestamp - should be AFTER you added the env var
- [ ] If not, click **Redeploy**

### 4. Test API URL in Built Code
Open https://learnsphere-client-eta.vercel.app in browser:
- [ ] Open DevTools (F12) → Network tab
- [ ] Refresh page
- [ ] Look at API requests - should go to `learnsphere-course-registration-production.up.railway.app`
- [ ] NOT to `learnsphere-client-eta.vercel.app`

---

## ✅ Railway (Backend) Checklist

### 1. All Environment Variables Set

Check Railway project → Variables:

```bash
✓ NODE_ENV=production
✓ PORT=5000
✓ MONGODB_URI=mongodb+srv://...
✓ SESSION_SECRET=ndiedidnedn2oeldiund4nd2jn34ni4d8dnundjnwejhjeqn
✓ CLIENT_URL=https://learnsphere-client-eta.vercel.app
✓ COOKIE_SECURE=true
✓ COOKIE_SAME_SITE=none
✓ TRUST_PROXY=1
```

**CRITICAL CHECKS:**
- [ ] `CLIENT_URL` has NO trailing slash
- [ ] `COOKIE_SECURE` is string `"true"` not `"1"`
- [ ] `COOKIE_SAME_SITE` is lowercase `"none"`

### 2. Service Is Running
- [ ] Check Railway logs - no errors
- [ ] Service status = "Active"

### 3. Test Health Endpoint
Open in browser: https://learnsphere-course-registration-production.up.railway.app/api/health

Should return:
```json
{
  "success": true,
  "service": "LearnSphere API",
  "status": "ok",
  "database": "connected",
  "timestamp": "..."
}
```

- [ ] Health check returns 200 OK
- [ ] Database status = "connected"

---

## ✅ Cross-Domain Authentication Test

### 1. Open Your App
https://learnsphere-client-eta.vercel.app

### 2. Check Initial State
- [ ] Open DevTools → **Network** tab
- [ ] Check request to `/api/auth/session`
- [ ] Should return 401 or user data (if already logged in)

### 3. Try Login
- [ ] Click Login
- [ ] Enter credentials
- [ ] Submit form

### 4. Check Login Response
In Network tab, find the `/api/auth/login` request:

**Response Headers** should include:
```
Set-Cookie: learnsphere.sid=...; Path=/; HttpOnly; Secure; SameSite=None; Domain=.up.railway.app
```

- [ ] `Set-Cookie` header present
- [ ] Contains `Secure`
- [ ] Contains `SameSite=None`

### 5. Check Cookie Storage
- [ ] DevTools → **Application** tab → **Cookies**
- [ ] Look under `https://learnsphere-course-registration-production.up.railway.app`
- [ ] Should see `learnsphere.sid` cookie
- [ ] Secure = ✓ (checkmark)
- [ ] SameSite = None

### 6. Test Protected Endpoint
- [ ] After successful login, navigate to Dashboard
- [ ] Check Network tab for `/api/enrollments/dashboard`
- [ ] Should return 200 OK (not 401)

---

## 🐛 Common Issues

### Issue: API calls still going to Vercel domain
**Fix**: Redeploy Vercel after setting environment variable

### Issue: 401 Unauthorized after login
**Fix**: Check Railway environment variables (COOKIE_SECURE, COOKIE_SAME_SITE, TRUST_PROXY)

### Issue: CORS errors
**Fix**: Verify CLIENT_URL in Railway matches Vercel URL exactly

### Issue: Cookie not being set
**Fix**: 
1. Check `Set-Cookie` header in login response
2. If missing `Secure` or `SameSite=None`, Railway env vars are wrong
3. Clear browser cookies and try again

### Issue: Cookie set but not sent with requests
**Fix**: 
1. Browser may be blocking third-party cookies
2. Check browser settings (should allow cookies from Railway domain)
3. Try in incognito/private mode

---

## 📝 Quick Test Commands

### Test Railway API Health
```bash
curl https://learnsphere-course-registration-production.up.railway.app/api/health
```

### Test CORS
```bash
curl -X OPTIONS \
  -H "Origin: https://learnsphere-client-eta.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  https://learnsphere-course-registration-production.up.railway.app/api/courses
```

Should return CORS headers without errors.

---

## ✅ All Working?

If all checks pass:
- ✅ Can browse courses without login
- ✅ Can register new account
- ✅ Can login
- ✅ Can view dashboard
- ✅ Can add courses to basket
- ✅ Can checkout

**Your deployment is successful! 🎉**
