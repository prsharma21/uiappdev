import React, { useState, useEffect } from 'react';
import jiraService from '../services/jiraService';
import './JiraTransitionTool.css';

/**
 * JiraTransitionTool Component
 * 
 * A component that allows users to transition JIRA issues through different statuses
 * as part of the JIRA-driven UI development workflow.
 */
const JiraTransitionTool = () => {
  const [issueKey, setIssueKey] = useState('');
  const [issueData, setIssueData] = useState(null);
  const [transitions, setTransitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [comment, setComment] = useState('');

  // Fetch issue details when issue key is entered
  const fetchIssueDetails = async () => {
    if (!issueKey) return;
    
    setLoading(true);
    setError(null);
    setSuccessMessage('');
    setIssueData(null);
    setTransitions([]);
    
    try {
      // Fetch the issue data
      const issue = await jiraService.fetchJiraIssue(issueKey);
      setIssueData(issue);
      
      // Fetch available transitions
      const availableTransitions = await jiraService.getAvailableTransitions(issueKey);
      setTransitions(availableTransitions);
      
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch issue details');
      setLoading(false);
    }
  };

  // Handle issue transition
  const handleTransition = async (transitionId, transitionName) => {
    setLoading(true);
    setError(null);
    setSuccessMessage('');
    
    try {
      // Use the transition method from jiraService
      const result = await jiraService.transitionIssue(
        issueKey, 
        { id: transitionId, name: transitionName }, 
        comment
      );
      
      setSuccessMessage(`Successfully transitioned issue ${issueKey} to "${transitionName}"`);
      
      // Refresh issue data to show new status
      await fetchIssueDetails();
    } catch (err) {
      setError(err.message || 'Failed to transition issue');
      setLoading(false);
    }
  };

  return (
    <div className="jira-transition-tool">
      <h2>JIRA Issue Transition Tool</h2>
      <p className="tool-description">
        Transition JIRA issues to different statuses as part of the JIRA-driven UI development workflow
      </p>
      
      <div className="issue-input-section">
        <div className="input-group">
          <input
            type="text"
            value={issueKey}
            onChange={(e) => setIssueKey(e.target.value.toUpperCase())}
            placeholder="Enter JIRA issue key (e.g., SCRUM-2)"
            className="issue-input"
          />
          <button 
            onClick={fetchIssueDetails} 
            disabled={loading || !issueKey}
            className="fetch-button"
          >
            {loading ? 'Loading...' : 'Fetch Issue'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          <span className="error-icon">❌</span> {error}
        </div>
      )}
      
      {successMessage && (
        <div className="success-message">
          <span className="success-icon">✅</span> {successMessage}
        </div>
      )}
      
      {issueData && (
        <div className="issue-details">
          <div className="issue-header">
            <h3>{issueData.key}: {issueData.summary}</h3>
            <div className="issue-metadata">
              <span className="status-badge" style={{ backgroundColor: getStatusColor(issueData.status) }}>
                {issueData.status}
              </span>
              <span className="type-badge">{issueData.issueType}</span>
              <span className="priority-badge">{issueData.priority}</span>
            </div>
          </div>
          
          <div className="issue-content">
            <div className="details-section">
              <div className="detail-item">
                <strong>Assignee:</strong> {issueData.assignee}
              </div>
              <div className="detail-item">
                <strong>Reporter:</strong> {issueData.reporter}
              </div>
              <div className="detail-item">
                <strong>Created:</strong> {new Date(issueData.created).toLocaleString()}
              </div>
              <div className="detail-item">
                <strong>Updated:</strong> {new Date(issueData.updated).toLocaleString()}
              </div>
            </div>
            
            <div className="description-section">
              <h4>Description</h4>
              <div className="description-preview">
                {issueData.description.length > 200 
                  ? `${issueData.description.substring(0, 200)}...` 
                  : issueData.description}
              </div>
            </div>
          </div>
          
          <div className="transition-section">
            <h4>Available Transitions</h4>
            
            <div className="comment-input">
              <label htmlFor="transition-comment">Comment (optional):</label>
              <textarea
                id="transition-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment for this transition"
                rows={2}
              />
            </div>
            
            {transitions.length > 0 ? (
              <div className="transitions-list">
                {transitions.map(transition => (
                  <button
                    key={transition.id}
                    onClick={() => handleTransition(transition.id, transition.name)}
                    className="transition-button"
                    disabled={loading}
                  >
                    {transition.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="no-transitions">No transitions available for this issue.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get color for status badge
function getStatusColor(status) {
  const statusColors = {
    'To Do': '#6554C0',
    'In Progress': '#0052CC',
    'In Review': '#00C7E6',
    'Testing': '#00A3BF',
    'Done': '#36B37E',
    'Blocked': '#FF5630',
  };
  
  return statusColors[status] || '#7A869A';
}

export default JiraTransitionTool;
