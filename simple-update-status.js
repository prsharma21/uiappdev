// Simple script to update JIRA status with proper encoding
const http = require('http');

console.log('🔄 Update JIRA Issue Status');
console.log('===========================');

// First, let's check the current status of SCRUM-2
function getIssueStatus(issueKey) {
  console.log(`📋 Checking current status of ${issueKey}...`);
  
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
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      try {
        const parsed = JSON.parse(responseData);
        if (parsed.result && parsed.result.content && parsed.result.content[0]) {
          const jiraData = parsed.result.content[0].text;
          console.log('Current Issue Status:');
          console.log('====================');
          console.log(jiraData);
          console.log('');
          
          // Now try to update the status
          updateStatus(issueKey, 'In Progress');
        }
      } catch (error) {
        console.log('Error checking status:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.log('Connection error:', error.message);
  });

  req.write(requestBody);
  req.end();
}

// Function to update status
function updateStatus(issueKey, targetStatus) {
  console.log(`🔄 Updating ${issueKey} status to: ${targetStatus}`);
  
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

  const req = http.request(options, (res) => {
    console.log(`📊 Status: ${res.statusCode}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      try {
        const parsed = JSON.parse(responseData);
        console.log('\nUpdate Response:');
        console.log('================');
        console.log(JSON.stringify(parsed, null, 2));
        
        if (parsed.result && parsed.result.content && parsed.result.content[0]) {
          const updateResult = parsed.result.content[0].text;
          console.log('\nUpdate Result:');
          console.log('==============');
          console.log(updateResult);
          
          if (updateResult.toLowerCase().includes('success') || 
              updateResult.toLowerCase().includes('updated') ||
              updateResult.toLowerCase().includes('transitioned')) {
            console.log('\n✅ Status update successful!');
          } else if (updateResult.toLowerCase().includes('error')) {
            console.log('\n❌ Status update failed');
          }
        } else if (parsed.error) {
          console.log('\n❌ Error:', parsed.error.message);
        }
      } catch (error) {
        console.log('\nParse error:', error.message);
        console.log('Raw response:', responseData);
      }
    });
  });

  req.on('error', (error) => {
    console.log('Connection error:', error.message);
  });

  req.setTimeout(15000);
  req.on('timeout', () => {
    console.log('Request timed out');
    req.destroy();
  });

  req.write(requestBody);
  req.end();
}

// Start by checking current status, then update
getIssueStatus('SCRUM-2');
