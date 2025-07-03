// Simple test for get_jira_issue MCP tool
const http = require('http');
const readline = require('readline');

console.log('🎫 Get JIRA Issue Test');
console.log('======================');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to get JIRA issue
function getJiraIssue(issueKey) {
  console.log(`Getting issue: ${issueKey}`);

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

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      try {
        const parsed = JSON.parse(responseData);
        console.log('\nRaw response:');
        console.log(JSON.stringify(parsed, null, 2));
        
        if (parsed.result && parsed.result.content && parsed.result.content[0]) {
          const jiraData = parsed.result.content[0].text;
          console.log('\nJIRA Issue Data:');
          console.log('================');
          console.log(jiraData);
        } else if (parsed.error) {
          console.log('\nError:', parsed.error.message);
        }
      } catch (error) {
        console.log('\nParse error:', error.message);
        console.log('Raw response:', responseData);
      }
      
      // Ask if user wants to get another issue
      console.log('\n');
      rl.question('Enter another issue key (or press Enter to exit): ', (nextIssueKey) => {
        if (nextIssueKey.trim()) {
          console.log('\n' + '='.repeat(50));
          getJiraIssue(nextIssueKey.trim());
        } else {
          console.log('👋 Goodbye!');
          rl.close();
        }
      });
    });
  });

  req.on('error', (error) => {
    console.log('Connection error:', error.message);
    rl.close();
  });

  req.setTimeout(10000);
  req.on('timeout', () => {
    console.log('Request timed out');
    req.destroy();
    rl.close();
  });

  req.write(requestBody);
  req.end();
}

// Start the application
console.log('Available issue keys from previous searches:');
console.log('• SCRUM-1, SCRUM-2, SCRUM-3');
console.log('• MYP-1');
console.log('• LEARNJIRA-1, LEARNJIRA-2, LEARNJIRA-3');
console.log('');

rl.question('Enter JIRA issue key (e.g., SCRUM-1): ', (issueKey) => {
  if (issueKey.trim()) {
    console.log('\n' + '='.repeat(50));
    getJiraIssue(issueKey.trim());
  } else {
    console.log('❌ No issue key provided. Exiting...');
    rl.close();
  }
});
