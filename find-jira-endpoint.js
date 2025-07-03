// Find the correct endpoint for calling JIRA tools
const http = require('http');

async function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve) => {
    console.log(`🔍 Testing: ${method} ${path}`);
    
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(responseData);
            console.log(`   ✅ Success! Response type: ${Array.isArray(parsed) ? 'Array' : typeof parsed}`);
            resolve({ success: true, data: parsed, path: path, method: method });
            return;
          } catch (e) {
            console.log(`   📄 Success but not JSON`);
          }
        } else {
          console.log(`   ❌ Error: ${responseData.substring(0, 50)}...`);
        }
        resolve({ success: false });
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ Connection error: ${error.message}`);
      resolve({ success: false });
    });

    req.setTimeout(3000);
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function findJiraEndpoint() {
  console.log('🚀 Finding correct endpoint for JIRA tools');
  console.log('==========================================\n');

  // Test various endpoint patterns
  const endpoints = [
    // Direct tool calls
    { path: '/api/jira/projects', method: 'GET' },
    { path: '/jira/projects', method: 'GET' },
    { path: '/projects', method: 'GET' },
    
    // MCP-style endpoints
    { path: '/api/mcp/tools/list_jira_projects', method: 'POST', data: '{}' },
    { path: '/mcp/list_jira_projects', method: 'POST', data: '{}' },
    { path: '/tools/list_jira_projects', method: 'POST', data: '{}' },
    
    // Generic tool calling
    { path: '/api/tools', method: 'POST', data: JSON.stringify({ name: 'list_jira_projects', params: {} }) },
    { path: '/execute', method: 'POST', data: JSON.stringify({ tool: 'list_jira_projects', input: {} }) },
    { path: '/run-tool', method: 'POST', data: JSON.stringify({ tool: 'list_jira_projects', input: {} }) }
  ];

  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint.path, endpoint.method, endpoint.data);
    if (result.success) {
      console.log('\n🎉 Found working endpoint!');
      console.log(`   ${endpoint.method} ${endpoint.path}`);
      
      // Try to call list_jira_projects if this looks promising
      if (result.data && (Array.isArray(result.data) || result.data.projects)) {
        console.log('\n🏗️ JIRA Projects Found:');
        const projects = Array.isArray(result.data) ? result.data : result.data.projects;
        if (projects && projects.length > 0) {
          projects.slice(0, 3).forEach((project, index) => {
            console.log(`${index + 1}. ${project.key || project.name}: ${project.name || project.description || 'No name'}`);
          });
          console.log(`   ... and ${Math.max(0, projects.length - 3)} more`);
        }
      }
      return result;
    }
    
    await new Promise(resolve => setTimeout(resolve, 200)); // Small delay
  }

  console.log('\n❌ No working endpoint found for JIRA tools');
  console.log('💡 Your MCP server might use a different API structure');
  
  return null;
}

findJiraEndpoint();
