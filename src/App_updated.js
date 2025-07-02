import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import MCPClient from './components/MCPClient';
import EnhancedUIComponent from './components/EnhancedUIComponent';

function NavBar() {
  const location = useLocation();
  
  const navStyle = {
    display: 'flex',
    gap: '20px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #dee2e6',
    flexWrap: 'wrap'
  };
  
  const linkStyle = {
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    fontWeight: '500',
    transition: 'all 0.2s'
  };
  
  const activeLinkStyle = {
    ...linkStyle,
    backgroundColor: '#007bff',
    color: 'white'
  };
  
  const inactiveLinkStyle = {
    ...linkStyle,
    backgroundColor: 'white',
    color: '#007bff',
    border: '1px solid #007bff'
  };
  
  return (
    <nav style={navStyle}>
      <Link 
        to="/components" 
        style={location.pathname === '/components' || location.pathname === '/' ? activeLinkStyle : inactiveLinkStyle}
      >
        Enhanced Components
      </Link>
      <Link 
        to="/jira-mcp" 
        style={location.pathname === '/jira-mcp' ? activeLinkStyle : inactiveLinkStyle}
      >
        JIRA-MCP Integration
      </Link>
      <Link 
        to="/login" 
        style={location.pathname === '/login' ? activeLinkStyle : inactiveLinkStyle}
      >
        Login
      </Link>
      <Link 
        to="/register" 
        style={location.pathname === '/register' ? activeLinkStyle : inactiveLinkStyle}
      >
        Register
      </Link>
    </nav>
  );
}

function ComponentsDemo() {
  const [actionResult, setActionResult] = useState('');

  const handleComponentAction = async () => {
    // Simulate an async action with potential error scenarios
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate success/error scenarios randomly for testing
    const shouldSucceed = Math.random() > 0.3; // 70% success rate
    
    if (shouldSucceed) {
      setActionResult('Action completed successfully!');
      console.log('Component action completed successfully!');
    } else {
      throw new Error('Simulated action failure - please try again');
    }
  };

  const handleErrorAction = async () => {
    // Force an error for testing error handling
    throw new Error('This is a test error to demonstrate error handling capabilities');
  };

  const handleSlowAction = async () => {
    // Simulate a very slow action for progress testing
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('Slow action completed!');
  };

  return (
    <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '40px' }}>
        <h2>SCRUM-1: Enhanced UI Component Implementation</h2>
        <p>This demonstrates the enhanced UI component with improved accessibility, error handling, and user experience features.</p>
      </div>

      {actionResult && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '20px', 
          backgroundColor: '#d4edda', 
          border: '1px solid #c3e6cb', 
          borderRadius: '4px',
          color: '#155724'
        }}>
          <strong>Last Action Result:</strong> {actionResult}
        </div>
      )}

      <div style={{ display: 'grid', gap: '30px', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        {/* Primary Component with Progress */}
        <EnhancedUIComponent 
          title="Primary Action Component"
          onAction={handleComponentAction}
          variant="primary"
          size="large"
          showProgress={true}
          className="demo-component-primary"
        />

        {/* Secondary Component for Error Testing */}
        <EnhancedUIComponent 
          title="Error Testing Component"
          onAction={handleErrorAction}
          variant="secondary"
          size="medium"
          className="demo-component-error"
        />

        {/* Progress Demonstration Component */}
        <EnhancedUIComponent 
          title="Slow Action with Progress"
          onAction={handleSlowAction}
          variant="primary"
          size="medium"
          showProgress={true}
          className="demo-component-progress"
        />

        {/* Disabled Component */}
        <EnhancedUIComponent 
          title="Disabled Component"
          onAction={handleComponentAction}
          variant="secondary"
          size="small"
          disabled={true}
          className="demo-component-disabled"
        />
      </div>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>SCRUM-1 Features Implemented:</h3>
        <ul>
          <li>✅ <strong>Accessibility:</strong> Full keyboard navigation, ARIA labels, screen reader support</li>
          <li>✅ <strong>Error Handling:</strong> Comprehensive error states with user-friendly messages</li>
          <li>✅ <strong>Responsive Design:</strong> Works on all screen sizes and devices</li>
          <li>✅ <strong>Loading States:</strong> Visual feedback during async operations</li>
          <li>✅ <strong>Progress Indicators:</strong> Real-time progress for long-running operations</li>
          <li>✅ <strong>Multiple Variants:</strong> Primary, secondary, different sizes</li>
          <li>✅ <strong>Test Coverage:</strong> Comprehensive unit and integration tests</li>
        </ul>
      </div>
    </main>
  );
}

function App() {
  return (
    <Router>
      <div>
        <header style={{ padding: '20px', textAlign: 'center', borderBottom: '1px solid #ccc', backgroundColor: '#ffffff' }}>
          <h1 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>Frontend App with JIRA-Driven UI Development</h1>
          <p style={{ color: '#666', margin: '0', fontSize: '14px' }}>
            🔗 Integrated MCP Server • ⚡ Enhanced Components • 📋 JIRA Issue Processing
          </p>
        </header>
        
        <NavBar />
        
        <Routes>
          <Route path="/" element={<ComponentsDemo />} />
          <Route path="/components" element={<ComponentsDemo />} />
          <Route path="/jira-mcp" element={<MCPClient />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
