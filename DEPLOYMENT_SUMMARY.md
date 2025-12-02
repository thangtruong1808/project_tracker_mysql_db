# Deployment Summary

## Overview

This project is configured for:
- **Frontend**: Vercel (already deployed)
- **Backend**: Railway (deployment guide provided)

## Quick Start

### Frontend (Vercel)
✅ Already deployed. See `frontend/VERCEL_DEPLOYMENT.md` for details.

### Backend (Railway)
📖 Follow the step-by-step guide in `backend/RAILWAY_DEPLOYMENT.md`

## Key Configuration Changes

### CORS Configuration
- Backend now allows all `.vercel.app` domains automatically
- Supports Vercel preview and production deployments
- Configured via `FRONTEND_URL` environment variable

### Environment Variables

#### Frontend (Vercel)
- `VITE_GRAPHQL_URL`: Your Railway backend URL (e.g., `https://your-backend.up.railway.app/graphql`)

#### Backend (Railway)
- `PORT`: Auto-set by Railway (don't override)
- `JWT_SECRET`: Secure random string (minimum 32 characters)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Database credentials
- `FRONTEND_URL`: Your Vercel frontend URL (e.g., `https://your-project.vercel.app`)

## Important Notes

1. **WebSockets**: Vercel does NOT support WebSockets. GraphQL subscriptions will automatically fall back to HTTP polling.

2. **Environment Variables**: 
   - Frontend: Must redeploy Vercel after changing `VITE_GRAPHQL_URL`
   - Backend: Railway applies changes immediately after saving

3. **Database Migrations**: Run migrations after first Railway deployment using Railway CLI or one-time deploy script.

4. **CORS**: Backend automatically allows all Vercel domains. No manual configuration needed for preview deployments.

## Deployment Checklist

### Backend (Railway)
- [ ] Create Railway account
- [ ] Connect GitHub repository
- [ ] Set Root Directory to `backend`
- [ ] Configure environment variables
- [ ] Set up MySQL database (Railway addon or external)
- [ ] Run database migrations
- [ ] Verify deployment is live
- [ ] Copy Railway backend URL

### Frontend (Vercel)
- [ ] Verify `VITE_GRAPHQL_URL` is set to Railway backend URL
- [ ] Redeploy if environment variable was changed
- [ ] Test GraphQL queries in browser
- [ ] Verify no CORS errors

## Support

- Railway: [docs.railway.app](https://docs.railway.app)
- Vercel: [vercel.com/docs](https://vercel.com/docs)

