# Vercel Deployment Fixes

## Issues Fixed

### 1. Backend 404 Error
**Problem:** Backend was returning 404 because Vercel serverless functions require a different structure than traditional Express servers.

**Solution:**
- Created `backend/api/index.ts` - Vercel serverless function handler
- Updated `backend/vercel.json` to use the correct handler path
- Handler exports Express app as a serverless function

### 2. Apollo Client Error 69
**Problem:** Apollo Client Error 69 occurs when the client can't normalize data or when the GraphQL endpoint returns errors.

**Solution:**
- Improved Apollo Client cache configuration
- Added better error handling in cache setup
- Ensured client is always properly initialized

## Files Changed

### Backend
1. **`backend/api/index.ts`** (NEW)
   - Vercel serverless function handler
   - Exports Express app for Vercel
   - Handles GraphQL endpoint at `/graphql`

2. **`backend/vercel.json`**
   - Updated to use `api/index.ts` as handler
   - Routes all requests to the handler

### Frontend
1. **`frontend/src/lib/apollo.ts`**
   - Improved cache configuration
   - Better error handling to prevent Error 69

## Next Steps

### 1. Redeploy Backend to Vercel
1. Push changes to your repository
2. Vercel will automatically redeploy
3. Or manually trigger deployment in Vercel dashboard

### 2. Verify Backend URL
After backend deployment, get your backend URL:
- Format: `https://your-backend-project.vercel.app`
- GraphQL endpoint: `https://your-backend-project.vercel.app/graphql`

### 3. Update Frontend Environment Variable
1. Go to Vercel frontend project → **Settings** → **Environment Variables**
2. Update `VITE_GRAPHQL_URL` to: `https://your-backend-project.vercel.app/graphql`
3. Make sure to remove trailing slash
4. Redeploy frontend

### 4. Test Deployment
1. Visit your frontend URL
2. Check browser console for errors
3. Verify GraphQL queries work
4. Test authentication flow

## Important Notes

- **Vercel Serverless Functions:** The backend now runs as serverless functions, not a traditional server
- **No WebSockets:** Vercel doesn't support WebSockets, so GraphQL subscriptions use Pusher Channels (already integrated)
- **Cold Starts:** First request may be slower (cold start), subsequent requests are faster
- **Function Timeout:** Hobby plan = 10 seconds, Pro plan = 60 seconds

## Troubleshooting

### Backend Still Returns 404
- Check `vercel.json` is correct
- Verify `api/index.ts` exists and is properly formatted
- Check Vercel build logs for errors

### Apollo Client Error 69 Persists
- Verify `VITE_GRAPHQL_URL` is set correctly in frontend
- Check browser console for network errors
- Ensure backend is accessible at the GraphQL endpoint

### CORS Errors
- Verify `FRONTEND_URL` is set in backend environment variables
- Check that frontend URL matches exactly (no trailing slash)
- Ensure CORS configuration allows your frontend domain

## Author
Thang Truong
Date: 2025-01-27

