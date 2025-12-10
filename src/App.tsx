import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GlobalStyles } from './GlobalStyles';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './components/LoginPage';
import { FloatingSidebar } from './components/FloatingSidebar';
import { AdminPanel } from './components/AdminPanel';
import { WebMod } from './components/WebMod';
import { Store } from './components/Store';

// Placeholder components for new routes

const Games = () => (
  <div style={{ padding: '40px', color: '#333' }}>
    <h1>Games</h1>
    <p>Games page coming soon...</p>
  </div>
);

const Blackjack = () => (
  <div style={{ padding: '40px', color: '#333' }}>
    <h1>Blackjack</h1>
    <p>Blackjack game coming soon...</p>
  </div>
);

const Mines = () => (
  <div style={{ padding: '40px', color: '#333' }}>
    <h1>Mines</h1>
    <p>Mines game coming soon...</p>
  </div>
);

const GatesOfDistilary = () => (
  <div style={{ padding: '40px', color: '#333' }}>
    <h1>Gates of Distilary</h1>
    <p>Gates of Distilary game coming soon...</p>
  </div>
);

const Streams = () => (
  <div style={{ padding: '40px', color: '#333' }}>
    <h1>Streams</h1>
    <p>Stream management coming soon...</p>
  </div>
);

const GuessTheBalance = () => (
  <div style={{ padding: '40px', color: '#333' }}>
    <h1>Guess the Balance</h1>
    <p>Guess the Balance feature coming soon...</p>
  </div>
);

const Tournament = () => (
  <div style={{ padding: '40px', color: '#333' }}>
    <h1>Tournament</h1>
    <p>Tournament feature coming soon...</p>
  </div>
);

const Giveaway = () => (
  <div style={{ padding: '40px', color: '#333' }}>
    <h1>Giveaway</h1>
    <p>Giveaway feature coming soon...</p>
  </div>
);

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const { streamElementsService } = await import('./services/streamElementsService');
        const data = await streamElementsService.getLeaderboard(10);
        setLeaderboard(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };
    loadLeaderboard();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #f3f4f6', 
          borderTopColor: '#9146ff', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <p style={{ color: '#6b7280' }}>Loading leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1 style={{ color: '#ef4444' }}>⚠️ Error</h1>
        <p style={{ color: '#6b7280' }}>{error}</p>
        <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '20px' }}>
          Make sure StreamElements is configured correctly in your database.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px', color: '#111827' }}>🏆 Leaderboard</h1>
      {leaderboard.length === 0 ? (
        <p style={{ color: '#6b7280', textAlign: 'center' }}>No users found</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {leaderboard.map((user, index) => (
            <div 
              key={user.username || index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                padding: '15px 20px',
                background: index < 3 ? 'linear-gradient(135deg, #9146ff 0%, #764ba2 100%)' : '#f9fafb',
                borderRadius: '12px',
                border: index < 3 ? 'none' : '1px solid #e5e7eb',
                color: index < 3 ? 'white' : '#111827',
                boxShadow: index < 3 ? '0 4px 15px rgba(145, 70, 255, 0.3)' : 'none'
              }}
            >
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                minWidth: '40px',
                textAlign: 'center'
              }}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '16px' }}>{user.username}</div>
                <div style={{ 
                  fontSize: '14px', 
                  opacity: 0.8,
                  marginTop: '2px'
                }}>
                  {user.watchtime ? `${Math.floor(user.watchtime / 60)} hours watched` : ''}
                </div>
              </div>
              <div style={{ 
                fontWeight: 'bold', 
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span>⭐</span>
                <span>{user.points?.toLocaleString() || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SlotSuggestion = () => (
  <div style={{ padding: '40px', color: '#333' }}>
    <h1>Slot Sugestion</h1>
    <p>Slot Sugestion feature coming soon...</p>
  </div>
);

const SongRequest = () => (
  <div style={{ padding: '40px', color: '#333' }}>
    <h1>Song Request</h1>
    <p>Song Request feature coming soon...</p>
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

  const handleOfferClaim = (offer: any) => {
    // Track analytics or other claim logic here
    console.log('Offer claimed:', offer.title);
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '4rem 2rem', 
        background: '#0f0f23', 
        minHeight: '100vh',
        color: '#e2e8f0',
        textAlign: 'center' 
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '60vh',
          flexDirection: 'column' 
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid rgba(251, 191, 36, 0.3)',
            borderTop: '3px solid #fbbf24',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '1rem'
          }}></div>
          <h2>Loading Partner Offers...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '2rem', 
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)', 
      minHeight: '100vh'
    }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ 
            color: '#ffffff', 
            fontSize: '3.5rem', 
            fontWeight: '800',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Exclusive Partner Offers
          </h1>
          <p style={{ 
            color: '#94a3b8', 
            fontSize: '1.25rem',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Discover premium gaming platforms and crypto services with 
            exclusive bonuses, cashback rewards, and special promotions.
          </p>
        </div>

        {offers.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '6rem 2rem',
            color: '#94a3b8'
          }}>
            <div style={{ 
              fontSize: '4rem', 
              marginBottom: '2rem',
              opacity: 0.5 
            }}>🎯</div>
            <h3 style={{ 
              color: '#ffffff', 
              fontSize: '2rem',
              marginBottom: '1rem',
              fontWeight: '600'
            }}>
              No offers available
            </h3>
            <p style={{ fontSize: '1.1rem' }}>
              We're working on bringing you amazing deals. Check back soon!
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            justifyItems: 'center',
            marginBottom: '4rem'
          }}>
            {offers.map((offer, index) => {
              // Dynamically import and use PartnerOfferCard
              const LazyPartnerOfferCard = React.lazy(() => 
                import('./components/PartnerOfferCard').then(module => ({
                  default: module.PartnerOfferCard
                }))
              );
              
              return (
                <React.Suspense 
                  key={offer.id || index}
                  fallback={
                    <div style={{
                      width: '320px',
                      height: '480px',
                      background: 'linear-gradient(145deg, #2a2d3a 0%, #1a1d28 100%)',
                      borderRadius: '20px',
                      border: '2px solid #ffa500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94a3b8'
                    }}>
                      Loading...
                    </div>
                  }
                >
                  <LazyPartnerOfferCard 
                    offer={offer} 
                    onClaim={handleOfferClaim}
                  />
                </React.Suspense>
              );
            })}
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
                      <Route path="/partners-offers" element={<PartnersOffers />} />
                      <Route path="/store" element={<Store />} />
                      <Route path="/games" element={<Games />} />
                      <Route path="/games/blackjack" element={<Blackjack />} />
                      <Route path="/games/mines" element={<Mines />} />
                      <Route path="/games/gates-of-distilary" element={<GatesOfDistilary />} />
                      <Route path="/streams" element={<Streams />} />
                      <Route path="/streams/guess-the-balance" element={<GuessTheBalance />} />
                      <Route path="/streams/tournament" element={<Tournament />} />
                      <Route path="/streams/giveaway" element={<Giveaway />} />
                      <Route path="/streams/leaderboard" element={<Leaderboard />} />
                      <Route path="/streams/slot-suggestion" element={<SlotSuggestion />} />
                      <Route path="/streams/song-request" element={<SongRequest />} />
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