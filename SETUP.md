# Supabase + Twitch OAuth React App Setup Guide

## Quick Start Checklist

### ✅ 1. Supabase Setup
- [ ] Create account at [supabase.com](https://supabase.com)
- [ ] Create new project
- [ ] Run the SQL schema from `supabase-schema.sql`
- [ ] Copy Project URL and anon key from Settings → API

### ✅ 2. Twitch OAuth Setup  
- [ ] Go to [Twitch Developer Console](https://dev.twitch.tv/console/apps)
- [ ] Create new application
- [ ] Set OAuth Redirect URI: `http://localhost:3000/auth/callback`
- [ ] Copy Client ID

### ✅ 3. Environment Configuration
- [ ] Update `.env` file with your credentials:

```env
REACT_APP_TWITCH_CLIENT_ID=your_twitch_client_id_here
REACT_APP_SUPABASE_URL=your_supabase_url_here  
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### ✅ 4. Run the Application
```bash
npm install
npm start
```

## What You Get

### 🎮 **Dashboard Features**
- Real-time user statistics
- Session tracking
- Account information
- Beautiful responsive UI

### 👤 **Profile Management**
- Edit profile information
- View account statistics
- Track login history
- Account age tracking

### 🗄️ **Database Features**  
- User profiles stored in Supabase
- Session management
- Login tracking
- Account statistics

### 🔒 **Security Features**
- Secure OAuth flow
- Row Level Security (RLS)
- Token management
- Session validation

## Database Schema

The app creates these tables in Supabase:

- **`user_profiles`** - Store user information from Twitch
- **`user_sessions`** - Track user login sessions
- **`user_stats`** - View with aggregated statistics

## Need Help?

1. **Database Issues**: Check Supabase project settings and ensure schema was applied
2. **OAuth Issues**: Verify redirect URI matches exactly in Twitch app settings
3. **Environment Issues**: Double-check all environment variables are set correctly

## Production Deployment

1. Update `.env.production` with production URLs
2. Update Twitch app redirect URI to your domain
3. Configure Supabase RLS policies as needed
4. Deploy with `npm run build`