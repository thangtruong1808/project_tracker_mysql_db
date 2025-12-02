# Pusher Integration Guide

## Overview

This project now uses **Pusher Channels** for real-time communication. Pusher provides WebSocket infrastructure for real-time updates, replacing GraphQL subscriptions which don't work on Vercel serverless functions.

## Architecture

- **Backend**: Publishes events to Pusher when data changes (comments, notifications)
- **Frontend**: Subscribes to Pusher events for real-time updates
- **Channel**: `project-tracker` (single channel for all events)
- **Events**: `comment_created`, `comment_updated`, `comment_like_updated`, `comment_deleted`, `notification_created`

## Environment Variables

### Backend (.env file)

```env
# Pusher Configuration
APP_ID=2085591
KEY=1dac263b7c59217e7602
SECRET=3c2ee468bda182477c33
CLUSTER=mt1

# Alternative variable names (also supported):
# PUSHER_APP_ID=2085591
# PUSHER_KEY=1dac263b7c59217e7602
# PUSHER_SECRET=3c2ee468bda182477c33
# PUSHER_CLUSTER=mt1
```

### Frontend (Vercel Environment Variables)

In Vercel dashboard → Settings → Environment Variables:

```
VITE_PUSHER_KEY=1dac263b7c59217e7602
VITE_PUSHER_CLUSTER=mt1

# Alternative variable names (also supported):
# VITE_KEY=1dac263b7c59217e7602
# VITE_CLUSTER=mt1
```

**Important**: After adding environment variables in Vercel, you must **redeploy** for them to take effect.

## How It Works

### Backend Flow

1. **Event Occurs**: Comment created, updated, deleted, or liked
2. **PubSub Publishes**: Local pubsub publishes to local subscribers
3. **Pusher Trigger**: PubSub also triggers Pusher event on `project-tracker` channel
4. **Real-Time Broadcast**: Pusher broadcasts event to all connected clients

### Frontend Flow

1. **Component Mounts**: Component using real-time features mounts
2. **Pusher Subscribe**: Hook subscribes to `project-tracker` channel
3. **Event Received**: Pusher delivers event to frontend
4. **UI Updates**: Component updates UI and shows toast notification

## Files Modified

### Backend
- `backend/src/utils/pusher.ts` - Pusher configuration and utilities
- `backend/src/utils/pubsub.ts` - Updated to publish to Pusher
- `backend/package.json` - Added `pusher` dependency

### Frontend
- `frontend/src/lib/pusher.ts` - Pusher client configuration
- `frontend/src/hooks/usePusherSubscription.ts` - Generic Pusher subscription hook
- `frontend/src/hooks/usePusherCommentRealtime.ts` - Comment real-time hook
- `frontend/src/hooks/usePusherNotificationRealtime.ts` - Notification real-time hook
- `frontend/src/components/ProjectDetailComments.tsx` - Updated to use Pusher
- `frontend/src/pages/Notifications.tsx` - Updated to use Pusher
- `frontend/package.json` - Added `pusher-js` dependency

## Event Mapping

| GraphQL Subscription | Pusher Event | Channel |
|----------------------|--------------|---------|
| `commentCreated` | `comment_created` | `project-tracker` |
| `commentUpdated` | `comment_updated` | `project-tracker` |
| `commentLikeUpdated` | `comment_like_updated` | `project-tracker` |
| `commentDeleted` | `comment_deleted` | `project-tracker` |
| `notificationCreated` | `notification_created` | `project-tracker` |

## Testing

### Local Development

1. **Backend**: Ensure `.env` has Pusher credentials
2. **Frontend**: Create `.env.local` with:
   ```
   VITE_PUSHER_KEY=1dac263b7c59217e7602
   VITE_PUSHER_CLUSTER=mt1
   ```
3. **Test**: Create a comment and verify real-time update appears

### Production (Vercel)

1. **Backend**: Set environment variables in Vercel backend project
2. **Frontend**: Set environment variables in Vercel frontend project
3. **Redeploy**: Both frontend and backend after setting variables
4. **Test**: Verify real-time updates work in production

## Troubleshooting

### Events Not Received

1. **Check Environment Variables**: Verify Pusher credentials are set correctly
2. **Check Browser Console**: Look for Pusher connection errors
3. **Verify Channel Name**: Must be `project-tracker`
4. **Check Event Names**: Must match exactly (lowercase with underscores)

### Pusher Connection Errors

1. **Check Network**: Ensure Pusher service is accessible
2. **Verify Credentials**: Check APP_ID, KEY, SECRET, CLUSTER are correct
3. **Check CORS**: Pusher handles CORS automatically, but verify if issues persist

### Backend Not Publishing

1. **Check Backend Logs**: Look for Pusher initialization errors
2. **Verify Environment Variables**: Backend must have Pusher credentials
3. **Test PubSub**: Verify pubsub.publish() is being called

## Benefits

✅ **Works on Vercel**: Serverless functions don't support WebSockets, but Pusher does
✅ **Scalable**: Pusher handles WebSocket infrastructure
✅ **Reliable**: Pusher provides connection management and reconnection
✅ **Real-Time**: Instant updates across all connected clients

## Next Steps

1. ✅ Pusher integrated in backend
2. ✅ Pusher integrated in frontend
3. ✅ Environment variables configured
4. ⚠️ Set environment variables in Vercel (both projects)
5. ⚠️ Redeploy after setting environment variables
6. 🎉 Real-time features should now work!

