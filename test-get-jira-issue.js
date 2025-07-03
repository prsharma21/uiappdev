// Test script for getting a specific JIRA issue via MCP server
const http = require('http');

console.log('🎫 Testing Get JIRA Issue via MCP Server');
console.log('========================================');
console.log('🌐 MCP Server: http://localhost:8080');
console.log('🔧 Tool: get_jira_issue');
console.log('');

function getJiraIssue(issueKey) {
  console.log(`📋 Getting JIRA issue: ${issueKey}`);
  
  const requestBody = JSON.stringify({
    issueKey: issueKey
  });

  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/tools/get_jira_issue',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestBody)
    }
  };

  console.log(`⏳ Making request to /tools/get_jira_issue for ${issueKey}...`);

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
          const jiraData = parsed.result.content[0].text;
          console.log(`✅ JIRA Issue ${issueKey} Details:`);
          console.log('================================');
          console.log(jiraData);
          console.log('');
          
          // Try to parse the JIRA data if it's JSON
          try {
            const issueData = JSON.parse(jiraData);
            console.log('🎯 Parsed Issue Details:');
            console.log('========================');
            
            if (issueData.key) {
              console.log(`🎫 Issue Key: ${issueData.key}`);
            }
            
            if (issueData.fields) {
              const fields = issueData.fields;
              
              if (fields.summary) {
                console.log(`📝 Summary: ${fields.summary}`);
              }
              
              if (fields.description) {
                const desc = typeof fields.description === 'string' 
                  ? fields.description 
                  : JSON.stringify(fields.description);
                console.log(`📄 Description: ${desc.substring(0, 200)}${desc.length > 200 ? '...' : ''}`);
              }
              
              if (fields.status) {
                console.log(`📊 Status: ${fields.status.name || fields.status}`);
              }
              
              if (fields.priority) {
                console.log(`🔥 Priority: ${fields.priority.name || fields.priority}`);
              }
              
              if (fields.issuetype) {
                console.log(`📋 Issue Type: ${fields.issuetype.name || fields.issuetype}`);
              }
              
              if (fields.assignee) {
                console.log(`👤 Assignee: ${fields.assignee.displayName || fields.assignee.name || fields.assignee}`);
              } else {
                console.log(`👤 Assignee: Unassigned`);
              }
              
              if (fields.reporter) {
                console.log(`👨‍💻 Reporter: ${fields.reporter.displayName || fields.reporter.name || fields.reporter}`);
              }
              
              if (fields.created) {
                console.log(`📅 Created: ${fields.created}`);
              }
              
              if (fields.updated) {
                console.log(`🔄 Updated: ${fields.updated}`);
              }
              
              if (fields.project) {
                console.log(`📂 Project: ${fields.project.name || fields.project.key || fields.project}`);
              }
              
              if (fields.labels && fields.labels.length > 0) {
                console.log(`🏷️ Labels: ${fields.labels.join(', ')}`);
              }
              
              if (fields.components && fields.components.length > 0) {
                console.log(`🧩 Components: ${fields.components.map(c => c.name || c).join(', ')}`);
              }
              
            } else {
              console.log('📄 Issue data (no fields):', issueData);
            }
          } catch (parseError) {
            console.log('ℹ️ JIRA data (not JSON format):');
            console.log(jiraData);
          }
        } else if (parsed.error) {
          console.log('❌ MCP Error:', parsed.error.message);
          if (parsed.error.code) {
            console.log('   Error Code:', parsed.error.code);
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

// Test multiple issues
console.log('🚀 Running Get JIRA Issue Tests');
console.log('===============================');

// Test 1: Get SCRUM-1 issue
getJiraIssue('SCRUM-1');

// Test 2: Get SCRUM-3 issue after delay
setTimeout(() => {
  console.log('\n\n🎫 Test 2: Getting SCRUM-3 Issue');
  console.log('================================');
  getJiraIssue('SCRUM-3');
}, 3000);

// Test 3: Get MYP-1 issue after delay
setTimeout(() => {
  console.log('\n\n🎫 Test 3: Getting MYP-1 Issue');
  console.log('==============================');
  getJiraIssue('MYP-1');
}, 6000);

// Test 4: Get LEARNJIRA-1 issue after delay
setTimeout(() => {
  console.log('\n\n🎫 Test 4: Getting LEARNJIRA-1 Issue');
  console.log('===================================');
  getJiraIssue('LEARNJIRA-1');
}, 9000);
