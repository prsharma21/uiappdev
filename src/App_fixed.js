import React, { useState, useEffect } from 'react';
import Login from './Login';
import Register from './Register';
import Feed from './Feed';

function App() {
  // State to toggle between Login and Register pages
  const [showLogin, setShowLogin] = useState(true);
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  // Loading and error states for better UX
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Handle successful login with enhanced error handling
  const handleLogin = async (userData) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Login successful:', userData);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout with loading state
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      setIsAuthenticated(false);
      setUser(null);
      setShowLogin(true); // Reset to login page
      setError(null);
    } catch (err) {
      setError('Logout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard navigation handler
  const handleKeyPress = (event, action) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // If authenticated, show Feed
  if (isAuthenticated) {
    return (
      <main 
        style={{ minHeight: '100vh', backgroundColor: '#f0f8ff' }}
        aria-label="Main application content"
        role="main"
      >
        {/* Error message display */}
        {error && (
          <div 
            role="alert" 
            aria-live="polite"
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              backgroundColor: '#dc3545',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              zIndex: 1000,
              maxWidth: '300px'
            }}
          >
            {error}
          </div>
        )}
        
        <header style={{ 
          padding: '20px', 
          backgroundColor: 'white',
          borderBottom: '1px solid #ccc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>
              Social Feed
            </h1>
            <p style={{ color: '#666', margin: '0', fontSize: '14px' }}>
              Welcome back, {user?.username || 'User'}!
            </p>
          </div>
          <button 
            onClick={handleLogout}
            onKeyDown={(e) => handleKeyPress(e, handleLogout)}
            disabled={isLoading}
            aria-busy={isLoading}
            aria-label="Logout from application"
            style={{
              padding: '8px 16px',
              backgroundColor: isLoading ? '#6c757d' : '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              opacity: isLoading ? 0.6 : 1,
              transition: 'all 0.2s'
            }}
          >
            {isLoading ? 'Logging out...' : 'Logout'}
          </button>
        </header>
        <Feed user={user} />
      </main>
    );
  }

  // If not authenticated, show Login/Register toggle
  return (
    <main 
      style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f0f8ff', // Light blue background
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}
      aria-label="Authentication page"
      role="main"
    >
      <div style={{ width: '100%', maxWidth: '400px', padding: '20px' }}>
        
        {/* Error message display */}
        {error && (
          <div 
            role="alert" 
            aria-live="polite"
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '4px',
              marginBottom: '20px',
              textAlign: 'center'
            }}
          >
            {error}
          </div>
        )}
        
        {/* Toggle buttons */}
        <div 
          style={{ 
            display: 'flex', 
            marginBottom: '20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '4px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
          role="tablist"
          aria-label="Authentication mode selection"
        >
          <button
            onClick={() => setShowLogin(true)}
            onKeyDown={(e) => handleKeyPress(e, () => setShowLogin(true))}
            disabled={isLoading}
            role="tab"
            aria-selected={showLogin}
            aria-controls="auth-panel"
            aria-label="Switch to login form"
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '6px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              backgroundColor: showLogin ? '#007bff' : 'transparent',
              color: showLogin ? 'white' : '#007bff',
              transition: 'all 0.2s',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            Login
          </button>
          <button
            onClick={() => setShowLogin(false)}
            onKeyDown={(e) => handleKeyPress(e, () => setShowLogin(false))}
            disabled={isLoading}
            role="tab"
            aria-selected={!showLogin}
            aria-controls="auth-panel"
            aria-label="Switch to register form"
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '6px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              backgroundColor: !showLogin ? '#007bff' : 'transparent',
              color: !showLogin ? 'white' : '#007bff',
              transition: 'all 0.2s',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            Register
          </button>
        </div>
        
        {/* Render Login or Register based on state */}
        <div 
          id="auth-panel"
          role="tabpanel"
          aria-labelledby={showLogin ? 'login-tab' : 'register-tab'}
        >
          {showLogin ? (
            <Login onLogin={handleLogin} isLoading={isLoading} />
          ) : (
            <Register isLoading={isLoading} />
          )}
        </div>
      </div>
    </main>
  );
}

export default App;
