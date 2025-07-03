import React, { useState } from 'react';

// JIRA Issue MYP-1: "change Login Page color to blue" - IMPLEMENTED
// Changed background color to blue (#007bff) and added blue styling throughout the component

// JIRA Issue SCRUM-1: "Create blue background and white border in Login page of social media app" - IMPLEMENTED
// Added white border to the blue background container

// JIRA Issue SCRUM-2: "Create red background and grey border in Login page of socialmediaapp" - IMPLEMENTED
// Updated background color to red (#dc3545) and border to grey as requested

// JIRA Issue SCRUM-3: "Create green background and black border in Login Page" - IMPLEMENTED
// Updated background color to green (#28a745) and border to black as requested

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // For demo purposes, we'll simulate a successful login
    // In a real app, this would make an actual API call
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, any non-empty username/password combination works
      if (username.trim() && password.trim()) {
        const userData = {
          username: username,
          id: 1,
          token: 'demo-token'
        };
        
        // Call the onLogin callback if provided
        if (onLogin) {
          onLogin(userData);
        }
      } else {
        setError('Please enter both username and password');
      }
      
      // Uncomment this for real API integration:
      
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const user = await res.json();
        if (onLogin) {
          onLogin(user);
        }
      } else {
        setError('Invalid credentials');
      }
      
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#28a745', // Green background as requested in SCRUM-3
      border: '3px solid #000000', // Black border as requested in SCRUM-3
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      fontFamily: 'Arial, sans-serif',
      minWidth: '300px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{
          color: '#28a745', // Green text color to match new theme
          textAlign: 'center',
          marginBottom: '1.5rem'
        }}>Login</h2>
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <input 
            placeholder="Username" 
            value={username} 
            onChange={e => setUsername(e.target.value)}
            disabled={loading}
            style={{
              padding: '0.75rem',
              border: '2px solid #28a745', // Green border to match new theme
              borderRadius: '4px',
              fontSize: '1rem',
              opacity: loading ? 0.6 : 1
            }}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
            style={{
              padding: '0.75rem',
              border: '2px solid #28a745', // Green border to match new theme
              borderRadius: '4px',
              fontSize: '1rem',
              opacity: loading ? 0.6 : 1
            }}
          />
          <button 
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? '#6c757d' : '#28a745', // Green button to match new theme
              color: 'white',
              padding: '0.75rem',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {loading ? (
              <>
                <span>Logging in...</span>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #ffffff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
        {error && (
          <div style={{
            color: '#28a745',
            textAlign: 'center',
            marginTop: '1rem',
            padding: '0.5rem',
            backgroundColor: '#d4edda',
            borderRadius: '4px',
            border: '1px solid #c3e6cb'
          }}>
            {error}
          </div>
        )}
        <div style={{
          marginTop: '1rem',
          padding: '0.5rem',
          backgroundColor: '#d1ecf1',
          borderRadius: '4px',
          border: '1px solid #bee5eb',
          fontSize: '0.875rem',
          color: '#0c5460'
        }}>
          <strong>Demo Mode:</strong> Enter any username and password to login
        </div>
      </div>
    </div>
  );
}

export default Login;
