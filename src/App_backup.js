import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import EnhancedUIComponent from './components/EnhancedUIComponent';

function App() {
  const handleComponentAction = async () => {
    // Simulate an async action
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Component action completed!');
  };

  return (
    <Router>
      <div>
        <header style={{ padding: '20px', textAlign: 'center', borderBottom: '1px solid #ccc' }}>
          <h1>Frontend App with SCRUM-1 Component</h1>
        </header>
        
        <main>
          <EnhancedUIComponent 
            title="SCRUM-1 Enhanced UI Component"
            onAction={handleComponentAction}
            className="demo-component"
          />
        </main>
        
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
