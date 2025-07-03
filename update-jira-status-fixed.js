const axios = require('axios');

async function updateJiraStatus(issueKey, targetStatus) {
  try {
    console.log(`🔄 Updating JIRA issue ${issueKey} to status: ${targetStatus}`);
    
    const response = await axios.post('http://localhost:8080/tools/update_jira_status', {
      issueKey: issueKey,
      targetStatus: targetStatus
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Response received:', response.data);
    
    if (response.data.result && response.data.result.content) {
      const content = response.data.result.content[0];
      console.log('📝 Status update result:', content.text);
      return content.text;
    } else {
      console.log('❌ Unexpected response structure:', response.data);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error updating JIRA status:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Test with different issues
async function testStatusUpdates() {
  console.log('🧪 Testing JIRA status updates...\n');
  
  const testCases = [
    { issueKey: 'SCRUM-1', targetStatus: 'In Progress' },
    { issueKey: 'SCRUM-2', targetStatus: 'To Do' },
    { issueKey: 'SCRUM-3', targetStatus: 'Done' }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`\n--- Testing ${testCase.issueKey} ---`);
      const result = await updateJiraStatus(testCase.issueKey, testCase.targetStatus);
      console.log(`✅ ${testCase.issueKey}: ${result}`);
    } catch (error) {
      console.error(`❌ ${testCase.issueKey} failed:`, error.message);
    }
  }
}

// Run if called directly
if (require.main === module) {
  testStatusUpdates();
}

module.exports = { updateJiraStatus };
