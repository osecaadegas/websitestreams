import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GlobalStyles } from './GlobalStyles';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { UserProfile } from './components/UserProfile';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './components/LoginPage';
import { FloatingSidebar } from './components/FloatingSidebar';
import { AdminPanel } from './components/AdminPanel';
import { WebMod } from './components/WebMod';

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

const PartnersOffers = () => {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOffers = async () => {
      try {
        // Import the service dynamically to avoid circular dependencies
        const { partnerOffersService } = await import('./services/partnerOffersService');
        const offerData = await partnerOffersService.getPartnerOffers(false); // Only active offers
        setOffers(offerData);
      } catch (error) {
        console.error('Failed to load partner offers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOffers();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        padding: '4rem 2rem', 
        background: '#0f0f23', 
        minHeight: '100vh',
        color: '#e2e8f0',
        textAlign: 'center' 
      }}>
        <h2>Loading Partner Offers...</h2>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '4rem 2rem', 
      background: '#0f0f23', 
      minHeight: '100vh'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ 
            color: '#e2e8f0', 
            fontSize: '3rem', 
            fontWeight: '700',
            marginBottom: '1rem'
          }}>
            Partners & Offers
          </h1>
          <p style={{ 
            color: '#a0aec0', 
            fontSize: '1.2rem',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Exclusive deals and offers from our trusted partners. 
            Find the best bonuses, cashback rewards, and gaming opportunities.
          </p>
        </div>

        {offers.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem',
            color: '#a0aec0'
          }}>
            <h3 style={{ color: '#e2e8f0', marginBottom: '1rem' }}>
              No offers available at the moment
            </h3>
            <p>Check back soon for exclusive partner deals!</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            {offers.map((offer, index) => (
              <div key={offer.id || index}>
                {/* We'll import the PartnerOfferCard component here */}
                <div style={{
                  background: 'linear-gradient(145deg, #2a2a3e 0%, #1e1e2f 100%)',
                  borderRadius: '16px',
                  padding: '2rem',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(145, 70, 255, 0.2)',
                  height: '400px',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <h3 style={{ 
                    color: '#ffffff', 
                    fontSize: '1.25rem', 
                    fontWeight: '700',
                    marginBottom: '0.75rem'
                  }}>
                    {offer.title}
                  </h3>
                  <p style={{ 
                    color: '#b4b4c7', 
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    marginBottom: '1rem',
                    flex: 1
                  }}>
                    {offer.description}
                  </p>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '0.75rem',
                    marginBottom: '1rem'
                  }}>
                    {offer.min_deposit && (
                      <div>
                        <span style={{ 
                          display: 'block', 
                          color: '#9146ff', 
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          marginBottom: '0.25rem'
                        }}>Min Deposit</span>
                        <span style={{ color: '#ffffff', fontSize: '0.875rem' }}>
                          ${offer.min_deposit}
                        </span>
                      </div>
                    )}
                    
                    {offer.bonus && (
                      <div>
                        <span style={{ 
                          display: 'block', 
                          color: '#9146ff', 
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          marginBottom: '0.25rem'
                        }}>Bonus</span>
                        <span style={{ color: '#ffffff', fontSize: '0.875rem' }}>
                          {offer.bonus}
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 'auto'
                  }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      background: offer.vpn_friendly 
                        ? 'rgba(16, 185, 129, 0.2)' 
                        : 'rgba(239, 68, 68, 0.2)',
                      color: offer.vpn_friendly ? '#10b981' : '#ef4444',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {offer.vpn_friendly ? '✅ VPN Friendly' : '❌ No VPN'}
                    </div>
                    
                    <button
                      onClick={() => offer.affiliate_link && window.open(offer.affiliate_link, '_blank')}
                      style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #9146ff, #6b46c1)',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(145, 70, 255, 0.4)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      Claim Offer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};



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
                      <Route path="/partners-offers" element={<PartnersOffers />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/streams" element={<Streams />} />
                      <Route path="/community" element={<Community />} />
                      <Route path="/admin" element={<AdminPanel />} />
                      <Route path="/webmod" element={<WebMod />} />
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