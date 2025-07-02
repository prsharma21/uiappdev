const { spawn } = require('child_process');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Load environment variables from MCP server's .env file
function loadEnvFile() {
  const envPath = 'C:\\Priyanka\\projects\\mcp-server-atlassian-jira-main\\mcp-server-atlassian-jira-main\\.env';
  const envVars = {};
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    }
    console.log('🔧 Loaded environment variables from MCP server .env file');
    console.log('📋 Available credentials:', Object.keys(envVars).filter(k => k.includes('ATLASSIAN')));
  } else {
    console.warn('⚠️ MCP server .env file not found at:', envPath);
  }
  
  return envVars;
}

const mcpEnvVars = loadEnvFile();

const app = express();
app.use(cors());
app.use(express.json());

// MCP Server configuration - use compiled JS file
const MCP_SERVER_PATH = 'C:\\Priyanka\\projects\\mcp-server-atlassian-jira-main\\mcp-server-atlassian-jira-main\\dist\\index.js';

// Function to communicate with MCP server via stdio
async function callMCPServer(method, params = {}) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Calling MCP server method: ${method}`);
    console.log(`📋 Parameters:`, JSON.stringify(params, null, 2));
    
    // Use node to run the compiled JavaScript MCP server with environment variables
    const mcpProcess = spawn('node', [MCP_SERVER_PATH], {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
      cwd: path.dirname(MCP_SERVER_PATH),
      env: { ...process.env, ...mcpEnvVars }
    });

    let output = '';
    let errorOutput = '';

    // Create JSON-RPC request
    const request = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: method,
      params: params
    };

    console.log(`📤 Sending MCP request:`, JSON.stringify(request));

    // Send request to MCP server
    mcpProcess.stdin.write(JSON.stringify(request) + '\n');
    mcpProcess.stdin.end();

    // Collect stdout data
    mcpProcess.stdout.on('data', (data) => {
      output += data.toString();
      console.log(`📥 MCP stdout:`, data.toString().trim());
    });

    // Collect stderr data
    mcpProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.log(`⚠️ MCP stderr:`, data.toString().trim());
    });

    // Handle process completion
    mcpProcess.on('close', (code) => {
      console.log(`✅ MCP process exited with code: ${code}`);
      
      if (code === 0) {
        try {
          // Parse the JSON response
          const lines = output.split('\n').filter(line => line.trim());
          let response = null;
          
          // Find the JSON-RPC response
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.jsonrpc === '2.0' && (parsed.result !== undefined || parsed.error !== undefined)) {
                response = parsed;
                break;
              }
            } catch (e) {
              // Continue looking for valid JSON
            }
          }

          if (response) {
            if (response.error) {
              console.error(`❌ MCP Error:`, response.error);
              reject(new Error(`MCP Error: ${response.error.message || 'Unknown error'}`));
            } else {
              console.log(`✅ MCP Success:`, response.result);
              resolve(response.result);
            }
          } else {
            // If no JSON found, return raw output as fallback
            console.log(`⚠️ No JSON response found, returning raw output`);
            resolve({
              success: true,
              data: output,
              raw: true
            });
          }
        } catch (error) {
          console.error(`❌ Failed to parse MCP response:`, error.message);
          reject(new Error(`Failed to parse MCP response: ${error.message}\nOutput: ${output}`));
        }
      } else {
        console.error(`❌ MCP Server failed with code ${code}`);
        reject(new Error(`MCP Server process failed with code ${code}. Error: ${errorOutput || 'Unknown error'}`));
      }
    });

    // Handle process errors
    mcpProcess.on('error', (error) => {
      console.error(`❌ Failed to start MCP server:`, error.message);
      reject(new Error(`Failed to start MCP server: ${error.message}`));
    });

    // Set a timeout for the request (30 seconds)
    setTimeout(() => {
      mcpProcess.kill();
      reject(new Error('MCP server request timeout (30s)'));
    }, 30000);
  });
}

// API endpoint to fetch single JIRA issue
app.get('/api/jira/issue/:issueKey', async (req, res) => {
  try {
    const { issueKey } = req.params;
    console.log(`\n🎯 API Request: Fetch JIRA issue ${issueKey}`);

    // Call the MCP server to get issue description
    const result = await callMCPServer('tools/call', {
      name: 'jira_get_issue',
      arguments: {
        issueIdOrKey: issueKey
      }
    });

    console.log(`✅ Successfully fetched issue ${issueKey}`);
    res.json({
      success: true,
      issueKey: issueKey,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`❌ Error fetching issue ${req.params.issueKey}:`, error.message);
    res.status(500).json({ 
      success: false,
      error: error.message,
      issueKey: req.params.issueKey,
      timestamp: new Date().toISOString()
    });
  }
});

// API endpoint to fetch multiple JIRA issues
app.post('/api/jira/issues/bulk', async (req, res) => {
  try {
    const { issueKeys } = req.body;
    console.log(`\n🎯 API Request: Fetch multiple JIRA issues`, issueKeys);

    if (!Array.isArray(issueKeys)) {
      return res.status(400).json({
        success: false,
        error: 'issueKeys must be an array'
      });
    }

    // Fetch issues in parallel with error handling
    const results = await Promise.allSettled(
      issueKeys.map(async (issueKey) => {
        try {
          const result = await callMCPServer('tools/call', {
            name: 'jira_get_issue',
            arguments: { issueIdOrKey: issueKey }
          });
          return { issueKey, success: true, data: result };
        } catch (error) {
          return { issueKey, success: false, error: error.message };
        }
      })
    );

    const processedResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          issueKey: issueKeys[index],
          success: false,
          error: result.reason.message || 'Unknown error'
        };
      }
    });

    res.json({
      success: true,
      results: processedResults,
      total: issueKeys.length,
      successful: processedResults.filter(r => r.success).length,
      failed: processedResults.filter(r => !r.success).length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`❌ Error in bulk fetch:`, error.message);
    res.status(500).json({ 
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API endpoint to search JIRA issues
app.post('/api/jira/issues/search', async (req, res) => {
  try {
    const { jql, maxResults = 50 } = req.body;
    console.log(`\n🎯 API Request: Search JIRA issues with JQL: ${jql}`);

    const result = await callMCPServer('tools/call', {
      name: 'jira_ls_issues',
      arguments: {
        jql: jql,
        limit: maxResults
      }
    });

    res.json({
      success: true,
      data: result,
      query: jql,
      maxResults: maxResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`❌ Error searching issues:`, error.message);
    res.status(500).json({ 
      success: false,
      error: error.message,
      query: req.body.jql,
      timestamp: new Date().toISOString()
    });
  }
});

// API endpoint to generate component from JIRA issue
app.post('/api/jira/generate-component', async (req, res) => {
  try {
    const { issueKey, options = {} } = req.body;
    console.log(`\n🎯 API Request: Generate component from issue ${issueKey}`);

    // First fetch the issue data
    const issueData = await callMCPServer('tools/call', {
      name: 'jira_get_issue',
      arguments: {
        issueIdOrKey: issueKey
      }
    });

    // Then generate component code
    const componentCode = await callMCPServer('generate-react-component', {
      issueData: issueData,
      options: options
    });

    res.json({
      success: true,
      issueKey: issueKey,
      issueData: issueData,
      componentCode: componentCode,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`❌ Error generating component:`, error.message);
    res.status(500).json({ 
      success: false,
      error: error.message,
      issueKey: req.body.issueKey,
      timestamp: new Date().toISOString()
    });
  }
});

// API endpoint to update JIRA issue status
app.post('/api/jira/issue/:issueKey/status', async (req, res) => {
  try {
    const { issueKey } = req.params;
    const { status, comment } = req.body;
    console.log(`\n🔄 API Request: Update JIRA issue ${issueKey} status to: ${status}`);

    // Add comment to the issue about the status change
    if (comment) {
      await callMCPServer('tools/call', {
        name: 'jira_add_comment',
        arguments: {
          issueIdOrKey: issueKey,
          comment: comment
        }
      });
    }

    // For now, we'll just add a comment indicating the status change
    // since the MCP server might not have direct status transition capabilities
    const statusComment = `Status updated to: ${status}\n\nAutomated update from JIRA-driven development workflow:\n- Code changes implemented\n- Unit tests added\n- GitHub PR created`;
    
    const result = await callMCPServer('tools/call', {
      name: 'jira_add_comment',
      arguments: {
        issueIdOrKey: issueKey,
        commentBody: statusComment
      }
    });

    console.log(`✅ Successfully updated ${issueKey} with status comment`);
    res.json({
      success: true,
      issueKey: issueKey,
      status: status,
      comment: statusComment,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`❌ Error updating issue ${req.params.issueKey} status:`, error.message);
    res.status(500).json({ 
      success: false,
      error: error.message,
      issueKey: req.params.issueKey,
      timestamp: new Date().toISOString()
    });
  }
});

// API endpoint to add comment to JIRA issue
app.post('/api/jira/issue/:issueKey/add-comment', async (req, res) => {
  try {
    const { issueKey } = req.params;
    const { commentBody } = req.body;
    console.log(`\n💬 API Request: Add comment to JIRA issue ${issueKey}`);

    if (!commentBody) {
      return res.status(400).json({
        success: false,
        error: 'commentBody is required',
        issueKey: issueKey,
        timestamp: new Date().toISOString()
      });
    }

    const result = await callMCPServer('tools/call', {
      name: 'jira_add_comment',
      arguments: {
        issueIdOrKey: issueKey,
        commentBody: commentBody
      }
    });

    console.log(`✅ Successfully added comment to ${issueKey}`);
    res.json({
      success: true,
      issueKey: issueKey,
      comment: commentBody,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`❌ Error adding comment to issue ${req.params.issueKey}:`, error.message);
    res.status(500).json({ 
      success: false,
      error: error.message,
      issueKey: req.params.issueKey,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    console.log(`\n🏥 Health check requested`);
    
    // Test MCP server connectivity
    const mcpTest = await callMCPServer('ping', {}).catch(err => ({
      error: err.message,
      status: 'disconnected'
    }));

    const health = {
      status: 'MCP Proxy Server is running',
      mcpServer: mcpTest.error ? 'Disconnected' : 'Connected',
      mcpServerPath: MCP_SERVER_PATH,
      mcpTest: mcpTest,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '1.0.0'
    };

    if (mcpTest.error) {
      res.status(503).json(health);
    } else {
      res.json(health);
    }

  } catch (error) {
    console.error(`❌ Health check failed:`, error.message);
    res.status(503).json({
      status: 'MCP Proxy Server is running',
      mcpServer: 'Error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint for MCP server methods
app.post('/api/mcp/test', async (req, res) => {
  try {
    const { method, params = {} } = req.body;
    console.log(`\n🧪 MCP Test: ${method}`);

    const result = await callMCPServer(method, params);
    
    res.json({ 
      success: true, 
      method: method,
      params: params,
      result: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`❌ MCP test failed:`, error.message);
    res.status(500).json({ 
      success: false, 
      method: req.body.method,
      params: req.body.params,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get available MCP tools/methods
app.get('/api/mcp/tools', async (req, res) => {
  try {
    console.log(`\n🔧 Fetching available MCP tools`);
    
    const tools = await callMCPServer('tools/list', {});
    
    res.json({
      success: true,
      tools: tools,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`❌ Error fetching MCP tools:`, error.message);
    res.status(500).json({ 
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(`❌ Unhandled error:`, error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`\n🚀 MCP Proxy Server running on port ${PORT}`);
  console.log(`📡 MCP Server Path: ${MCP_SERVER_PATH}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test Endpoint: http://localhost:${PORT}/api/mcp/test`);
  console.log(`📋 Fetch Issue: http://localhost:${PORT}/api/jira/issue/{issueKey}`);
  console.log(`\n📋 Available Endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/jira/issue/:issueKey`);
  console.log(`   POST /api/jira/issues/bulk`);
  console.log(`   POST /api/jira/issues/search`);
  console.log(`   POST /api/jira/generate-component`);
  console.log(`   POST /api/mcp/test`);
  console.log(`   GET  /api/mcp/tools`);
  console.log(`\n✅ Server ready for JIRA-driven UI development!`);
});
