# Twitch OAuth React Application

A full-featured React application with Twitch OAuth authentication.

## Features

- 🔐 Secure Twitch OAuth authentication
- 🗄️ **Supabase database integration**
- 👤 **User profile management**
- 📊 **User session tracking**
- 🎮 User profile integration
- 📱 Responsive design
- 🎨 Modern UI with styled-components
- 🛡️ Protected routes
- ⚡ TypeScript support
- 📈 **Real-time user statistics**

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. In the SQL Editor, run the schema from `supabase-schema.sql`
3. Go to Settings → API to get your project URL and anon key

### 3. Configure Twitch OAuth

1. Go to the [Twitch Developer Console](https://dev.twitch.tv/console/apps)
2. Create a new application
3. Set the OAuth Redirect URL to: `http://localhost:3000/auth/callback`
4. Copy your Client ID

### 4. Environment Configuration

Update the `.env` file with your Twitch and Supabase details:

```env
REACT_APP_TWITCH_CLIENT_ID=your_twitch_client_id_here
REACT_APP_TWITCH_REDIRECT_URI=http://localhost:3000/auth/callback
REACT_APP_TWITCH_SCOPES=user:read:email
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Important Security Note:** In a production environment, you should handle the client secret on your backend server, not in the frontend application.

### 5. Start the Development Server

```bash
npm start
```

The application will open at `http://localhost:3000`.

## Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx   # Main dashboard with stats
│   ├── Header.tsx      # Navigation header
│   ├── LoginPage.tsx   # Login interface
│   ├── UserProfile.tsx # User profile management
│   ├── LoadingSpinner.tsx
│   └── ProtectedRoute.tsx
├── context/            # React context providers
│   └── AuthContext.tsx # Authentication state management
├── services/           # API services
│   ├── supabase.ts     # Supabase client configuration
│   ├── supabaseAuth.ts # Enhanced auth with Supabase
│   └── twitchAuth.ts   # Twitch OAuth service
├── App.tsx            # Main application component
├── index.tsx          # Application entry point
└── GlobalStyles.ts    # Global CSS styles
supabase-schema.sql    # Database schema for Supabase
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Authentication Flow

1. User clicks "Continue with Twitch" button
2. Redirected to Twitch OAuth authorization page
3. User authorizes the application
4. Twitch redirects back with authorization code
5. Application exchanges code for access token
6. **User profile is created/updated in Supabase database**
7. **User session is tracked in Supabase**
8. User gains access to protected dashboard with real-time stats

## Security Considerations

- Access tokens are stored in localStorage
- State parameter is used to prevent CSRF attacks
- Token validation is performed on API calls
- Tokens are automatically revoked on logout
- **Supabase Row Level Security (RLS) is enabled**
- **User sessions are securely tracked in the database**
- **All user data is encrypted at rest**

## Production Deployment

1. Update `.env.production` with your production settings
2. Build the application: `npm run build`
3. Deploy the `build` folder to your hosting service
4. Update your Twitch app's OAuth redirect URL to match your domain

## Troubleshooting

### Common Issues

1. **"Invalid Client ID"** - Check your `.env` file and ensure the client ID is correct
2. **OAuth redirect mismatch** - Ensure the redirect URI in your `.env` matches your Twitch app settings
3. **CORS errors** - Make sure you're running the app on the correct port (3000)

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Twitch app configuration
3. Ensure all environment variables are set correctly

## License

This project is open source and available under the MIT License.