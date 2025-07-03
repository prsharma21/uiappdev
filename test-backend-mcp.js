// Test JIRA projects through backend API
const http = require('http');

function testBackendMcpTools() {
  console.log('🔍 Testing MCP tools through backend API...');
  console.log('Server: http://localhost:3002');
  console.log('');

  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/mcp/tools',
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📊 Status: ${res.statusCode}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      try {
        const result = JSON.parse(responseData);
        
        if (res.statusCode === 200) {
          console.log('✅ Backend MCP API is working!');
          console.log('🛠️ Available Tools:');
          console.log('==================');
          
          if (result.tools) {
            result.tools.forEach((tool, index) => {
              console.log(`${index + 1}. ${tool.name}`);
              console.log(`   📝 ${tool.description}`);
              console.log('');
            });
            console.log(`📊 Total: ${result.tools.length} tools available`);
          } else {
            console.log('📋 Response:', JSON.stringify(result, null, 2));
          }
        } else {
          console.log('❌ Error response:', result);
        }
      } catch (error) {
        console.log('❌ Failed to parse response:', error.message);
        console.log('📤 Raw response:', responseData);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Request failed:', error.message);
    console.log('💡 Make sure backend server is running on port 3002');
  });

  req.setTimeout(10000);
  req.end();
}

function testListJiraProjects() {
  console.log('🔍 Testing list_jira_projects through backend...');
  
  // Try the MCP test endpoint with JIRA tool
  const data = JSON.stringify({
    tool: 'list_jira_projects',
    input: { maxResults: 10 }
  });

  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/mcp/test',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📊 Status: ${res.statusCode}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      try {
        const result = JSON.parse(responseData);
        
        if (res.statusCode === 200) {
          console.log('✅ JIRA Projects Retrieved!');
          console.log('🏗️ Projects:');
          console.log('============');
          
          if (result.result && Array.isArray(result.result)) {
            result.result.forEach((project, index) => {
              console.log(`${index + 1}. ${project.key}: ${project.name}`);
              console.log(`   📋 ID: ${project.id}`);
              if (project.lead) {
                console.log(`   👤 Lead: ${project.lead.displayName}`);
              }
              console.log('');
            });
            console.log(`📊 Total projects: ${result.result.length}`);
          } else {
            console.log('📋 Response:', JSON.stringify(result, null, 2));
          }
        } else {
          console.log('❌ Error response:', result);
        }
      } catch (error) {
        console.log('❌ Failed to parse response:', error.message);
        console.log('📤 Raw response:', responseData);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Request failed:', error.message);
  });

  req.setTimeout(15000);
  req.write(data);
  req.end();
}

// Run tests
console.log('🚀 Testing Backend MCP Integration');
console.log('==================================\n');

testBackendMcpTools();

setTimeout(() => {
  console.log('\n' + '='.repeat(40) + '\n');
  testListJiraProjects();
}, 2000);
