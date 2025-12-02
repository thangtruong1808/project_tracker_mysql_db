# Railway Deployment Guide

## Prerequisites

1. Railway account (sign up at [railway.app](https://railway.app))
2. GitHub repository with your backend code
3. MySQL database (Railway provides MySQL addon or use external service like PlanetScale/FreeSQLDatabase)

## Step-by-Step Deployment Instructions

### Step 1: Create Railway Account and Project

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"** or **"Login"** if you have an account
3. Sign up with GitHub (recommended) or email
4. Click **"New Project"** button
5. Select **"Deploy from GitHub repo"** (or "Empty Project" if deploying manually)

### Step 2: Connect Your Repository

1. If you selected "Deploy from GitHub repo":
   - Authorize Railway to access your GitHub account
   - Select your repository: `your-username/project_tracker`
   - Railway will detect it's a Node.js project

2. If you selected "Empty Project":
   - Click **"New"** → **"GitHub Repo"**
   - Select your repository
   - Railway will auto-detect the backend folder

### Step 3: Configure Root Directory

1. In your Railway project dashboard, go to **Settings**
2. Scroll to **"Root Directory"** section
3. Set Root Directory to: `backend`
4. Click **"Save"**

### Step 4: Configure Build Settings

Railway should auto-detect Node.js, but verify:

1. Go to **Settings** → **Build & Deploy**
2. Verify these settings:
   - **Build Command**: `npm run build` (or leave empty if Railway auto-detects)
   - **Start Command**: `npm start`
   - **Node Version**: 18 or higher (set in `package.json` or Railway settings)

### Step 5: Set Up MySQL Database

**Option A: Railway MySQL Addon (Recommended)**

1. In your Railway project, click **"New"** → **"Database"** → **"Add MySQL"**
2. Railway will create a MySQL database
3. Note the connection details (shown in the database service)

**Option B: External MySQL (PlanetScale, FreeSQLDatabase, etc.)**

1. Use your existing MySQL database
2. You'll need: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

### Step 6: Configure Environment Variables

1. In Railway project dashboard, go to **Variables** tab
2. Click **"New Variable"** and add each variable:

#### Required Environment Variables:

```
PORT=4000
```

```
JWT_SECRET=your-secure-random-jwt-secret-key-minimum-32-characters-long
```
**Important**: Generate a secure random string (use: `openssl rand -base64 32`)

```
DB_HOST=your-database-host
```
(For Railway MySQL: shown in database service, usually something like `containers-us-west-xxx.railway.app`)

```
DB_PORT=3306
```
(Usually 3306 for MySQL)

```
DB_USER=your-database-user
```
(For Railway MySQL: usually `root`)

```
DB_PASSWORD=your-database-password
```
(For Railway MySQL: shown in database service)

```
DB_NAME=project_tracker_mysql_db
```
(Or your database name)

```
FRONTEND_URL=https://your-frontend.vercel.app
```
(Your Vercel frontend URL, e.g., `https://project-tracker.vercel.app`)

#### Optional Environment Variables:

```
DB_SSL=true
```
(Set to `false` if your database doesn't require SSL)

```
DB_SSL_REJECT_UNAUTHORIZED=false
```
(Set to `true` for production with valid SSL certificates)

### Step 7: Run Database Migrations

**Option A: Using Railway CLI (Recommended)**

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Link your project:
   ```bash
   railway link
   ```

4. Run migrations:
   ```bash
   railway run npm run migrate
   ```

**Option B: Using Railway One-Click Deploy Script**

1. In Railway dashboard, go to **Settings** → **Deploy**
2. Add a one-time deploy script:
   - **Command**: `npm run migrate && npm start`
   - This runs migrations before starting the server

**Option C: Manual Migration After First Deploy**

1. After first deployment, go to **Deployments** tab
2. Click on the latest deployment
3. Open **"View Logs"**
4. Use Railway CLI to run migrations:
   ```bash
   railway run npm run migrate
   ```

### Step 8: Deploy

1. Railway will automatically deploy when you:
   - Push to your connected GitHub branch
   - Or manually trigger deployment from dashboard

2. Wait for deployment to complete (check **Deployments** tab)

3. Your backend will be available at: `https://your-project-name.up.railway.app`

### Step 9: Get Your Backend URL

1. In Railway dashboard, go to **Settings** → **Networking**
2. Your public domain will be shown (e.g., `your-project-name.up.railway.app`)
3. Your GraphQL endpoint will be: `https://your-project-name.up.railway.app/graphql`

### Step 10: Update Frontend Environment Variable

1. Go to your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Update or add:
   - **Key**: `VITE_GRAPHQL_URL`
   - **Value**: `https://your-project-name.up.railway.app/graphql`
   - **Environment**: Production, Preview, Development
4. **Redeploy** your Vercel frontend for changes to take effect

## Railway Dashboard Form Fields Reference

When creating a new project, you'll see these fields:

### Project Setup Form:
- **Project Name**: Enter a name (e.g., "project-tracker-backend")
- **Repository**: Select from GitHub repos (or connect new one)
- **Branch**: Select branch (usually `main` or `master`)
- **Root Directory**: Set to `backend` (important!)

### Service Settings:
- **Build Command**: `npm run build` (auto-detected)
- **Start Command**: `npm start` (auto-detected)
- **Healthcheck Path**: Leave empty or set to `/` (optional)

### Database Setup (if using Railway MySQL):
- **Database Name**: Auto-generated or custom
- **Region**: Select closest to your users
- **Plan**: Select free tier or paid plan

## Troubleshooting

### Build Failures

1. **Check Build Logs**:
   - Go to **Deployments** → Click on failed deployment → **View Logs**
   - Look for TypeScript compilation errors

2. **Verify Root Directory**:
   - Ensure Root Directory is set to `backend` in Settings

3. **Check Node Version**:
   - Add to `package.json`:
     ```json
     "engines": {
       "node": ">=18.0.0"
     }
     ```

### Database Connection Issues

1. **Verify Environment Variables**:
   - Check all `DB_*` variables are set correctly
   - Ensure no extra spaces or quotes

2. **Check Database Service**:
   - Verify database is running in Railway dashboard
   - Check database connection string format

3. **SSL Configuration**:
   - Railway MySQL requires SSL
   - Set `DB_SSL=true` and `DB_SSL_REJECT_UNAUTHORIZED=false`

### CORS Errors

1. **Verify FRONTEND_URL**:
   - Set `FRONTEND_URL` to your Vercel frontend URL
   - Include `https://` prefix
   - No trailing slash

2. **Check CORS Configuration**:
   - Railway allows all `.vercel.app` domains automatically
   - Verify your Vercel URL is correct

### Port Issues

1. **Railway Auto-Assigns PORT**:
   - Railway sets `PORT` environment variable automatically
   - Your code should use `process.env.PORT || 4000`
   - Don't hardcode port numbers

## Notes

- **WebSockets**: Railway supports WebSockets, but Vercel frontend cannot use them. Subscriptions will fall back to HTTP polling.
- **Free Tier**: Railway free tier includes $5 credit monthly. Monitor usage in dashboard.
- **Auto-Deploy**: Railway automatically deploys on git push to connected branch.
- **Custom Domain**: You can add custom domain in Settings → Networking (paid feature).

## Next Steps

1. ✅ Backend deployed to Railway
2. ✅ Frontend deployed to Vercel (already done)
3. ✅ Environment variables configured
4. ✅ Database migrations run
5. ✅ CORS configured for Vercel domains
6. 🎉 Your application should now be live!

## Support

- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Railway Status: [status.railway.app](https://status.railway.app)

