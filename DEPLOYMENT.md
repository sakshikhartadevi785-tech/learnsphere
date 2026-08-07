# Deployment Guide

This project uses a split deployment strategy:
- **Frontend (Client)**: Deployed on Vercel
- **Backend (Server)**: Deployed on Railway

## Railway (Backend) Setup

### 1. Environment Variables

Set these in your Railway project:

```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://sakshikhartadevi785_db_user:GLtyDz6D6WJrV9tT@cluster0.4re2x7p.mongodb.net/?appName=Cluster0
SESSION_SECRET=ndiedidnedn2oeldiund4nd2jn34ni4d8dnundjnwejhjeqn
CLIENT_URL=https://learnsphere-client-eta.vercel.app
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
TRUST_PROXY=1
```

**Important Notes:**
- `CLIENT_URL` must match your Vercel deployment URL exactly
- `COOKIE_SECURE=true` and `COOKIE_SAME_SITE=none` are required for cross-domain cookies
- `TRUST_PROXY=1` is required for Railway to properly handle secure cookies

### 2. Deployment

Railway should automatically:
- Detect the `railway.toml` configuration
- Install dependencies
- Build the client (even though we deploy it separately)
- Start the server

The server will be available at: `https://learnsphere-course-registration-production.up.railway.app`

## Vercel (Frontend) Setup

### 1. Environment Variables

Set this in your Vercel project settings:

```bash
VITE_API_URL=https://learnsphere-course-registration-production.up.railway.app/api
```

**Important:** This tells the client where to find your backend API.

### 2. Build Settings

- **Framework Preset**: Vite
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `client/dist`

### 3. Deployment

Push to your repository and Vercel will automatically deploy.

The client will be available at: `https://learnsphere-client-eta.vercel.app`

## Testing the Deployment

1. **Check Backend Health**:
   ```
   https://learnsphere-course-registration-production.up.railway.app/api/health
   ```
   Should return: `{"success":true,"service":"LearnSphere API","status":"ok",...}`

2. **Check Frontend**:
   Open `https://learnsphere-client-eta.vercel.app` and try:
   - Browsing courses
   - Logging in
   - Registering
   - Adding to basket

## Troubleshooting

### 404 Errors on API Calls

**Symptom**: Client shows 404 errors for `/api/...` endpoints

**Solution**: 
- Verify `VITE_API_URL` in Vercel points to Railway URL
- Rebuild and redeploy the client on Vercel

### CORS Errors

**Symptom**: Console shows "CORS policy" errors

**Solution**:
- Verify `CLIENT_URL` in Railway matches your Vercel URL exactly (no trailing slash)
- Verify it includes the full `https://` protocol

### Session/Cookie Issues

**Symptom**: Can't log in, session doesn't persist

**Solution**:
- Verify `COOKIE_SECURE=true` and `COOKIE_SAME_SITE=none` in Railway
- Verify `TRUST_PROXY=1` in Railway
- Check browser console for cookie warnings

## Updating Deployments

### Update Backend Only
```bash
git add server/
git commit -m "Update server"
git push
```
Railway will auto-deploy.

### Update Frontend Only
```bash
git add client/
git commit -m "Update client"
git push
```
Vercel will auto-deploy.

### Update Both
```bash
git add .
git commit -m "Update application"
git push
```
Both will auto-deploy.
