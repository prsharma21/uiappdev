// Test script for updating JIRA issue status via MCP server
const http = require('http');

console.log('🔄 Testing Update JIRA Issue Status via MCP Server');
console.log('==================================================');
console.log('🌐 MCP Server: http://localhost:8080');
console.log('🔧 Tool: update_jira_status');
console.log('');

function updateJiraStatus(issueKey, targetStatus) {
  console.log(`📋 Updating JIRA issue: ${issueKey}`);
  console.log(`🎯 Target status: ${targetStatus}`);
  
  const requestBody = JSON.stringify({
    issueKey: issueKey,
    targetStatus: targetStatus
  });

  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/tools/update_jira_status',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestBody)
    }
  };

  console.log(`⏳ Making request to /tools/update_jira_status...`);

  const req = http.request(options, (res) => {
    console.log(`📊 HTTP Status: ${res.statusCode} ${res.statusMessage}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      try {
        const parsed = JSON.parse(responseData);
        console.log('');
        console.log('📦 Raw MCP Response:');
        console.log('===================');
        console.log(JSON.stringify(parsed, null, 2));
        console.log('');
        
        // Extract the actual data from MCP format: result.content[0].text
        if (parsed.result && parsed.result.content && parsed.result.content[0]) {
          const statusData = parsed.result.content[0].text;
          console.log(`✅ Status Update Result:`);
          console.log('=======================');
          console.log(statusData);
          console.log('');
          
          // Check for success indicators
          if (statusData.toLowerCase().includes('success') || 
              statusData.toLowerCase().includes('updated') ||
              statusData.toLowerCase().includes('transitioned')) {
            console.log('🎉 Status update appears successful!');
            console.log(`🔄 ${issueKey} status changed to: ${targetStatus}`);
          } else {
            console.log('⚠️ Status update result unclear. Check the response above.');
          }
          
        } else if (parsed.error) {
          console.log('❌ MCP Error:', parsed.error.message);
          if (parsed.error.code) {
            console.log('   Error Code:', parsed.error.code);
          }
          if (parsed.error.data) {
            console.log('   Error Details:', parsed.error.data);
          }
        } else {
          console.log('⚠️ Unexpected response format');
          console.log('Expected: result.content[0].text');
          console.log('Received keys:', Object.keys(parsed));
        }
      } catch (error) {
        console.log('❌ Failed to parse response as JSON');
        console.log('Parse error:', error.message);
        console.log('Raw response:', responseData.substring(0, 500));
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Connection failed:', error.message);
    console.log('💡 Make sure MCP server is running on port 8080');
  });

  req.setTimeout(15000);
  req.on('timeout', () => {
    console.log('⏰ Request timed out after 15 seconds');
    req.destroy();
  });

  req.write(requestBody);
  req.end();
}

// Update SCRUM-3 status (based on user's working PowerShell command)
console.log('🚀 Running JIRA Status Update Test');
console.log('==================================');
console.log('📋 Issue: SCRUM-3');
console.log('📊 Current Status: To Do');
console.log('🎯 New Status: In Progress');
console.log('');
console.log('💡 PowerShell equivalent:');
console.log('$body = @{ issueKey = "SCRUM-3"; targetStatus = "In Progress" } | ConvertTo-Json');
console.log('$result = Invoke-RestMethod -Uri "http://localhost:8080/tools/update_jira_status" -Method POST -ContentType "application/json" -Body $body');
console.log('$result.result.content[0].text');
console.log('');

updateJiraStatus('SCRUM-3', 'In Progress');
