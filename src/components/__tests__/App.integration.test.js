import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Mock the child components to avoid complex dependencies in this integration test
jest.mock('../components/MCPClient', () => {
  return function MockMCPClient() {
    return <div data-testid="mcp-client">MCP Client Component</div>;
  };
});

jest.mock('../components/EnhancedUIComponent', () => {
  return function MockEnhancedUIComponent({ title }) {
    return <div data-testid="enhanced-ui-component">{title}</div>;
  };
});

jest.mock('../Login', () => {
  return function MockLogin() {
    return <div data-testid="login">Login Component</div>;
  };
});

jest.mock('../Register', () => {
  return function MockRegister() {
    return <div data-testid="register">Register Component</div>;
  };
});

describe('App Integration', () => {
  test('renders main header correctly', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Frontend App with JIRA-Driven UI Development/i)).toBeInTheDocument();
    expect(screen.getByText(/Integrated MCP Server/i)).toBeInTheDocument();
  });

  test('renders navigation correctly', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Enhanced Components')).toBeInTheDocument();
    expect(screen.getByText('JIRA-MCP Integration')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  test('renders components demo by default', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/SCRUM-1: Enhanced UI Component Implementation/i)).toBeInTheDocument();
    expect(screen.getByText(/SCRUM-1 Features Implemented/i)).toBeInTheDocument();
  });
});
