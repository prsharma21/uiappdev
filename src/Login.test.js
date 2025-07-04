import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './Login';

describe('Login Component - SCRUM-2 Implementation', () => {
  // Test 1: Basic rendering test
  it('should render Login component correctly', () => {
    render(<Login />);
    
    // Check if the login form elements are present
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  // Test 2: SCRUM-2 Acceptance Criteria - Red background styling
  it('should have red background as required by SCRUM-2', () => {
    const { container } = render(<Login />);
    const outerDiv = container.firstChild;
    
    // Check for red background color
    expect(outerDiv).toHaveStyle({
      backgroundColor: '#dc3545'
    });
  });

  // Test 3: SCRUM-2 Acceptance Criteria - Grey border styling
  it('should have grey border as required by SCRUM-2', () => {
    const { container } = render(<Login />);
    const outerDiv = container.firstChild;
    
    // Check for grey border
    expect(outerDiv).toHaveStyle({
      border: '3px solid #6c757d'
    });
  });

  // Test 4: Theme consistency - Red elements throughout
  it('should have consistent red theme throughout the component', () => {
    const { container } = render(<Login />);
    
    // Check heading color
    const heading = screen.getByText('Login');
    expect(heading).toHaveStyle({
      color: '#dc3545'
    });
    
    // Check input borders
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    expect(usernameInput).toHaveStyle({
      border: '2px solid #dc3545'
    });
    expect(passwordInput).toHaveStyle({
      border: '2px solid #dc3545'
    });
    
    // Check button background
    const loginButton = screen.getByRole('button', { name: /login/i });
    expect(loginButton).toHaveStyle({
      backgroundColor: '#dc3545'
    });
  });

  // Test 5: User interaction - Form submission
  it('should handle form submission correctly', async () => {
    const mockOnLogin = jest.fn();
    render(<Login onLogin={mockOnLogin} />);
    
    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'testpass' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Check loading state
    expect(screen.getByText('Logging in...')).toBeInTheDocument();
    
    // Wait for completion
    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'testuser',
          id: 1,
          token: 'demo-token'
        })
      );
    }, { timeout: 2000 });
  });

  // Test 6: Error handling
  it('should display error for empty fields', async () => {
    render(<Login />);
    
    // Submit empty form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Please enter both username and password')).toBeInTheDocument();
    });
  });

  // Test 7: Loading state styling
  it('should show loading state with proper styling', async () => {
    render(<Login />);
    
    // Fill form and submit
    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'testpass' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Check loading button state
    const loadingButton = screen.getByText('Logging in...');
    expect(loadingButton.parentElement).toHaveStyle({
      backgroundColor: '#6c757d',
      cursor: 'not-allowed'
    });
    
    // Check disabled inputs
    expect(screen.getByPlaceholderText('Username')).toBeDisabled();
    expect(screen.getByPlaceholderText('Password')).toBeDisabled();
  });

  // Test 8: Responsive design
  it('should have proper responsive styling', () => {
    const { container } = render(<Login />);
    const outerDiv = container.firstChild;
    
    expect(outerDiv).toHaveStyle({
      padding: '2rem',
      borderRadius: '8px',
      minWidth: '300px',
      fontFamily: 'Arial, sans-serif'
    });
  });

  // Test 9: Demo mode information display
  it('should display demo mode information', () => {
    render(<Login />);
    
    expect(screen.getByText('Demo Mode:')).toBeInTheDocument();
    expect(screen.getByText(/Enter any username and password to login/)).toBeInTheDocument();
  });

  // Test 10: Accessibility features
  it('should have proper accessibility attributes', () => {
    render(<Login />);
    
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    // Check form elements are properly accessible
    expect(usernameInput).toBeVisible();
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(loginButton).toHaveAttribute('type', 'submit');
  });
});

// Additional test suite for SCRUM-2 specific styling requirements
describe('SCRUM-2 Styling Requirements Validation', () => {
  it('should meet all SCRUM-2 visual requirements', () => {
    const { container } = render(<Login />);
    const outerDiv = container.firstChild;
    
    // Requirement 1: Red background
    expect(outerDiv).toHaveStyle('background-color: #dc3545');
    
    // Requirement 2: Grey border
    expect(outerDiv).toHaveStyle('border: 3px solid #6c757d');
    
    // Additional visual requirements for consistency
    expect(outerDiv).toHaveStyle('border-radius: 8px');
    expect(outerDiv).toHaveStyle('box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1)');
  });

  it('should maintain color theme consistency throughout the component', () => {
    render(<Login />);
    
    // Check all red-themed elements
    const heading = screen.getByText('Login');
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    // Verify red color scheme
    expect(heading).toHaveStyle('color: #dc3545');
    expect(usernameInput).toHaveStyle('border: 2px solid #dc3545');
    expect(passwordInput).toHaveStyle('border: 2px solid #dc3545');
    expect(loginButton).toHaveStyle('background-color: #dc3545');
  });
});
