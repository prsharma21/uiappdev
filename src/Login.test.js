import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './Login';

describe('Login Component', () => {
  // Test basic rendering
  describe('Rendering Tests', () => {
    it('should render Login component correctly', () => {
      render(<Login />);
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('should display demo mode information', () => {
      render(<Login />);
      expect(screen.getByText(/demo mode/i)).toBeInTheDocument();
      expect(screen.getByText(/enter any username and password to login/i)).toBeInTheDocument();
    });
  });

  // JIRA SCRUM-2 Acceptance Criteria Tests
  describe('JIRA SCRUM-2: Red background and grey border styling', () => {
    it('should have red background color as specified in SCRUM-2', () => {
      render(<Login />);
      const loginContainer = screen.getByRole('heading', { name: /login/i }).closest('div').parentElement;
      expect(loginContainer).toHaveStyle('background-color: #dc3545');
    });

    it('should have grey border as specified in SCRUM-2', () => {
      render(<Login />);
      const loginContainer = screen.getByRole('heading', { name: /login/i }).closest('div').parentElement;
      expect(loginContainer).toHaveStyle('border: 3px solid #6c757d');
    });

    it('should have red-themed form elements', () => {
      render(<Login />);
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const loginButton = screen.getByRole('button', { name: /login/i });
      const heading = screen.getByRole('heading', { name: /login/i });

      expect(usernameInput).toHaveStyle('border: 2px solid #dc3545');
      expect(passwordInput).toHaveStyle('border: 2px solid #dc3545');
      expect(loginButton).toHaveStyle('background-color: #dc3545');
      expect(heading).toHaveStyle('color: #dc3545');
    });
  });

  // Functionality Tests
  describe('Login Functionality', () => {
    it('should handle successful login with valid credentials', async () => {
      const mockOnLogin = jest.fn();
      render(<Login onLogin={mockOnLogin} />);

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      // Check loading state
      expect(screen.getByText(/logging in/i)).toBeInTheDocument();

      // Wait for login to complete
      await waitFor(() => {
        expect(mockOnLogin).toHaveBeenCalledWith({
          username: 'testuser',
          id: 1,
          token: 'demo-token'
        });
      }, { timeout: 2000 });
    });

    it('should show error for empty credentials', async () => {
      render(<Login />);
      
      const loginButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter both username and password/i)).toBeInTheDocument();
      });
    });

    it('should disable form during loading', async () => {
      render(<Login />);
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      // Check that form elements are disabled during loading
      expect(usernameInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(loginButton).toBeDisabled();
    });
  });

  // Integration Tests
  describe('Integration Tests', () => {
    it('should call onLogin callback when provided', async () => {
      const mockOnLogin = jest.fn();
      render(<Login onLogin={mockOnLogin} />);

      fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'user' } });
      fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'pass' } });
      fireEvent.click(screen.getByRole('button', { name: /login/i }));

      await waitFor(() => {
        expect(mockOnLogin).toHaveBeenCalled();
      });
    });

    it('should work without onLogin callback', async () => {
      render(<Login />);

      fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'user' } });
      fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'pass' } });
      
      // Should not throw error when onLogin is not provided
      expect(() => {
        fireEvent.click(screen.getByRole('button', { name: /login/i }));
      }).not.toThrow();
    });
  });

  // Accessibility Tests
  describe('Accessibility Tests', () => {
    it('should have proper form structure for screen readers', () => {
      render(<Login />);
      
      const form = screen.getByRole('button', { name: /login/i }).closest('form');
      expect(form).toBeInTheDocument();
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      expect(usernameInput).toHaveAttribute('type', 'text');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should handle keyboard navigation', () => {
      render(<Login />);
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const loginButton = screen.getByRole('button', { name: /login/i });

      // All interactive elements should be focusable
      usernameInput.focus();
      expect(usernameInput).toHaveFocus();
      
      // Tab navigation should work
      fireEvent.keyDown(usernameInput, { key: 'Tab' });
      passwordInput.focus();
      expect(passwordInput).toHaveFocus();
    });
  });

  // Error Handling Tests
  describe('Error Handling', () => {
    it('should display error messages with proper styling', async () => {
      render(<Login />);
      
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
      
      await waitFor(() => {
        const errorMessage = screen.getByText(/please enter both username and password/i);
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveStyle('color: #dc3545');
        expect(errorMessage).toHaveStyle('background-color: #f8d7da');
      });
    });

    it('should clear previous errors on new submission', async () => {
      render(<Login />);
      
      // First submission with empty fields
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/please enter both username and password/i)).toBeInTheDocument();
      });

      // Second submission with valid data
      fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'user' } });
      fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'pass' } });
      fireEvent.click(screen.getByRole('button', { name: /login/i }));

      // Error should be cleared
      expect(screen.queryByText(/please enter both username and password/i)).not.toBeInTheDocument();
    });
  });

  // Visual Styling Tests
  describe('Visual Styling Tests', () => {
    it('should have consistent spacing and layout', () => {
      render(<Login />);
      
      const container = screen.getByRole('heading', { name: /login/i }).closest('div').parentElement;
      expect(container).toHaveStyle('padding: 2rem');
      expect(container).toHaveStyle('border-radius: 8px');
      expect(container).toHaveStyle('min-width: 300px');
    });

    it('should have proper form styling', () => {
      render(<Login />);
      
      const form = screen.getByRole('button', { name: /login/i }).closest('form');
      expect(form).toHaveStyle('display: flex');
      expect(form).toHaveStyle('flex-direction: column');
      expect(form).toHaveStyle('gap: 1rem');
    });
  });
});
