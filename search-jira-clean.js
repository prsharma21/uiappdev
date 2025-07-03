// Simple script to search JIRA issues using MCP server
const http = require('http');

console.log('🔍 Search JIRA Issues via MCP Server');
console.log('====================================');
console.log('🌐 MCP Server: http://localhost:8080');
console.log('🔧 Tool: search_jira_issues');
console.log('');

function searchJiraIssues(jql = 'order by updated DESC', maxResults = 10) {
  console.log(`📋 Searching JIRA issues...`);
  console.log(`🔍 JQL Query: ${jql}`);
  console.log(`📊 Max Results: ${maxResults}`);
  console.log('');

  const requestBody = JSON.stringify({
    jql: jql,
    maxResults: maxResults
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

  console.log('⏳ Making request to /tools/search_jira_issues...');

  const req = http.request(options, (res) => {
    console.log(`📊 HTTP Status: ${res.statusCode} ${res.statusMessage}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      try {
        const parsed = JSON.parse(responseData);
        
        if (parsed.result && parsed.result.content && parsed.result.content[0]) {
          const jiraData = parsed.result.content[0].text;
          console.log('');
          console.log('✅ JIRA Issues Found:');
          console.log('====================');
          console.log(jiraData);
          console.log('');
          
          // Try to parse the data further if it contains structured info
          if (jiraData.includes('•')) {
            console.log('🎯 Formatted Results:');
            console.log('=====================');
            
            const lines = jiraData.split('\n').filter(line => line.trim());
            let issueCount = 0;
            
            lines.forEach(line => {
              if (line.includes('•')) {
                issueCount++;
                const cleanLine = line.replace(/•\s*/, '').trim();
                
                // Extract issue key and summary
                const match = cleanLine.match(/^([A-Z]+-\d+):\s*(.+?)(?:\s*\([^)]+\))?$/);
                if (match) {
                  const [, key, summary] = match;
                  console.log(`${issueCount}. 🎫 ${key}: ${summary}`);
                  
                  // Extract status if present
                  const statusMatch = cleanLine.match(/\(([^)]+)\)$/);
                  if (statusMatch) {
                    console.log(`   📊 Status: ${statusMatch[1]}`);
                  }
                } else {
                  console.log(`${issueCount}. ${cleanLine}`);
                }
                console.log('');
              }
            });
            
            console.log(`📊 Total Issues Found: ${issueCount}`);
          }
          
        } else if (parsed.error) {
          console.log('❌ MCP Error:', parsed.error.message);
          if (parsed.error.code) {
            console.log('   Error Code:', parsed.error.code);
          }
        } else {
          console.log('⚠️ Unexpected response format');
          console.log('Raw response:', JSON.stringify(parsed, null, 2));
        }
      } catch (error) {
        console.log('❌ Failed to parse response as JSON');
        console.log('Parse error:', error.message);
        console.log('Raw response:', responseData.substring(0, 300));
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

// Test different searches
console.log('🚀 Running JIRA Issues Search Tests');
console.log('===================================');

// Search 1: Latest issues
searchJiraIssues('order by updated DESC', 10);

// Search 2: Search in specific project after delay
setTimeout(() => {
  console.log('\n\n🔍 Search 2: SCRUM Project Issues');
  console.log('=================================');
  searchJiraIssues('project = SCRUM order by created DESC', 5);
}, 3000);

// Search 3: Search in LEARNJIRA project after delay
setTimeout(() => {
  console.log('\n\n🔍 Search 3: LEARNJIRA Project Issues');
  console.log('====================================');
  searchJiraIssues('project = LEARNJIRA order by created DESC', 5);
}, 6000);

// Search 4: Search To Do issues after delay
setTimeout(() => {
  console.log('\n\n🔍 Search 4: To Do Issues');
  console.log('========================');
  searchJiraIssues('status = "To Do" order by priority DESC', 8);
}, 9000);
