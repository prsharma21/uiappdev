// Test script for listing JIRA projects via MCP server
const http = require('http');

console.log('🎯 Testing JIRA Projects List');
console.log('=============================');
console.log('MCP Server: http://localhost:8080');
console.log('Tool: list_jira_projects');
console.log('');

function testListJiraProjects() {
  console.log('📋 Calling list_jira_projects tool...');
  
  // Request body - can include parameters like maxResults
  const requestBody = JSON.stringify({
    maxResults: 10
  });

  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/tools/list_jira_projects',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestBody)
    }
  };

  console.log('⏳ Making request to /tools/list_jira_projects...');

  const req = http.request(options, (res) => {
    console.log(`📊 Status: ${res.statusCode}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      try {
        const parsed = JSON.parse(responseData);
        console.log('');
        console.log('📦 Raw Response:');
        console.log(JSON.stringify(parsed, null, 2));
        console.log('');
        
        // Extract the actual data from MCP format: result.content[0].text
        if (parsed.result && parsed.result.content && parsed.result.content[0]) {
          const jiraData = parsed.result.content[0].text;
          console.log('✅ JIRA Projects Data:');
          console.log('=====================');
          console.log(jiraData);
          
          // Try to parse the JIRA data if it's JSON
          try {
            const jiraProjects = JSON.parse(jiraData);
            console.log('');
            console.log('🎯 Parsed JIRA Projects:');
            console.log('========================');
            
            if (Array.isArray(jiraProjects)) {
              jiraProjects.forEach((project, index) => {
                console.log(`${index + 1}. ${project.name || project.key || 'Unknown'}`);
                if (project.description) {
                  console.log(`   📝 ${project.description}`);
                }
                if (project.key) {
                  console.log(`   � Key: ${project.key}`);
                }
                console.log('');
              });
              console.log(`� Total: ${jiraProjects.length} projects found`);
            } else if (jiraProjects.values) {
              // Handle JIRA API response format
              jiraProjects.values.forEach((project, index) => {
                console.log(`${index + 1}. ${project.name}`);
                console.log(`   🔑 Key: ${project.key}`);
                if (project.description) {
                  console.log(`   📝 ${project.description}`);
                }
                console.log('');
              });
              console.log(`📊 Total: ${jiraProjects.values.length} projects found`);
            } else {
              console.log('📄 Project data:', jiraProjects);
            }
          } catch (parseError) {
            console.log('� JIRA data (not JSON):', jiraData);
          }
        } else if (parsed.error) {
          console.log('❌ MCP Error:', parsed.error.message);
          if (parsed.error.code) {
            console.log('Error Code:', parsed.error.code);
          }
        } else {
          console.log('⚠️ Unexpected response format');
          console.log('Expected: result.content[0].text');
        }
      } catch (error) {
        console.log('❌ Failed to parse response as JSON');
        console.log('Raw response:', responseData.substring(0, 500));
        console.log('Parse error:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Connection failed:', error.message);
    console.log('💡 Make sure MCP server is running on port 8080');
    console.log('💡 Verify JIRA MCP server is configured and connected');
  });

  req.setTimeout(10000); // 10 second timeout for JIRA calls
  req.on('timeout', () => {
    console.log('⏰ Request timed out');
    console.log('💡 JIRA connection might be slow or not configured');
    req.destroy();
  });

  req.write(requestBody);
  req.end();
}

testListJiraProjects();
