import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import Feed from './Feed';

function App() {
  // State to toggle between Login and Register pages
  const [showLogin, setShowLogin] = useState(true);
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  // Handle successful login
  const handleLogin = (userData) => {
    console.log('Login successful:', userData);
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setShowLogin(true); // Reset to login page
  };

  // If authenticated, show Feed
  if (isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f0f8ff' }}>
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
             
            </h1>
            <p style={{ color: '#666', margin: '0', fontSize: '14px' }}>
              Welcome back, {user?.username || 'User'}!
            </p>
          </div>
          <button 
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Logout
          </button>
        </header>
        <Feed user={user} />
      </div>
    );
  }

  // If not authenticated, show Login/Register toggle
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f8ff', // Light blue background
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '20px' }}>
        
        
        {/* Toggle buttons */}
        <div style={{ 
          display: 'flex', 
          marginBottom: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '4px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <button
            onClick={() => setShowLogin(true)}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              backgroundColor: showLogin ? '#007bff' : 'transparent',
              color: showLogin ? 'white' : '#007bff',
              transition: 'all 0.2s'
            }}
          >
            Login
          </button>
          <button
            onClick={() => setShowLogin(false)}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              backgroundColor: !showLogin ? '#007bff' : 'transparent',
              color: !showLogin ? 'white' : '#007bff',
              transition: 'all 0.2s'
            }}
          >
            Register
          </button>
        </div>
        
        {/* Render Login or Register based on state */}
        {showLogin ? (
          <Login onLogin={handleLogin} />
        ) : (
          <Register />
        )}
      </div>
    </div>
  );
}

export default App;
