import React, { useState, useEffect } from 'react';
import jiraService from '../services/jiraService';
import './MCPClient.css';

const MCPClient = () => {
  const [issueKey, setIssueKey] = useState('MYP-1');
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverHealth, setServerHealth] = useState(null);
  const [mcpTools, setMCPTools] = useState([]);
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    checkHealth();
    fetchMCPTools();
  }, []);

  const checkHealth = async () => {
    try {
      const health = await jiraService.checkServerHealth();
      setServerHealth(health);
    } catch (err) {
      setServerHealth({ status: 'Error', error: err.message });
    }
  };

  const fetchMCPTools = async () => {
    try {
      const tools = await jiraService.getMCPTools();
      setMCPTools(tools);
    } catch (err) {
      console.error('Failed to fetch MCP tools:', err.message);
    }
  };

  const fetchJiraIssue = async () => {
    if (!issueKey.trim()) {
      setError('Please enter a valid JIRA issue key');
      return;
    }

    setLoading(true);
    setError('');
    setIssue(null);

    try {
      console.log(`🎯 Fetching JIRA issue: ${issueKey}`);
      const issueData = await jiraService.fetchJiraIssue(issueKey.trim());
      setIssue(issueData);
      setError('');
      
      // Add to test results
      setTestResults(prev => [{
        timestamp: new Date().toISOString(),
        action: 'fetchJiraIssue',
        issueKey: issueKey.trim(),
        success: true,
        data: issueData
      }, ...prev.slice(0, 4)]);

    } catch (err) {
      setError(err.message);
      setIssue(null);
      
      // Add error to test results
      setTestResults(prev => [{
        timestamp: new Date().toISOString(),
        action: 'fetchJiraIssue',
        issueKey: issueKey.trim(),
        success: false,
        error: err.message
      }, ...prev.slice(0, 4)]);
    } finally {
      setLoading(false);
    }
  };

  const testMCPMethod = async (method, params = {}) => {
    try {
      setLoading(true);
      console.log(`🧪 Testing MCP method: ${method}`);
      const result = await jiraService.testMCPMethod(method, params);
      
      setTestResults(prev => [{
        timestamp: new Date().toISOString(),
        action: `testMCP: ${method}`,
        success: true,
        data: result
      }, ...prev.slice(0, 4)]);

    } catch (err) {
      setTestResults(prev => [{
        timestamp: new Date().toISOString(),
        action: `testMCP: ${method}`,
        success: false,
        error: err.message
      }, ...prev.slice(0, 4)]);
    } finally {
      setLoading(false);
    }
  };

  const generateComponent = async () => {
    if (!issueKey.trim()) {
      setError('Please enter a valid JIRA issue key');
      return;
    }

    try {
      setLoading(true);
      console.log(`🎨 Generating component from issue: ${issueKey}`);
      const result = await jiraService.generateComponentFromIssue(issueKey.trim());
      
      setTestResults(prev => [{
        timestamp: new Date().toISOString(),
        action: 'generateComponent',
        issueKey: issueKey.trim(),
        success: true,
        data: result
      }, ...prev.slice(0, 4)]);

    } catch (err) {
      setError(err.message);
      setTestResults(prev => [{
        timestamp: new Date().toISOString(),
        action: 'generateComponent',
        issueKey: issueKey.trim(),
        success: false,
        error: err.message
      }, ...prev.slice(0, 4)]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchJiraIssue();
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="mcp-client">
      <div className="mcp-header">
        <h2>🤖 MCP Client - JIRA Integration</h2>
        <div className="server-status">
          <span className="status-label">Server Status:</span>
          <span className={`status-indicator ${serverHealth?.mcpServer === 'Connected' ? 'online' : 'offline'}`}>
            {serverHealth?.mcpServer === 'Connected' ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
          <button onClick={checkHealth} className="refresh-btn" disabled={loading}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {serverHealth && (
        <div className="health-info">
          <h4>Server Health Information</h4>
          <div className="health-grid">
            <div className="health-item">
              <strong>Status:</strong> {serverHealth.status}
            </div>
            <div className="health-item">
              <strong>MCP Server:</strong> {serverHealth.mcpServer}
            </div>
            <div className="health-item">
              <strong>Uptime:</strong> {Math.round(serverHealth.uptime || 0)}s
            </div>
            <div className="health-item">
              <strong>Version:</strong> {serverHealth.version || 'Unknown'}
            </div>
          </div>
        </div>
      )}

      <div className="mcp-controls">
        <div className="input-section">
          <h3>📋 Fetch JIRA Issue</h3>
          <div className="input-group">
            <input
              type="text"
              value={issueKey}
              onChange={(e) => setIssueKey(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="Enter JIRA issue key (e.g., MYP-1, SCRUM-1)"
              className="issue-input"
              disabled={loading}
            />
            <button onClick={fetchJiraIssue} disabled={loading || !issueKey.trim()} className="fetch-btn">
              {loading ? '🔄 Fetching...' : '📋 Fetch Issue'}
            </button>
            <button onClick={generateComponent} disabled={loading || !issueKey.trim()} className="generate-btn">
              {loading ? '🔄 Generating...' : '🎨 Generate Component'}
            </button>
          </div>
        </div>

        <div className="mcp-test-section">
          <h3>🧪 MCP Method Testing</h3>
          <div className="test-buttons">
            <button onClick={() => testMCPMethod('ping')} disabled={loading} className="test-btn">
              🏓 Ping
            </button>
            <button onClick={() => testMCPMethod('get-issue-description', { issueKey: 'MYP-1' })} disabled={loading} className="test-btn">
              📋 Get Issue
            </button>
            <button onClick={() => testMCPMethod('tools/list')} disabled={loading} className="test-btn">
              🔧 List Tools
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">❌</span>
          <span>{error}</span>
          <button onClick={() => setError('')} className="close-btn">×</button>
        </div>
      )}

      {issue && (
        <div className="issue-display">
          <h3>📋 Issue Details: {issue.key}</h3>
          <div className="issue-content">
            <div className="issue-header">
              <h4>{issue.summary}</h4>
              <div className="issue-badges">
                <span className={`status-badge status-${issue.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                  {issue.status}
                </span>
                <span className={`priority-badge priority-${issue.priority?.toLowerCase()}`}>
                  {issue.priority}
                </span>
                <span className="type-badge">
                  {issue.issueType}
                </span>
              </div>
            </div>

            <div className="issue-details">
              <div className="details-grid">
                <div className="detail-item">
                  <strong>Assignee:</strong>
                  <span>{issue.assignee}</span>
                </div>
                <div className="detail-item">
                  <strong>Reporter:</strong>
                  <span>{issue.reporter}</span>
                </div>
                <div className="detail-item">
                  <strong>Created:</strong>
                  <span>{formatDate(issue.created)}</span>
                </div>
                <div className="detail-item">
                  <strong>Updated:</strong>
                  <span>{formatDate(issue.updated)}</span>
                </div>
              </div>

              {issue.description && (
                <div className="description-section">
                  <h5>Description:</h5>
                  <div className="description-content">
                    {issue.description}
                  </div>
                </div>
              )}

              {issue.acceptanceCriteria && issue.acceptanceCriteria.length > 0 && (
                <div className="acceptance-criteria">
                  <h5>Acceptance Criteria:</h5>
                  <ul>
                    {issue.acceptanceCriteria.map((criteria, index) => (
                      <li key={index}>{criteria}</li>
                    ))}
                  </ul>
                </div>
              )}

              {(issue.labels?.length > 0 || issue.components?.length > 0) && (
                <div className="tags-section">
                  {issue.labels?.length > 0 && (
                    <div className="labels">
                      <strong>Labels:</strong>
                      {issue.labels.map((label, index) => (
                        <span key={index} className="label-tag">{label}</span>
                      ))}
                    </div>
                  )}
                  {issue.components?.length > 0 && (
                    <div className="components">
                      <strong>Components:</strong>
                      {issue.components.map((component, index) => (
                        <span key={index} className="component-tag">{component}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {mcpTools.length > 0 && (
        <div className="mcp-tools">
          <h3>🔧 Available MCP Tools</h3>
          <div className="tools-grid">
            {mcpTools.map((tool, index) => (
              <div key={index} className="tool-item">
                <strong>{tool.name || `Tool ${index + 1}`}</strong>
                <p>{tool.description || 'No description available'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {testResults.length > 0 && (
        <div className="test-results">
          <h3>📊 Recent Test Results</h3>
          <div className="results-list">
            {testResults.map((result, index) => (
              <div key={index} className={`result-item ${result.success ? 'success' : 'error'}`}>
                <div className="result-header">
                  <span className="result-action">{result.action}</span>
                  <span className="result-time">{formatDate(result.timestamp)}</span>
                  <span className={`result-status ${result.success ? 'success' : 'error'}`}>
                    {result.success ? '✅' : '❌'}
                  </span>
                </div>
                {result.issueKey && (
                  <div className="result-issue">Issue: {result.issueKey}</div>
                )}
                {result.error && (
                  <div className="result-error">Error: {result.error}</div>
                )}
                {result.data && (
                  <details className="result-data">
                    <summary>View Data</summary>
                    <pre>{JSON.stringify(result.data, null, 2)}</pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MCPClient;
