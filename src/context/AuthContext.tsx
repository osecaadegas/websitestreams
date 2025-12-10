import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { twitchAuthService } from '../services/twitchAuth';
import { supabaseAuthService } from '../services/supabaseAuth';
import { UserProfile } from '../services/supabase';

interface User extends UserProfile {
  // Extends UserProfile from Supabase
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  isAuthenticated: boolean;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  getUserStats: () => Promise<{
    totalSessions: number;
    lastLogin: string;
    accountAge: number;
  } | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if there's a stored access token
        const token = localStorage.getItem('twitch_access_token');
        if (token) {
          // Validate session with Supabase
          const userProfile = await supabaseAuthService.validateSession();
          if (userProfile) {
            setUser(userProfile);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid token
        localStorage.removeItem('twitch_access_token');
      } finally {
        setLoading(false);
      }
    };

    // Handle OAuth callback
    const handleCallback = async () => {
      const isCallbackPage = window.location.pathname === '/auth/callback';
      
      if (isCallbackPage) {
        console.log('Processing OAuth callback...');
        
        // Check for hash parameters (implicit flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const token = hashParams.get('access_token');
        const state = hashParams.get('state');
        
        console.log('Hash params:', { token: token ? 'present' : 'missing', state });
        
        if (token) {
          try {
            console.log('Processing token...');
            // Handle implicit flow callback with Supabase integration
            const userProfile = await supabaseAuthService.handleTwitchCallback(token, state);
            setUser(userProfile);
            console.log('User profile set, redirecting...');
            
            // Redirect to home page and clean up URL
            window.history.replaceState({}, document.title, '/');
          } catch (error) {
            console.error('OAuth callback error:', error);
            // Redirect to home with error state
            window.history.replaceState({}, document.title, '/');
          }
        } else {
          console.error('No access token found in callback');
          // Redirect to home if no token
          window.history.replaceState({}, document.title, '/');
        }
      }
    };

    handleCallback().then(() => {
      if (window.location.pathname !== '/auth/callback') {
        initializeAuth();
      } else {
        setLoading(false);
      }
    }).catch((error) => {
      console.error('Callback handling failed:', error);
      setLoading(false);
    });
  }, []);

  const login = () => {
    twitchAuthService.initiateLogin();
  };

  const logout = async () => {
    try {
      // Logout from Supabase and Twitch
      await supabaseAuthService.logout();
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      // Force logout even if there's an error
      localStorage.removeItem('twitch_access_token');
      setUser(null);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const updatedUser = await supabaseAuthService.updateUserProfile(user.id, updates);
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const getUserStats = async () => {
    if (!user) return null;
    
    try {
      return await supabaseAuthService.getUserStats(user.id);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    updateProfile,
    getUserStats,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};