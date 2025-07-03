// Simple test script matching the user's PowerShell example
const http = require('http');

console.log('🔍 Testing JIRA Search (User\'s Example)');
console.log('=======================================');
console.log('🌐 MCP Server: http://localhost:8080');
console.log('📅 Test Time:', new Date().toISOString());
console.log('');

// Exact same query as user's PowerShell example
const requestBody = JSON.stringify({
  jql: "project is not EMPTY ORDER BY updated DESC",
  maxResults: 20
});

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/tools/search_jira_issues',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(requestBody)
  }
};

console.log('🔍 JQL Query:', JSON.parse(requestBody).jql);
console.log('📊 Max Results:', JSON.parse(requestBody).maxResults);
console.log('⏳ Making request to /tools/search_jira_issues...');

const req = http.request(options, (res) => {
  console.log(`📊 HTTP Status: ${res.statusCode} ${res.statusMessage}`);
  
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('');
    console.log('📦 Raw Response:');
    console.log('================');
    console.log(responseData);
    console.log('');
    
    try {
      const parsed = JSON.parse(responseData);
      
      if (parsed.result && parsed.result.content && parsed.result.content[0]) {
        const jiraData = parsed.result.content[0].text;
        console.log('✅ JIRA Data from result.content[0].text:');
        console.log('========================================');
        console.log(jiraData);
        console.log('');
        
        // Parse the JIRA data
        try {
          const jiraResponse = JSON.parse(jiraData);
          
          if (jiraResponse.issues && Array.isArray(jiraResponse.issues)) {
            console.log(`🎯 Found ${jiraResponse.issues.length} issues:`);
            console.log('');
            
            // Show first 5 issues
            const issuesToShow = jiraResponse.issues.slice(0, 5);
            issuesToShow.forEach((issue, index) => {
              console.log(`${index + 1}. 🎫 ${issue.key}: ${issue.fields.summary}`);
              if (issue.fields.status) {
                console.log(`   📊 Status: ${issue.fields.status.name}`);
              }
              if (issue.fields.priority) {
                console.log(`   🔥 Priority: ${issue.fields.priority.name}`);
              }
              console.log('');
            });
            
            if (jiraResponse.issues.length > 5) {
              console.log(`... and ${jiraResponse.issues.length - 5} more issues`);
            }
            
            console.log('📊 Summary:');
            console.log(`   Issues returned: ${jiraResponse.issues.length}`);
            console.log(`   Total available: ${jiraResponse.total || 'unknown'}`);
            console.log(`   Start at: ${jiraResponse.startAt || 0}`);
            console.log(`   Max results: ${jiraResponse.maxResults || 'unknown'}`);
            
          } else {
            console.log('📄 Unexpected JIRA response format:');
            console.log(JSON.stringify(jiraResponse, null, 2));
          }
        } catch (parseError) {
          console.log('❌ Could not parse JIRA data as JSON:');
          console.log('Parse error:', parseError.message);
          console.log('Raw JIRA data:', jiraData);
        }
      } else if (parsed.error) {
        console.log('❌ MCP Error:', parsed.error.message);
        if (parsed.error.code) {
          console.log('Error Code:', parsed.error.code);
        }
      } else {
        console.log('⚠️ Unexpected response format');
        console.log('Expected: result.content[0].text');
        console.log('Received:', Object.keys(parsed));
      }
    } catch (error) {
      console.log('❌ Failed to parse response as JSON');
      console.log('Parse error:', error.message);
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
