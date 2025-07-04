// JIRA Service for communicating with MCP server via backend proxy
class JiraService {
  constructor() {
    this.baseURL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3002/api';
    this.defaultTimeout = 30000; // 30 seconds
  }

  /**
   * Fetch a single JIRA issue by key
   * @param {string} issueKey - JIRA issue key (e.g., "MYP-1")
   * @returns {Promise<Object>} Issue data
   */
  async fetchJiraIssue(issueKey) {
    try {
      console.log(`🔍 Fetching JIRA issue: ${issueKey}`);
      
      const response = await fetch(`${this.baseURL}/jira/issue/${issueKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: this.defaultTimeout
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
      }

      console.log(`✅ Successfully fetched issue: ${issueKey}`);
      return this.formatIssueData(responseData.data, issueKey);

    } catch (error) {
      console.error(`❌ Error fetching issue ${issueKey}:`, error.message);
      throw new Error(`Failed to fetch issue ${issueKey}: ${error.message}`);
    }
  }

  /**
   * Fetch multiple JIRA issues in bulk
   * @param {string[]} issueKeys - Array of JIRA issue keys
   * @returns {Promise<Object[]>} Array of issue results
   */
  async fetchMultipleIssues(issueKeys) {
    try {
      console.log(`🔍 Fetching multiple JIRA issues:`, issueKeys);
      
      const response = await fetch(`${this.baseURL}/jira/issues/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ issueKeys }),
        timeout: this.defaultTimeout * 2 // Double timeout for bulk operations
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
      }

      console.log(`✅ Bulk fetch completed: ${responseData.successful}/${responseData.total} successful`);
      
      return responseData.results.map(result => ({
        ...result,
        data: result.success ? this.formatIssueData(result.data, result.issueKey) : null
      }));

    } catch (error) {
      console.error(`❌ Error in bulk fetch:`, error.message);
      throw new Error(`Failed to fetch multiple issues: ${error.message}`);
    }
  }

  /**
   * Search JIRA issues using JQL
   * @param {string} jql - JQL query string
   * @param {number} maxResults - Maximum number of results (default: 50)
   * @returns {Promise<Object[]>} Search results
   */
  async searchIssues(jql, maxResults = 50) {
    try {
      console.log(`🔍 Searching JIRA issues with JQL: ${jql}`);
      
      const response = await fetch(`${this.baseURL}/jira/issues/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jql, maxResults }),
        timeout: this.defaultTimeout
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
      }

      console.log(`✅ Search completed for JQL: ${jql}`);
      return responseData.data;

    } catch (error) {
      console.error(`❌ Error searching issues:`, error.message);
      throw new Error(`Failed to search issues: ${error.message}`);
    }
  }

  /**
   * Generate React component from JIRA issue
   * @param {string} issueKey - JIRA issue key
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated component code
   */
  async generateComponentFromIssue(issueKey, options = {}) {
    try {
      console.log(`🎨 Generating component from issue: ${issueKey}`);
      
      const response = await fetch(`${this.baseURL}/jira/generate-component`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ issueKey, options }),
        timeout: this.defaultTimeout * 2 // Component generation might take longer
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
      }

      console.log(`✅ Component generated for issue: ${issueKey}`);
      return responseData;

    } catch (error) {
      console.error(`❌ Error generating component:`, error.message);
      throw new Error(`Failed to generate component: ${error.message}`);
    }
  }

  /**
   * Format raw issue data from MCP server
   * @param {Object} rawData - Raw issue data from MCP
   * @param {string} issueKey - Issue key for fallback
   * @returns {Object} Formatted issue data
   */
  formatIssueData(rawData, issueKey) {
    // Handle different response formats from MCP server
    const fields = rawData.fields || rawData;
    
    return {
      key: rawData.key || issueKey,
      id: rawData.id,
      summary: rawData.summary || fields.summary || 'No summary available',
      description: rawData.description || fields.description || 'No description available',
      status: this.extractStatus(rawData),
      priority: this.extractPriority(rawData),
      issueType: this.extractIssueType(rawData),
      assignee: this.extractAssignee(rawData),
      reporter: this.extractReporter(rawData),
      created: rawData.created || fields.created,
      updated: rawData.updated || fields.updated,
      labels: rawData.labels || fields.labels || [],
      components: this.extractComponents(rawData),
      acceptanceCriteria: this.extractAcceptanceCriteria(rawData.description || fields.description),
      storyPoints: fields.customfield_10016 || rawData.storyPoints,
      epic: fields.epic || rawData.epic,
      project: this.extractProject(rawData),
      raw: rawData // Keep original data for debugging
    };
  }

  /**
   * Extract status from various possible formats
   */
  extractStatus(data) {
    return data.status || 
           data.fields?.status?.name || 
           data.fields?.status || 
           'Unknown';
  }

  /**
   * Extract priority from various possible formats
   */
  extractPriority(data) {
    return data.priority || 
           data.fields?.priority?.name || 
           data.fields?.priority || 
           'Unknown';
  }

  /**
   * Extract issue type from various possible formats
   */
  extractIssueType(data) {
    return data.issueType || 
           data.fields?.issuetype?.name || 
           data.fields?.issuetype || 
           'Unknown';
  }

  /**
   * Extract assignee from various possible formats
   */
  extractAssignee(data) {
    return data.assignee || 
           data.fields?.assignee?.displayName || 
           data.fields?.assignee?.name || 
           'Unassigned';
  }

  /**
   * Extract reporter from various possible formats
   */
  extractReporter(data) {
    return data.reporter || 
           data.fields?.reporter?.displayName || 
           data.fields?.reporter?.name || 
           'Unknown';
  }

  /**
   * Extract components from various possible formats
   */
  extractComponents(data) {
    const components = data.components || data.fields?.components || [];
    if (Array.isArray(components)) {
      return components.map(comp => comp.name || comp);
    }
    return [];
  }

  /**
   * Extract project information
   */
  extractProject(data) {
    const project = data.project || data.fields?.project;
    if (project) {
      return {
        key: project.key,
        name: project.name || project.key
      };
    }
    return null;
  }

  /**
   * Extract acceptance criteria from description
   * @param {string} description - Issue description
   * @returns {string[]} Array of acceptance criteria
   */
  extractAcceptanceCriteria(description) {
    if (!description) return [];
    
    // Look for various acceptance criteria patterns
    const patterns = [
      /(?:acceptance criteria|ac):?\s*(.*?)(?:\n\n|\n$|$)/is,
      /(?:given|when|then):?\s*(.*?)(?:\n\n|\n$|$)/is,
      /(?:criteria|requirements):?\s*(.*?)(?:\n\n|\n$|$)/is
    ];

    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match) {
        return match[1]
          .split(/\n|•|-|\*/)
          .map(item => item.trim())
          .filter(item => item.length > 0);
      }
    }
    
    return [];
  }

  /**
   * Check server health
   * @returns {Promise<Object>} Health status
   */
  async checkServerHealth() {
    try {
      console.log(`🏥 Checking server health...`);
      
      const response = await fetch(`${this.baseURL}/health`, {
        timeout: 10000 // 10 second timeout for health checks
      });
      
      const health = await response.json();
      console.log(`✅ Health check completed:`, health.status);
      
      return {
        ...health,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`❌ Health check failed:`, error.message);
      return { 
        status: 'Error', 
        error: error.message, 
        timestamp: new Date().toISOString() 
      };
    }
  }

  /**
   * Test MCP server with custom method
   * @param {string} method - MCP method name
   * @param {Object} params - Method parameters
   * @returns {Promise<Object>} Test result
   */
  async testMCPMethod(method, params = {}) {
    try {
      console.log(`🧪 Testing MCP method: ${method}`);
      
      const response = await fetch(`${this.baseURL}/mcp/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ method, params }),
        timeout: this.defaultTimeout
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      console.log(`✅ MCP test completed for method: ${method}`);
      return result;

    } catch (error) {
      console.error(`❌ MCP test failed:`, error.message);
      throw new Error(`MCP test failed: ${error.message}`);
    }
  }

  /**
   * Get available MCP tools
   * @returns {Promise<Object[]>} Available tools
   */
  async getMCPTools() {
    try {
      console.log(`🔧 Fetching available MCP tools...`);
      
      const response = await fetch(`${this.baseURL}/mcp/tools`, {
        timeout: 10000
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      console.log(`✅ MCP tools fetched`);
      return result.tools || [];

    } catch (error) {
      console.error(`❌ Error fetching MCP tools:`, error.message);
      return [];
    }
  }

  /**
   * Helper method to get common JQL queries
   */
  getCommonQueries() {
    return {
      myAssigned: 'assignee = currentUser() ORDER BY priority DESC, updated DESC',
      myReported: 'reporter = currentUser() ORDER BY created DESC',
      recentlyUpdated: 'updated >= -7d ORDER BY updated DESC',
      highPriority: 'priority = High ORDER BY created DESC',
      inProgress: 'status = "In Progress" ORDER BY updated DESC',
      uiIssues: 'summary ~ "[UI]" ORDER BY created DESC',
      readyForDev: 'status = "Ready for Development" ORDER BY priority DESC'
    };
  }

  /**
   * Quick access methods for common operations
   */
  async getMyAssignedIssues() {
    return this.searchIssues(this.getCommonQueries().myAssigned);
  }

  async getUIIssues() {
    return this.searchIssues(this.getCommonQueries().uiIssues);
  }

  async getHighPriorityIssues() {
    return this.searchIssues(this.getCommonQueries().highPriority);
  }
}

// Export singleton instance
export default new JiraService();
