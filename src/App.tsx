import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GlobalStyles } from './GlobalStyles';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { UserProfile } from './components/UserProfile';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './components/LoginPage';
import { FloatingSidebar } from './components/FloatingSidebar';

// Placeholder components for new routes
const Settings = () => (
  <div style={{ padding: '40px', color: '#333' }}>
    <h1>Settings</h1>
    <p>Settings page coming soon...</p>
  </div>
);

const Analytics = () => (
  <div style={{ padding: '40px', color: '#333' }}>
    <h1>Analytics</h1>
    <p>Analytics dashboard coming soon...</p>
  </div>
);

const Streams = () => (
  <div style={{ padding: '40px', color: '#333' }}>
    <h1>Streams</h1>
    <p>Stream management coming soon...</p>
  </div>
);

const Community = () => (
  <div style={{ padding: '40px', color: '#333' }}>
    <h1>Community</h1>
    <p>Community features coming soon...</p>
  </div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <GlobalStyles />
      <Router>
        <div className="App">
          <Routes>
            {/* Login route */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* OAuth callback route */}
            <Route 
              path="/auth/callback" 
              element={
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  minHeight: '100vh',
                  background: '#f8fafc'
                }}>
                  <div style={{ 
                    width: '50px', 
                    height: '50px', 
                    border: '4px solid #e5e7eb',
                    borderTop: '4px solid #9146ff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '20px'
                  }}></div>
                  <p style={{ color: '#6b7280', fontSize: '18px' }}>Processing login...</p>
                  <style>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
              } 
            />
            
            {/* Protected routes */}
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <FloatingSidebar>
                    <Header />
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/profile" element={<UserProfile />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/streams" element={<Streams />} />
                      <Route path="/community" element={<Community />} />
                    </Routes>
                  </FloatingSidebar>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;