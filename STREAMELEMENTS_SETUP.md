# StreamElements Integration Setup Guide

## Overview
This guide will help you integrate StreamElements loyalty points system with your application.

## Prerequisites
- StreamElements account
- Access to StreamElements dashboard
- Admin access to your application

## Setup Steps

### 1. Get Your StreamElements Credentials

1. Go to https://streamelements.com/dashboard
2. Log in with your Twitch account
3. Click on your profile (top right) → **Account Settings**
4. Go to **Channel** section
5. Copy your **Channel ID** (looks like: `5f1a2b3c4d5e6f7g8h9i0j1k`)

### 2. Generate JWT Token

1. In StreamElements Dashboard, go to **Account Settings**
2. Navigate to **Channels** → **Show secrets**
3. Copy your **JWT Token** (starts with `eyJ...`)
4. **IMPORTANT**: Keep this token secret and secure!

### 3. Configure in Your Application

1. Run the SQL schema in your Supabase project:
   ```bash
   # Go to Supabase Dashboard → SQL Editor
   # Copy and paste the contents of sql/streamelements_config.sql
   # Click "Run"
   ```

2. Add your credentials through the Admin Panel or directly in Supabase:
   ```sql
   INSERT INTO streamelements_config (channel_id, jwt_token)
   VALUES ('your_channel_id_here', 'your_jwt_token_here');
   ```

### 4. Test the Integration

You can test the integration by:
1. Go to the Leaderboard page in your app
2. It should display the top users with their points
3. Try adding/removing points from the Admin Panel

## API Features

The StreamElements integration provides:

- ✅ **Get User Points**: Fetch points for a specific user
- ✅ **Leaderboard**: Get top users by points
- ✅ **Add Points**: Reward users with points
- ✅ **Remove Points**: Deduct points from users
- ✅ **Set Points**: Set exact point amount for a user
- ✅ **Get All Users**: Fetch all users with points

## Usage Examples

### In Your Components

```typescript
import { streamElementsService } from '../services/streamElementsService';

// Get user points
const points = await streamElementsService.getUserPoints('username');

// Get leaderboard (top 10)
const leaderboard = await streamElementsService.getLeaderboard(10);

// Add 100 points to user
await streamElementsService.addPoints('username', 100);

// Remove 50 points from user
await streamElementsService.removePoints('username', 50);

// Set user points to exactly 1000
await streamElementsService.setPoints('username', 1000);
```

## Security Notes

⚠️ **IMPORTANT**: 
- Never expose your JWT token in client-side code
- Store credentials securely in Supabase
- Only admins should be able to modify points
- Use RLS policies to protect sensitive data

## Troubleshooting

### "Failed to fetch user points"
- Verify your Channel ID is correct
- Check that JWT token is valid and not expired
- Ensure the user exists in StreamElements

### "Unauthorized" errors
- JWT token might be expired - generate a new one
- Check that RLS policies allow your user to access config

### Points not updating
- Check StreamElements dashboard to verify changes
- API has rate limits - avoid too many requests
- Verify the username matches exactly (case-sensitive)

## Rate Limits

StreamElements API has rate limits:
- 120 requests per minute per channel
- If exceeded, requests will return 429 (Too Many Requests)

## Additional Resources

- [StreamElements API Documentation](https://dev.streamelements.com/)
- [StreamElements Dashboard](https://streamelements.com/dashboard)
- [StreamElements Discord](https://discord.gg/se) for support
