# Vercel Backend Deployment Guide

## Important Note

**Pusher is a real-time communication service, not a hosting platform.** 

If you want to use Pusher for real-time features (WebSockets, push notifications), you can integrate it alongside your Vercel-hosted backend. However, for hosting your Node.js backend, **Vercel supports serverless functions and Node.js applications**.

This guide covers deploying your GraphQL backend to Vercel.

## Prerequisites

1. Vercel account (sign up at [vercel.com](https://vercel.com))
2. GitHub repository with your backend code
3. MySQL database (external service like PlanetScale, FreeSQLDatabase, or Railway MySQL)

## Deployment Steps

### Step 1: Prepare Backend for Vercel

Vercel uses serverless functions, so we need to create a serverless entry point.

1. Create `backend/api/index.ts` (or use existing if present)
2. Ensure your backend can run as a serverless function

### Step 2: Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"** or **"New Project"**
3. Import your GitHub repository
4. Select the repository: `your-username/project_tracker`

### Step 3: Configure Project Settings

In Vercel project dashboard:

1. Go to **Settings** → **General**
2. Configure:
   - **Framework Preset**: Other (or Node.js)
   - **Root Directory**: `backend` (click "Edit" and set to `backend`)
   - **Build Command**: `npm run build`
   - **Output Directory**: Leave empty or set to `dist`
   - **Install Command**: `npm install`
   - **Development Command**: `npm run dev`

### Step 4: Create Vercel Configuration

Create `backend/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/src/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/graphql",
      "dest": "dist/src/index.js"
    },
    {
      "src": "/",
      "dest": "dist/src/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Step 5: Set Environment Variables

In Vercel dashboard → **Settings** → **Environment Variables**, add:

```
PORT=4000
```
(Vercel auto-sets PORT, but include as fallback)

```
JWT_SECRET=your-secure-random-32-character-string
```
(Generate with: `openssl rand -base64 32`)

```
DB_HOST=your-database-host
```
(Your MySQL database host)

```
DB_PORT=3306
```
(Usually 3306 for MySQL)

```
DB_USER=your-database-user
```
(Your MySQL username)

```
DB_PASSWORD=your-database-password
```
(Your MySQL password)

```
DB_NAME=project_tracker_mysql_db
```
(Your database name)

```
FRONTEND_URL=https://your-frontend.vercel.app
```
(Your Vercel frontend URL)

```
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
```
(If your database requires SSL)

### Step 6: Important Vercel Limitations

⚠️ **Vercel Serverless Functions Limitations:**

1. **No WebSockets**: Vercel serverless functions do NOT support WebSockets
   - GraphQL subscriptions will NOT work
   - You'll need to use HTTP polling or integrate Pusher Channels for real-time features

2. **Function Timeout**: 
   - Hobby plan: 10 seconds
   - Pro plan: 60 seconds
   - Ensure your GraphQL queries complete within these limits

3. **Cold Starts**: 
   - First request may be slower (cold start)
   - Subsequent requests are faster

### Step 7: Alternative: Use Vercel for API Routes Only

If you need WebSockets, consider:

**Option A: Deploy to Railway/Render for WebSocket support**
- See `backend/RAILWAY_DEPLOYMENT.md` for Railway deployment
- Railway supports WebSockets and long-running processes

**Option B: Use Pusher Channels for Real-Time Features**
- Deploy backend to Vercel for HTTP requests
- Integrate Pusher Channels for WebSocket/real-time features
- See integration guide below

### Step 8: Deploy

1. Push your code to GitHub
2. Vercel will automatically deploy
3. Or click **"Deploy"** in Vercel dashboard
4. Wait for deployment to complete

### Step 9: Get Backend URL

1. After deployment, Vercel provides a URL: `https://your-project.vercel.app`
2. Your GraphQL endpoint: `https://your-project.vercel.app/graphql`

### Step 10: Update Frontend

1. Go to Vercel frontend project → **Settings** → **Environment Variables**
2. Update `VITE_GRAPHQL_URL` to: `https://your-project.vercel.app/graphql`
3. Redeploy frontend

## Integrating Pusher Channels (Optional)

If you want real-time features, integrate Pusher Channels:

### Backend Integration

1. Install Pusher:
```bash
cd backend
npm install pusher
```

2. Create `backend/src/utils/pusher.ts`:
```typescript
import Pusher from 'pusher'

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER || 'us2',
  useTLS: true,
})

export default pusher
```

3. Add to Vercel environment variables:
```
PUSHER_APP_ID=your-app-id
PUSHER_KEY=your-key
PUSHER_SECRET=your-secret
PUSHER_CLUSTER=us2
```

4. Use Pusher in your resolvers for real-time updates

### Frontend Integration

1. Install Pusher JS:
```bash
cd frontend
npm install pusher-js
```

2. Use Pusher for real-time subscriptions instead of GraphQL subscriptions

## Vercel Dashboard Form Fields

### New Project:
- **Project Name**: Auto-filled or customize
- **Framework Preset**: Other or Node.js
- **Root Directory**: `backend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist` (or leave empty)
- **Install Command**: `npm install`

### Environment Variables:
- Add each variable with Key and Value
- Select environments: Production, Preview, Development

## Troubleshooting

### Build Failures

1. **Check Build Logs**: Deployments → Failed deployment → View Logs
2. **Verify Root Directory**: Must be set to `backend`
3. **Check TypeScript**: Ensure `tsconfig.json` is configured correctly
4. **Verify Build Output**: Ensure `dist/src/index.js` exists after build

### Function Timeout

1. **Optimize Queries**: Ensure GraphQL queries complete quickly
2. **Use Pagination**: Break large queries into smaller chunks
3. **Upgrade Plan**: Pro plan has 60-second timeout

### WebSocket Not Working

1. **Vercel Limitation**: Serverless functions don't support WebSockets
2. **Solution**: Use Pusher Channels or deploy to Railway/Render
3. **Alternative**: Use HTTP polling for subscriptions

## Recommendation

For a GraphQL backend with subscriptions:
- **Best Option**: Deploy to Railway or Render (supports WebSockets)
- **Alternative**: Deploy to Vercel + use Pusher Channels for real-time

## Next Steps

1. ✅ Backend deployed to Vercel
2. ✅ Frontend deployed to Vercel
3. ✅ Environment variables configured
4. ⚠️ Note: WebSockets won't work (use Pusher Channels if needed)
5. 🎉 Your application should now be live!

## Support

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Pusher Docs: [pusher.com/docs](https://pusher.com/docs)

