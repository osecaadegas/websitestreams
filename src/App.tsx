import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GlobalStyles } from './GlobalStyles';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { UserProfile } from './components/UserProfile';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './components/LoginPage';

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
                  <Header />
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<UserProfile />} />
                  </Routes>
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