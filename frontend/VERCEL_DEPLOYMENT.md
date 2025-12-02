# Vercel Deployment Guide (Frontend)

## Prerequisites

1. Vercel account (sign up at [vercel.com](https://vercel.com))
2. GitHub repository with your frontend code
3. Backend API URL from Railway (e.g., `https://your-backend.up.railway.app/graphql`)

## Deployment Steps

### 1. Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"** or **"New Project"**
3. Import your GitHub repository
4. Select the repository: `your-username/project_tracker`

### 2. Configure Build Settings

Vercel should auto-detect Vite, but verify these settings:

1. In project settings, go to **Settings** → **General**
2. Configure:
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `frontend` (click "Edit" and set to `frontend`)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

### 3. Set Environment Variables

1. In Vercel project dashboard, go to **Settings** → **Environment Variables**
2. Click **"Add New"**
3. Add the following variable:

   - **Key**: `VITE_GRAPHQL_URL`
   - **Value**: `https://your-backend.up.railway.app/graphql`
     (Replace with your actual Railway backend URL)
   - **Environment**: 
     - ✅ Production
     - ✅ Preview
     - ✅ Development
     (Select all three)

4. Click **"Save"**

**Important**: 
- After adding environment variables, you **must redeploy** for them to take effect
- Environment variables are embedded at **build time**, not runtime
- The URL should end with `/graphql` or the code will append it automatically

### 4. Deploy

1. Click **"Deploy"** button or push a new commit to trigger auto-deployment
2. Wait for build to complete (check **Deployments** tab)
3. Your app will be available at `https://your-project.vercel.app`

### 5. Verify Deployment

1. Visit your Vercel URL
2. Open browser DevTools → Network tab
3. Check that GraphQL requests are going to your Railway backend
4. Verify no CORS errors in console

## Vercel Dashboard Form Fields Reference

When creating a new project, you'll see:

### Import Git Repository:
- **Repository**: Select from GitHub/GitLab/Bitbucket
- **Import**: Click to import selected repository

### Configure Project:
- **Project Name**: Auto-filled or customize (e.g., "project-tracker-frontend")
- **Framework Preset**: Vite (auto-detected)
- **Root Directory**: Set to `frontend` (important!)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### Environment Variables:
- **Key**: `VITE_GRAPHQL_URL`
- **Value**: Your Railway backend URL
- **Environment**: Select Production, Preview, Development

## Notes

- ✅ **Vercel does NOT support WebSockets**, so GraphQL subscriptions will automatically fall back to HTTP polling
- ✅ Environment variables are embedded at build time, so **redeploy after changing them**
- ✅ The `vercel.json` file is already configured for SPA routing
- ✅ Vercel automatically handles HTTPS and CDN distribution
- ✅ Preview deployments are created for every pull request

## Troubleshooting

### Apollo Client Errors

**Error 69 or Failed to Fetch:**
1. Verify `VITE_GRAPHQL_URL` is set in Vercel environment variables
2. Ensure the URL is correct (check Railway backend is running)
3. Ensure URL format: `https://your-backend.up.railway.app/graphql`
4. **Redeploy** after setting/changing environment variables
5. Check browser console for detailed error messages

**CORS Errors:**
1. Verify Railway backend has `FRONTEND_URL` environment variable set
2. Ensure Railway CORS allows `.vercel.app` domains (automatic in our config)
3. Check Railway backend logs for CORS rejection messages

### Build Failures

1. **Check Build Logs**:
   - Go to **Deployments** → Click on failed deployment → **View Logs**
   - Look for TypeScript or build errors

2. **Verify Root Directory**:
   - Ensure Root Directory is set to `frontend` in Settings → General

3. **Check Node.js Version**:
   - Vercel uses Node.js 18+ by default
   - Can be set in `package.json`:
     ```json
     "engines": {
       "node": ">=18.0.0"
     }
     ```

4. **Dependency Issues**:
   - Ensure all dependencies are in `package.json`
   - Check for missing peer dependencies

### Environment Variables Not Working

1. **Redeploy Required**:
   - Environment variables are embedded at build time
   - Must redeploy after adding/changing variables

2. **Check Variable Names**:
   - Must start with `VITE_` for Vite to expose them
   - Case-sensitive: `VITE_GRAPHQL_URL` not `vite_graphql_url`

3. **Verify All Environments**:
   - Check Production, Preview, and Development are all selected
   - Preview deployments use Preview environment variables

## Next Steps

1. ✅ Frontend deployed to Vercel
2. ✅ Backend deployed to Railway (see `backend/RAILWAY_DEPLOYMENT.md`)
3. ✅ Environment variables configured
4. ✅ CORS configured for Vercel domains
5. 🎉 Your application should now be live!

## Support

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Vercel Discord: [vercel.com/discord](https://vercel.com/discord)
- Vercel Status: [vercel-status.com](https://www.vercel-status.com)

