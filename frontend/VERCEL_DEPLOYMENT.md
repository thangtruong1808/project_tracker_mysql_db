# Vercel Deployment Guide

## Prerequisites

1. Vercel account
2. GitHub repository connected to Vercel
3. Backend API URL (e.g., `https://project-tracker-backend-pa9k.onrender.com`)

## Deployment Steps

### 1. Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Select the `frontend` folder as the root directory (or configure it in settings)

### 2. Configure Build Settings

Vercel should auto-detect Vite, but verify these settings:

- **Framework Preset**: Vite
- **Root Directory**: `frontend` (if deploying from monorepo)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Set Environment Variables

In Vercel project settings → Environment Variables, add:

- **Key**: `VITE_GRAPHQL_URL`
- **Value**: `https://project-tracker-backend-pa9k.onrender.com/graphql`
- **Environment**: Production, Preview, Development (select all)

**Important**: After adding environment variables, you must redeploy for them to take effect.

### 4. Deploy

1. Click "Deploy" or push a new commit to trigger auto-deployment
2. Wait for build to complete
3. Your app will be available at `https://your-project.vercel.app`

## Notes

- Vercel does NOT support WebSockets, so GraphQL subscriptions will fall back to HTTP polling
- Environment variables are embedded at build time, so redeploy after changing them
- The `vercel.json` file is already configured for SPA routing

## Troubleshooting

### Apollo Client Error 69

If you see Apollo Client Error 69:
1. Verify `VITE_GRAPHQL_URL` is set in Vercel environment variables
2. Ensure the URL ends with `/graphql` or the code will append it
3. Redeploy after setting environment variables
4. Check browser console for more detailed error messages

### Build Failures

- Ensure Node.js version is 18+ (set in Vercel settings)
- Check that all dependencies are in `package.json`
- Review build logs in Vercel dashboard

