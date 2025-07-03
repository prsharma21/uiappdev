import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import JiraTransitionTool from '../index';
import jiraService from '../../../services/jiraService';

// Mock the jiraService
jest.mock('../../../services/jiraService');

describe('JiraTransitionTool', () => {
  const mockIssue = {
    key: 'SCRUM-2',
    summary: '[UI] Dashboard Layout - Responsive dashboard grid system',
    description: 'This is a test description for the dashboard layout component.',
    status: 'In Progress',
    priority: 'Medium',
    issueType: 'Story',
    assignee: 'John Developer',
    reporter: 'Jane Product Manager',
    created: '2024-01-15T10:30:00.000Z',
    updated: '2024-01-16T14:22:00.000Z'
  };

  const mockTransitions = [
    { id: '31', name: 'In Review' },
    { id: '41', name: 'Testing' },
    { id: '51', name: 'Done' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the service methods
    jiraService.fetchJiraIssue.mockResolvedValue(mockIssue);
    jiraService.getAvailableTransitions.mockResolvedValue(mockTransitions);
    jiraService.transitionIssue.mockResolvedValue({ success: true });
  });

  test('renders the component correctly', () => {
    render(<JiraTransitionTool />);
    expect(screen.getByText('JIRA Issue Transition Tool')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter JIRA issue key (e.g., SCRUM-2)')).toBeInTheDocument();
    expect(screen.getByText('Fetch Issue')).toBeInTheDocument();
  });

  test('fetches and displays issue details when issue key is entered', async () => {
    render(<JiraTransitionTool />);
    
    // Enter issue key and click fetch
    fireEvent.change(screen.getByPlaceholderText('Enter JIRA issue key (e.g., SCRUM-2)'), {
      target: { value: 'SCRUM-2' }
    });
    
    fireEvent.click(screen.getByText('Fetch Issue'));
    
    // Wait for the issue details to be displayed
    await waitFor(() => {
      expect(jiraService.fetchJiraIssue).toHaveBeenCalledWith('SCRUM-2');
      expect(jiraService.getAvailableTransitions).toHaveBeenCalledWith('SCRUM-2');
      expect(screen.getByText('SCRUM-2: [UI] Dashboard Layout - Responsive dashboard grid system')).toBeInTheDocument();
    });
    
    // Check that status and other metadata are displayed
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Story')).toBeInTheDocument();
    
    // Check that transitions are displayed
    expect(screen.getByText('Available Transitions')).toBeInTheDocument();
    expect(screen.getByText('In Review')).toBeInTheDocument();
    expect(screen.getByText('Testing')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  test('handles transition when a transition button is clicked', async () => {
    render(<JiraTransitionTool />);
    
    // Enter issue key and fetch details
    fireEvent.change(screen.getByPlaceholderText('Enter JIRA issue key (e.g., SCRUM-2)'), {
      target: { value: 'SCRUM-2' }
    });
    
    fireEvent.click(screen.getByText('Fetch Issue'));
    
    // Wait for transitions to be displayed
    await waitFor(() => {
      expect(screen.getByText('In Review')).toBeInTheDocument();
    });
    
    // Add a comment
    fireEvent.change(screen.getByPlaceholderText('Add a comment for this transition'), {
      target: { value: 'Moving to review phase' }
    });
    
    // Click the "In Review" transition button
    fireEvent.click(screen.getByText('In Review'));
    
    // Check that transition was called with correct parameters
    await waitFor(() => {
      expect(jiraService.transitionIssue).toHaveBeenCalledWith(
        'SCRUM-2',
        { id: '31', name: 'In Review' },
        'Moving to review phase'
      );
    });
    
    // Check for success message
    expect(screen.getByText(/Successfully transitioned issue SCRUM-2 to "In Review"/)).toBeInTheDocument();
  });

  test('handles error when fetching issue details fails', async () => {
    // Mock the error
    jiraService.fetchJiraIssue.mockRejectedValue(new Error('Issue not found'));
    
    render(<JiraTransitionTool />);
    
    // Enter issue key and fetch
    fireEvent.change(screen.getByPlaceholderText('Enter JIRA issue key (e.g., SCRUM-2)'), {
      target: { value: 'INVALID-123' }
    });
    
    fireEvent.click(screen.getByText('Fetch Issue'));
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('Issue not found')).toBeInTheDocument();
    });
  });

  test('handles error when transition fails', async () => {
    // First mock successful fetch
    render(<JiraTransitionTool />);
    
    // Enter issue key and fetch details
    fireEvent.change(screen.getByPlaceholderText('Enter JIRA issue key (e.g., SCRUM-2)'), {
      target: { value: 'SCRUM-2' }
    });
    
    fireEvent.click(screen.getByText('Fetch Issue'));
    
    // Wait for transitions to be displayed
    await waitFor(() => {
      expect(screen.getByText('In Review')).toBeInTheDocument();
    });
    
    // Now mock the transition failure
    jiraService.transitionIssue.mockRejectedValue(new Error('Permission denied'));
    
    // Click transition
    fireEvent.click(screen.getByText('In Review'));
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('Permission denied')).toBeInTheDocument();
    });
  });
});
