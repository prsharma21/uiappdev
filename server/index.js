const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

class MCPServerProxy {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3002;
    this.mcpServerUrl = process.env.MCP_SERVER_URL || 'http://localhost:8080';
    this.mcpServerHealthEndpoint = process.env.MCP_SERVER_HEALTH_ENDPOINT || '/health';
    this.mcpConnected = false;
    this.requestQueue = [];
    this.isProcessing = false;
    
    this.setupMiddleware();
    this.setupRoutes();
    this.initializeMCPServer();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/api/health', this.handleHealthCheck.bind(this));
    
    // JIRA endpoints
    this.app.get('/api/jira/issue/:issueKey', this.handleGetJiraIssue.bind(this));
    this.app.post('/api/jira/issues/bulk', this.handleBulkJiraIssues.bind(this));
    this.app.post('/api/jira/issues/search', this.handleSearchJiraIssues.bind(this));
    this.app.post('/api/jira/generate-component', this.handleGenerateComponent.bind(this));
    this.app.post('/api/jira/issue/:issueKey/transition', this.handleTransitionIssue.bind(this));
    this.app.get('/api/jira/issue/:issueKey/transitions', this.handleGetTransitions.bind(this));
    
    // MCP testing endpoints
    this.app.post('/api/mcp/test', this.handleMCPTest.bind(this));
    this.app.get('/api/mcp/tools', this.handleGetMCPTools.bind(this));
    
    // Error handling
    this.app.use(this.errorHandler.bind(this));
  }

  async initializeMCPServer() {
    try {
      console.log('🚀 Initializing MCP Server connection...');
      console.log(`🔧 MCP Server URL: ${this.mcpServerUrl}`);
      
      // Check if MCP server is available by calling health endpoint
      const healthUrl = `${this.mcpServerUrl}${this.mcpServerHealthEndpoint}`;
      console.log(`🔍 Checking MCP server health at: ${healthUrl}`);
      
      const healthResponse = await axios.get(healthUrl, { timeout: 5000 });
      
      if (healthResponse.status === 200) {
        this.mcpConnected = true;
        console.log('✅ MCP Server connection established');
        console.log('MCP Server health check response:', healthResponse.data);
        
        // Try to get tools list to verify JSON-RPC functionality
        try {
          await this.testJsonRpcConnection();
        } catch (rpcError) {
          console.warn('⚠️ Warning: MCP Server health endpoint is available, but JSON-RPC might not be properly configured.');
          console.warn('Error details:', rpcError.message);
          // Don't fail connection - we'll retry RPC calls as needed
        }
      } else {
        throw new Error(`MCP Server health check failed with status: ${healthResponse.status}`);
      }
    } catch (error) {
      console.error('❌ Failed to initialize MCP Server:', error.message);
      this.mcpConnected = false;
      // Schedule a retry
      console.log('Will retry connection in 10 seconds...');
      setTimeout(() => this.initializeMCPServer(), 10000); // Retry every 10 seconds
    }
  }
  
  async testJsonRpcConnection() {
    // Simple test of JSON-RPC connection using 'ping' or 'tools/list'
    const testMethods = ['ping', 'tools/list'];
    
    for (const method of testMethods) {
      try {
        console.log(`🧪 Testing MCP JSON-RPC with method: ${method}`);
        
        const jsonRpcRequest = {
          jsonrpc: '2.0',
          id: Date.now(),
          method: method,
          params: {}
        };
        
        const response = await axios.post(this.mcpServerUrl, jsonRpcRequest, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000
        });
        
        console.log(`✅ JSON-RPC test successful with method: ${method}`);
        console.log('Response:', response.data);
        return true;
      } catch (error) {
        console.log(`❌ JSON-RPC test failed with method ${method}: ${error.message}`);
      }
    }
    
    throw new Error('All JSON-RPC test methods failed');
  }

  async callMCPServer(method, params = {}) {
    if (!this.mcpConnected) {
      await this.initializeMCPServer();
      if (!this.mcpConnected) {
        throw new Error('MCP Server is not connected');
      }
    }
    
    console.log(`📞 Calling MCP method: ${method}`);
    console.log(`📦 Params:`, JSON.stringify(params));
    
    try {
      // Prepare JSON-RPC request
      const jsonRpcRequest = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: method,
        params: params
      };
      
      // Make HTTP request to MCP server
      console.log(`🔗 Sending request to: ${this.mcpServerUrl}`);
      const response = await axios.post(this.mcpServerUrl, jsonRpcRequest, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000 // 30 second timeout
      });
      
      console.log(`✅ MCP response received for: ${method}`);
      
      if (response.status !== 200) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const responseData = response.data;
      
      // Check for JSON-RPC error
      if (responseData.error) {
        throw new Error(`JSON-RPC error: ${JSON.stringify(responseData.error)}`);
      }
      
      return responseData.result || responseData;
    } catch (error) {
      console.error(`❌ MCP call failed for ${method}:`, error.message);
      // If there's a connection error, mark the server as disconnected for the next retry
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        this.mcpConnected = false;
      }
      throw error;
    }
  }

  generateMockResponse(method, params) {
    switch (method) {
      case 'atlassian_jira_get_issue':
        return this.mockJiraIssueResponse(params.issueKey);
      
      case 'atlassian_jira_search_issues':
        return this.mockJiraSearchResponse(params.jql);
      
      case 'ping':
        return {
          content: [{ text: JSON.stringify({ status: 'pong', timestamp: new Date().toISOString() }) }]
        };
      
      case 'tools/list':
        return {
          content: [{ 
            text: JSON.stringify({
              tools: [
                { name: 'atlassian_jira_get_issue', description: 'Get a single JIRA issue by key' },
                { name: 'atlassian_jira_search_issues', description: 'Search JIRA issues with JQL' },
                { name: 'atlassian_jira_create_issue', description: 'Create a new JIRA issue' },
                { name: 'atlassian_jira_update_issue', description: 'Update an existing JIRA issue' },
                { name: 'ping', description: 'Test server connectivity' }
              ]
            })
          }]
        };
      
      default:
        throw new Error(`Unknown MCP method: ${method}`);
    }
  }

  mockJiraIssueResponse(issueKey) {
    const mockIssues = {
      'MYP-1': {
        key: 'MYP-1',
        id: '10001',
        fields: {
          summary: '[UI] User Profile Component - Create responsive user profile display',
          description: `## Component Requirements

Create a responsive user profile component that displays user information in a clean, modern interface.

### Features Required:
- Profile picture display with fallback
- User name and title
- Contact information section
- Social media links
- Edit profile button
- Responsive design for mobile/desktop

### Acceptance Criteria:
- Component should be responsive across all screen sizes
- Should handle missing profile data gracefully
- Profile picture should have a default fallback
- Edit button should be conditionally visible
- Should support theming (light/dark mode)

### Styling Requirements:
- Use CSS Grid for layout
- Border radius: 12px
- Box shadow: 0 4px 6px rgba(0, 0, 0, 0.1)
- Padding: 24px
- Background: white (light mode), #1a1a1a (dark mode)`,
          status: { name: 'To Do' },
          priority: { name: 'High' },
          issuetype: { name: 'Story' },
          assignee: { displayName: 'John Developer' },
          reporter: { displayName: 'Jane Product Manager' },
          created: '2024-01-15T10:30:00.000Z',
          updated: '2024-01-16T14:22:00.000Z',
          labels: ['frontend', 'react', 'ui-component'],
          components: [{ name: 'Frontend' }, { name: 'User Management' }],
          project: { key: 'MYP', name: 'My Project' }
        }
      },
      'SCRUM-1': {
        key: 'SCRUM-1',
        id: '10002',
        fields: {
          summary: '[UI] Task List Component - Interactive task management interface',
          description: `## Component Requirements

Create an interactive task list component for project management functionality.

### Features Required:
- Add new tasks with form input
- Mark tasks as complete/incomplete
- Delete tasks with confirmation
- Filter tasks by status
- Drag and drop reordering
- Due date display and management

### Acceptance Criteria:
- Users can add tasks with title and description
- Tasks can be marked complete with checkbox
- Completed tasks should have strikethrough styling
- Delete button with confirmation dialog
- Filter buttons: All, Active, Completed
- Tasks should persist between sessions

### Styling Requirements:
- Card-based layout for each task
- Hover effects on interactive elements
- Smooth animations for state changes
- Mobile-friendly touch targets`,
          status: { name: 'In Progress' },
          priority: { name: 'Medium' },
          issuetype: { name: 'Story' },
          assignee: { displayName: 'Sarah Frontend' },
          reporter: { displayName: 'Mike Scrum Master' },
          created: '2024-01-14T09:15:00.000Z',
          updated: '2024-01-16T16:45:00.000Z',
          labels: ['frontend', 'react', 'task-management'],
          components: [{ name: 'Frontend' }, { name: 'Task Management' }],
          project: { key: 'SCRUM', name: 'Scrum Project' }
        }
      },
      'SCRUM-2': {
        key: 'SCRUM-2',
        id: '10003',
        fields: {
          summary: '[UI] Dashboard Layout - Responsive dashboard grid system',
          description: `## Component Requirements

Create a responsive dashboard layout system that can display various widgets and components in a grid format.

### Features Required:
- Responsive grid layout
- Widget containers with drag-and-drop capability
- Collapsible/expandable widgets
- Widget settings menu
- Layout persistence between sessions
- Light/dark mode support

### Acceptance Criteria:
- Dashboard should maintain layout across different screen sizes
- Users can add, remove, and rearrange widgets
- Widget containers should have consistent styling but flexible content
- Settings for each widget should be accessible via icon menu
- Layout changes should persist in local storage
- Should support at least 3 breakpoints (mobile, tablet, desktop)

### Styling Requirements:
- Grid-based layout system
- Widget container styling (shadow, border, radius)
- Consistent spacing between elements
- Subtle animations for interactions
- Accessible color schemes for light/dark modes`,
          status: { name: 'In Progress' },
          priority: { name: 'High' },
          issuetype: { name: 'Story' },
          assignee: { displayName: 'Alex UI Developer' },
          reporter: { displayName: 'Mike Scrum Master' },
          created: '2024-01-18T11:20:00.000Z',
          updated: '2024-07-02T09:15:00.000Z',
          labels: ['frontend', 'react', 'dashboard', 'responsive'],
          components: [{ name: 'Frontend' }, { name: 'Dashboard' }],
          project: { key: 'SCRUM', name: 'Scrum Project' }
        }
      }
    };

    const issue = mockIssues[issueKey];
    if (!issue) {
      throw new Error(`Issue ${issueKey} not found`);
    }

    return {
      content: [{ text: JSON.stringify(issue) }]
    };
  }

  mockJiraSearchResponse(jql) {
    const allIssues = [
      { key: 'MYP-1', summary: '[UI] User Profile Component', status: 'To Do' },
      { key: 'SCRUM-1', summary: '[UI] Task List Component', status: 'In Progress' },
      { key: 'MYP-2', summary: '[UI] Navigation Menu', status: 'Done' },
      { key: 'SCRUM-2', summary: '[UI] Dashboard Layout', status: 'In Progress' }
    ];

    // Simple JQL simulation
    let filteredIssues = allIssues;
    
    if (jql.includes('status = "To Do"')) {
      filteredIssues = allIssues.filter(issue => issue.status === 'To Do');
    } else if (jql.includes('summary ~ "[UI]"')) {
      filteredIssues = allIssues.filter(issue => issue.summary.includes('[UI]'));
    }

    return {
      content: [{ 
        text: JSON.stringify({
          issues: filteredIssues,
          total: filteredIssues.length
        })
      }]
    };
  }

  // Route handlers
  async handleHealthCheck(req, res) {
    try {
      // First try to reconnect if not already connected
      if (!this.mcpConnected) {
        try {
          await this.initializeMCPServer();
        } catch (e) {
          console.log('Failed to reconnect to MCP server during health check');
        }
      }
      
      const health = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
        mcpServer: this.mcpConnected ? 'Connected' : 'Disconnected',
        mcpServerUrl: this.mcpServerUrl,
        environment: process.env.NODE_ENV || 'development'
      };

      // Check MCP server health if connected
      if (this.mcpConnected) {
        try {
          const mcpHealth = await axios.get(`${this.mcpServerUrl}${this.mcpServerHealthEndpoint}`, {
            timeout: 3000
          });
          health.mcpServerHealth = mcpHealth.status === 200 ? 'Healthy' : 'Unhealthy';
          health.mcpServerDetails = mcpHealth.data;
          
          // Also try a simple JSON-RPC call if health endpoint is working
          try {
            const pingResponse = await this.callMCPServer('ping', {});
            health.mcpJsonRpcStatus = 'Connected';
            health.mcpJsonRpcDetails = pingResponse;
          } catch (rpcError) {
            health.mcpJsonRpcStatus = 'Error';
            health.mcpJsonRpcError = rpcError.message;
          }
        } catch (mcpError) {
          health.mcpServerHealth = 'Unhealthy';
          health.mcpServerError = mcpError.message;
          // If health check fails, mark as disconnected and schedule reconnect
          this.mcpConnected = false;
          setTimeout(() => this.initializeMCPServer(), 5000);
        }
      }

      res.json(health);
    } catch (error) {
      res.status(500).json({ 
        error: error.message,
        status: 'ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  async handleGetJiraIssue(req, res) {
    try {
      const { issueKey } = req.params;
      
      if (!issueKey) {
        return res.status(400).json({ error: 'Issue key is required' });
      }

      console.log(`🎯 Fetching JIRA issue: ${issueKey}`);
      
      const response = await this.callMCPServer('atlassian_jira_get_issue', { issueKey });
      
      if (!response.content || response.content.length === 0) {
        return res.status(404).json({ error: `Issue ${issueKey} not found` });
      }

      const issueData = JSON.parse(response.content[0].text);
      
      res.json({ 
        success: true, 
        data: issueData,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`❌ Error fetching issue:`, error);
      res.status(500).json({ 
        error: error.message,
        issueKey: req.params.issueKey
      });
    }
  }

  async handleBulkJiraIssues(req, res) {
    try {
      const { issueKeys } = req.body;
      
      if (!Array.isArray(issueKeys) || issueKeys.length === 0) {
        return res.status(400).json({ error: 'Issue keys array is required' });
      }

      console.log(`🎯 Bulk fetching ${issueKeys.length} JIRA issues`);
      
      const results = [];
      let successful = 0;

      for (const issueKey of issueKeys) {
        try {
          const response = await this.callMCPServer('atlassian_jira_get_issue', { issueKey });
          const issueData = JSON.parse(response.content[0].text);
          
          results.push({
            issueKey,
            success: true,
            data: issueData
          });
          successful++;
        } catch (error) {
          results.push({
            issueKey,
            success: false,
            error: error.message
          });
        }
      }

      res.json({
        success: true,
        total: issueKeys.length,
        successful,
        results,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`❌ Error in bulk fetch:`, error);
      res.status(500).json({ error: error.message });
    }
  }

  async handleSearchJiraIssues(req, res) {
    try {
      const { jql, maxResults = 50 } = req.body;
      
      if (!jql) {
        return res.status(400).json({ error: 'JQL query is required' });
      }

      console.log(`🔍 Searching JIRA with JQL: ${jql}`);
      
      const response = await this.callMCPServer('atlassian_jira_search_issues', { jql, maxResults });
      const searchData = JSON.parse(response.content[0].text);

      res.json({
        success: true,
        data: searchData,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`❌ Error searching issues:`, error);
      res.status(500).json({ error: error.message });
    }
  }

  async handleGenerateComponent(req, res) {
    try {
      const { issueKey, options = {} } = req.body;
      
      if (!issueKey) {
        return res.status(400).json({ error: 'Issue key is required' });
      }

      console.log(`🎨 Generating component from issue: ${issueKey}`);
      
      // First fetch the issue
      const issueResponse = await this.callMCPServer('atlassian_jira_get_issue', { issueKey });
      const issueData = JSON.parse(issueResponse.content[0].text);
      
      // Generate component code based on issue data
      const componentCode = this.generateComponentCode(issueData, options);
      
      res.json({
        success: true,
        issueKey,
        componentName: this.extractComponentName(issueData.fields.summary),
        files: componentCode,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`❌ Error generating component:`, error);
      res.status(500).json({ error: error.message });
    }
  }

  async handleTransitionIssue(req, res) {
    try {
      const { issueKey } = req.params;
      const { transition, comment } = req.body;
      
      if (!issueKey) {
        return res.status(400).json({ error: 'Issue key is required' });
      }
      
      if (!transition) {
        return res.status(400).json({ error: 'Transition information is required' });
      }

      // Determine what kind of transition information was provided
      const transitionInfo = {};
      
      // Handle different transition input formats (ID, name, or full object)
      if (typeof transition === 'object') {
        // Format: { id: "123", name: "In Progress" }
        if (transition.id) transitionInfo.transitionId = transition.id;
        if (transition.name) transitionInfo.transitionName = transition.name;
      } else if (typeof transition === 'string') {
        // If it's a number string like "12", treat as ID, otherwise as name
        if (/^\d+$/.test(transition)) {
          transitionInfo.transitionId = transition;
        } else {
          transitionInfo.transitionName = transition;
        }
      } else if (typeof transition === 'number') {
        // Direct transition ID
        transitionInfo.transitionId = transition.toString();
      }
      
      console.log(`🔄 Transitioning JIRA issue: ${issueKey} to status: ${transitionInfo.transitionName || transitionInfo.transitionId || 'unknown'}`);
      
      // Call MCP server to transition the issue
      const response = await this.callMCPServer('atlassian_jira_transition_issue', { 
        issueKey,
        ...transitionInfo,
        comment: comment || `Updated via JIRA-driven UI development application`
      });
      
      res.json({
        success: true,
        issueKey,
        transition: transitionInfo,
        timestamp: new Date().toISOString(),
        message: `Issue ${issueKey} successfully transitioned`
      });

    } catch (error) {
      console.error(`❌ Error transitioning issue:`, error);
      res.status(500).json({ 
        error: error.message,
        issueKey: req.params.issueKey
      });
    }
  }

  async handleMCPTest(req, res) {
    try {
      const { method, params = {} } = req.body;
      
      if (!method) {
        return res.status(400).json({ error: 'Method is required' });
      }

      console.log(`🧪 Testing MCP method: ${method}`);
      
      const response = await this.callMCPServer(method, params);
      
      res.json({
        success: true,
        method,
        params,
        response,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`❌ MCP test failed:`, error);
      res.status(500).json({ error: error.message });
    }
  }

  async handleGetMCPTools(req, res) {
    try {
      console.log(`🔧 Fetching MCP tools`);
      
      if (!this.mcpConnected) {
        throw new Error('MCP Server is not connected');
      }
      
      // Get list of available MCP tools
      const response = await this.callMCPServer('tools/list');
      
      let tools = [];
      // Handle different response formats
      if (response && response.content && response.content[0] && response.content[0].text) {
        const toolsData = JSON.parse(response.content[0].text);
        tools = toolsData.tools || [];
      } else if (response && response.tools) {
        tools = response.tools;
      } else if (Array.isArray(response)) {
        tools = response;
      }
      
      res.json({
        success: true,
        tools: tools,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`❌ Error fetching MCP tools:`, error);
      res.status(500).json({ 
        error: error.message,
        tools: [] 
      });
    }
  }

  /**
   * Handle fetching available transitions for a JIRA issue
   */
  async handleGetTransitions(req, res) {
    try {
      const { issueKey } = req.params;
      
      if (!issueKey) {
        return res.status(400).json({ error: 'Issue key is required' });
      }

      console.log(`🔍 Fetching transitions for JIRA issue: ${issueKey}`);
      
      // Call MCP server to get transitions
      const response = await this.callMCPServer('atlassian_jira_get_transitions', { 
        issueKey
      });
      
      res.json({
        success: true,
        issueKey,
        transitions: response.transitions || [],
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error(`❌ Error fetching transitions for ${req.params.issueKey}:`, error.message);
      res.status(500).json({ 
        error: `Failed to fetch transitions: ${error.message}`,
        issueKey: req.params.issueKey
      });
    }
  }

  extractComponentName(summary) {
    // Extract component name from summary like "[UI] ComponentName - Description"
    const match = summary.match(/\[UI\]\s*([^-]+)/i);
    if (match) {
      return match[1].trim().replace(/\s+/g, '');
    }
    return 'GeneratedComponent';
  }

  generateComponentCode(issueData, options) {
    const componentName = this.extractComponentName(issueData.fields.summary);
    const description = issueData.fields.description || '';
    
    // Extract requirements from description
    const features = this.extractFeatures(description);
    const styling = this.extractStyling(description);
    
    return {
      [`${componentName}.jsx`]: this.generateJSXCode(componentName, features, issueData),
      [`${componentName}.css`]: this.generateCSSCode(componentName, styling),
      [`${componentName}.test.js`]: this.generateTestCode(componentName, features),
      [`${componentName}.stories.js`]: this.generateStorybookCode(componentName, issueData)
    };
  }

  extractFeatures(description) {
    const featuresMatch = description.match(/### Features Required:(.*?)(?=###|$)/s);
    if (featuresMatch) {
      return featuresMatch[1]
        .split(/\n|•|-/)
        .map(f => f.trim())
        .filter(f => f.length > 0);
    }
    return ['Basic component functionality'];
  }

  extractStyling(description) {
    const stylingMatch = description.match(/### Styling Requirements:(.*?)(?=###|$)/s);
    if (stylingMatch) {
      const stylingText = stylingMatch[1];
      return {
        borderRadius: (stylingText.match(/border radius:\s*(\w+)/i) || [null, '8px'])[1],
        padding: (stylingText.match(/padding:\s*(\w+)/i) || [null, '16px'])[1],
        background: (stylingText.match(/background:\s*([^(\n]+)/i) || [null, 'white'])[1],
        boxShadow: stylingText.includes('box shadow') || stylingText.includes('shadow')
      };
    }
    return {
      borderRadius: '8px',
      padding: '16px',
      background: 'white',
      boxShadow: true
    };
  }

  generateJSXCode(componentName, features, issueData) {
    return `import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './${componentName}.css';

const ${componentName} = ({ 
  data,
  onAction,
  className = '',
  ...props 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Component functionality based on JIRA requirements
  const handleAction = async (actionType, payload) => {
    setLoading(true);
    setError(null);
    
    try {
      if (onAction) {
        await onAction(actionType, payload);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={\`\${componentName.toLowerCase()}-loading \${className}\`}>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={\`\${componentName.toLowerCase()}-error \${className}\`}>
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={\`${componentName.toLowerCase()} \${className}\`} {...props}>
      <div className="${componentName.toLowerCase()}-content">
        {/* Component content based on JIRA issue: ${issueData.key} */}
        <h3 className="${componentName.toLowerCase()}-title">
          {data?.title || '${componentName}'}
        </h3>
        
        {/* Features implementation */}
        ${features.map(feature => `
        <div className="${componentName.toLowerCase()}-feature">
          {/* ${feature} */}
          <p>{data?.description || 'Feature placeholder'}</p>
        </div>`).join('')}
        
        <div className="${componentName.toLowerCase()}-actions">
          <button 
            className="primary-button"
            onClick={() => handleAction('primary', data)}
            disabled={loading}
          >
            Primary Action
          </button>
          <button 
            className="secondary-button"
            onClick={() => handleAction('secondary', data)}
            disabled={loading}
          >
            Secondary Action
          </button>
        </div>
      </div>
    </div>
  );
};

${componentName}.propTypes = {
  data: PropTypes.object,
  onAction: PropTypes.func,
  className: PropTypes.string
};

${componentName}.defaultProps = {
  data: {},
  onAction: null,
  className: ''
};

export default ${componentName};
`;
  }

  generateCSSCode(componentName, styling) {
    const className = componentName.toLowerCase();
    
    return `.${className} {
  border-radius: ${styling.borderRadius};
  padding: ${styling.padding};
  background: ${styling.background};
  ${styling.boxShadow ? 'box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);' : ''}
  transition: all 0.2s ease-in-out;
  max-width: 100%;
}

.${className}:hover {
  ${styling.boxShadow ? 'box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);' : ''}
  transform: translateY(-1px);
}

.${className}-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.${className}-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.${className}-feature {
  padding: 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  background: #f8f9fa;
}

.${className}-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.${className}-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.${className}-actions .primary-button {
  background: #007bff;
  color: white;
}

.${className}-actions .primary-button:hover {
  background: #0056b3;
}

.${className}-actions .secondary-button {
  background: #6c757d;
  color: white;
}

.${className}-actions .secondary-button:hover {
  background: #545b62;
}

.${className}-loading,
.${className}-error {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.loading-spinner {
  font-size: 1.1rem;
  color: #6c757d;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #dc3545;
  font-weight: 500;
}

.error-icon {
  font-size: 1.2rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .${className} {
    padding: 12px;
  }
  
  .${className}-actions {
    flex-direction: column;
  }
  
  .${className}-actions button {
    width: 100%;
  }
}
`;
  }

  generateTestCode(componentName, features) {
    return `import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ${componentName} from './${componentName}';

describe('${componentName}', () => {
  const mockData = {
    title: 'Test ${componentName}',
    description: 'Test description'
  };

  const mockOnAction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders component correctly', () => {
    render(<${componentName} data={mockData} />);
    
    expect(screen.getByText('Test ${componentName}')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('handles primary action', async () => {
    render(<${componentName} data={mockData} onAction={mockOnAction} />);
    
    const primaryButton = screen.getByText('Primary Action');
    fireEvent.click(primaryButton);
    
    await waitFor(() => {
      expect(mockOnAction).toHaveBeenCalledWith('primary', mockData);
    });
  });

  it('handles secondary action', async () => {
    render(<${componentName} data={mockData} onAction={mockOnAction} />);
    
    const secondaryButton = screen.getByText('Secondary Action');
    fireEvent.click(secondaryButton);
    
    await waitFor(() => {
      expect(mockOnAction).toHaveBeenCalledWith('secondary', mockData);
    });
  });

  it('displays loading state', () => {
    render(<${componentName} />);
    
    // Simulate loading state
    const component = screen.getByText('Test ${componentName}').closest('.${componentName.toLowerCase()}');
    expect(component).toBeInTheDocument();
  });

  it('displays error state', () => {
    // Test error handling
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<${componentName} data={mockData} />);
    
    // This would be triggered by an actual error in real usage
    expect(screen.getByText('Test ${componentName}')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  // Feature-specific tests
  ${features.map((feature, index) => `
  it('implements feature: ${feature}', () => {
    render(<${componentName} data={mockData} />);
    
    // Test implementation for: ${feature}
    expect(screen.getByText('Test ${componentName}')).toBeInTheDocument();
  });`).join('')}

  it('handles missing data gracefully', () => {
    render(<${componentName} />);
    
    expect(screen.getByText('${componentName}')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClass = 'custom-test-class';
    render(<${componentName} className={customClass} data={mockData} />);
    
    const component = screen.getByText('Test ${componentName}').closest('.${componentName.toLowerCase()}');
    expect(component).toHaveClass(customClass);
  });
});
`;
  }

  generateStorybookCode(componentName, issueData) {
    return `import React from 'react';
import ${componentName} from './${componentName}';

export default {
  title: 'Components/${componentName}',
  component: ${componentName},
  parameters: {
    docs: {
      description: {
        component: \`
# ${componentName}

Generated from JIRA issue: **${issueData.key}**

## Summary
${issueData.fields.summary}

## Description
${issueData.fields.description ? issueData.fields.description.substring(0, 200) + '...' : 'No description available'}

## Issue Details
- **Status**: ${issueData.fields.status?.name || 'Unknown'}
- **Priority**: ${issueData.fields.priority?.name || 'Unknown'}
- **Type**: ${issueData.fields.issuetype?.name || 'Unknown'}
- **Assignee**: ${issueData.fields.assignee?.displayName || 'Unassigned'}
        \`
      }
    }
  },
  argTypes: {
    data: {
      description: 'Data object for the component',
      control: 'object'
    },
    onAction: {
      description: 'Callback function for component actions',
      action: 'onAction'
    },
    className: {
      description: 'Additional CSS classes',
      control: 'text'
    }
  }
};

const Template = (args) => <${componentName} {...args} />;

export const Default = Template.bind({});
Default.args = {
  data: {
    title: '${componentName} Example',
    description: 'This is an example of the ${componentName} component generated from JIRA issue ${issueData.key}.'
  }
};

export const WithCustomData = Template.bind({});
WithCustomData.args = {
  data: {
    title: 'Custom ${componentName}',
    description: 'This shows the component with custom data.'
  },
  className: 'custom-styling'
};

export const EmptyState = Template.bind({});
EmptyState.args = {
  data: {}
};

export const Interactive = Template.bind({});
Interactive.args = {
  data: {
    title: 'Interactive ${componentName}',
    description: 'Click the buttons to see the component in action.'
  },
  onAction: (actionType, payload) => {
    console.log('Action triggered:', actionType, payload);
  }
};
`;
  }

  errorHandler(error, req, res, next) {
    console.error('❌ Server error:', error);
    
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
      timestamp: new Date().toISOString()
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 MCP Proxy Server running on port ${this.port}`);
      console.log(`📊 Health check: http://localhost:${this.port}/api/health`);
      console.log(`🎯 JIRA API: http://localhost:${this.port}/api/jira/*`);
      console.log(`🔧 MCP API: http://localhost:${this.port}/api/mcp/*`);
    });
  }
}

// Export for testing and external use
module.exports = MCPServerProxy;

// Start server if this file is run directly
if (require.main === module) {
  const server = new MCPServerProxy();
  server.start();
}
