const axios = require('axios');

async function testGetIssueRaw() {
  try {
    const response = await axios.post('http://localhost:8080/tools/get_jira_issue', {
      issueKey: 'SCRUM-1'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('Full response structure:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.result && response.data.result.content) {
      console.log('\nContent text:');
      console.log(response.data.result.content[0].text);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testGetIssueRaw();
