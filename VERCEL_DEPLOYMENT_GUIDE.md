# Vercel Deployment Guide for Frontend

This guide provides step-by-step instructions for deploying the frontend to Vercel while the backend is deployed on Render.

## Prerequisites

- Backend deployed on Render (get the backend URL)
- GitHub repository with frontend code
- Vercel account (sign up at https://vercel.com)

## Step-by-Step Deployment Instructions

### 1. Connect Your Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Select the repository: `project_tracker_mysql_db` (or your repo name)

### 2. Configure Project Settings

#### Root Directory
- **Root Directory:** `frontend`
  - This tells Vercel to look in the `frontend` folder for your project

#### Build Command
- **Build Command:** `npm run build`
  - This runs TypeScript compilation and Vite build

#### Output Directory
- **Output Directory:** `dist`
  - This is where Vite outputs the built files

#### Install Command
- **Install Command:** `npm install`
  - Vercel will automatically detect this, but you can specify it explicitly

### 3. Environment Variables

Click on **"Environment Variables"** and add the following:

#### Required Environment Variables

1. **VITE_GRAPHQL_URL**
   - **Value:** Your Render backend URL (e.g., `https://project-tracker-backend-pa9k.onrender.com`)
   - **Note:** Do NOT include `/graphql` at the end - the code will add it automatically
   - **Environments:** Production, Preview, Development (check all three)

#### Example:
```
VITE_GRAPHQL_URL=https://project-tracker-backend-pa9k.onrender.com
```

### 4. Framework Preset

- **Framework Preset:** Vite (Vercel should auto-detect this)
- If not detected, select **"Other"** or **"Vite"**

### 5. Deploy

1. Click **"Deploy"** button
2. Wait for the build to complete
3. Your frontend will be live at a URL like: `https://your-project-name.vercel.app`

### 6. Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

## Summary of Configuration

| Setting | Value |
|---------|-------|
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |
| **Framework Preset** | Vite |
| **Environment Variable** | `VITE_GRAPHQL_URL=https://your-backend-url.onrender.com` |

## Important Notes

1. **CORS Configuration**: Make sure your Render backend has `FRONTEND_URL` environment variable set to your Vercel frontend URL (e.g., `https://your-project-name.vercel.app`)

2. **WebSocket Support**: Vercel serverless functions don't support WebSockets. The frontend code automatically disables WebSocket subscriptions when `VITE_GRAPHQL_URL` is set (production mode).

3. **Auto-Deploy**: Vercel automatically deploys when you push to your main branch. You can also trigger manual deployments.

4. **Preview Deployments**: Vercel creates preview deployments for every pull request automatically.

## Troubleshooting

### Build Fails
- Check that `Root Directory` is set to `frontend`
- Verify `Build Command` is `npm run build`
- Check build logs for specific errors

### API Connection Issues
- Verify `VITE_GRAPHQL_URL` is set correctly (no trailing slash, no `/graphql`)
- Check that backend CORS allows your Vercel domain
- Test backend URL directly: `https://your-backend-url.onrender.com/graphql`

### Environment Variables Not Working
- Make sure variable names start with `VITE_` prefix
- Redeploy after adding environment variables
- Check that variables are enabled for the correct environments (Production/Preview/Development)

## Next Steps

After deployment:
1. Test the frontend URL
2. Verify GraphQL queries work
3. Check browser console for any errors
4. Update backend `FRONTEND_URL` environment variable with your Vercel URL

