const axios = require('axios');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// MCP Server base URL
const MCP_BASE_URL = 'http://localhost:8080/tools';

// JIRA API functions using MCP server
async function callMCPTool(toolName, params) {
  try {
    const response = await axios.post(`${MCP_BASE_URL}/${toolName}`, params, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.data.result && response.data.result.content) {
      return response.data.result.content[0].text;
    }
    return response.data;
  } catch (error) {
    throw new Error(`MCP Tool Error: ${error.message}`);
  }
}

async function listJiraProjects() {
  const result = await callMCPTool('list_jira_projects', {});
  return JSON.parse(result);
}

async function searchJiraIssues(jql = 'project = SCRUM') {
  const result = await callMCPTool('search_jira_issues', { jql });
  return JSON.parse(result);
}

async function getJiraIssue(issueKey) {
  const result = await callMCPTool('get_jira_issue', { issueKey });
  return JSON.parse(result);
}

async function updateJiraStatus(issueKey, targetStatus) {
  const result = await callMCPTool('update_jira_status', { issueKey, targetStatus });
  return result; // This returns plain text, not JSON
}

// JIRA-Driven Development Workflow
async function executeJiraDrivenWorkflow(issueKey) {
  console.log(`\n🚀 Starting JIRA-driven workflow for issue: ${issueKey}`);
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Fetch JIRA issue details
    console.log('\n📋 Step 1: Fetching JIRA issue details...');
    const issue = await getJiraIssue(issueKey);
    
    console.log(`✅ Issue: ${issue.key}`);
    console.log(`📝 Summary: ${issue.fields.summary}`);
    console.log(`📊 Status: ${issue.fields.status.name}`);
    console.log(`⚡ Priority: ${issue.fields.priority?.name || 'None'}`);
    console.log(`📋 Type: ${issue.fields.issuetype.name}`);
    
    if (issue.fields.description) {
      console.log(`📄 Description: ${issue.fields.description.substring(0, 200)}...`);
    }
    
    // Step 2: Parse requirements (simulate parsing)
    console.log('\n🛠️ Step 2: Parsing requirements...');
    const requirements = parseJiraRequirements(issue);
    console.log(`✅ Component: ${requirements.componentName}`);
    console.log(`✅ Type: ${requirements.componentType}`);
    console.log(`✅ Requirements: ${requirements.requirements.length} items`);
    
    // Step 3: Simulate code generation
    console.log('\n💻 Step 3: Generating code...');
    const codeChanges = simulateCodeGeneration(requirements);
    console.log(`✅ Generated ${codeChanges.files.length} files`);
    codeChanges.files.forEach(file => console.log(`   📄 ${file}`));
    
    // Step 4: Simulate test generation
    console.log('\n🧪 Step 4: Generating unit tests...');
    const testResults = simulateTestGeneration(requirements);
    console.log(`✅ Generated ${testResults.testCount} tests`);
    console.log(`✅ Expected coverage: ${testResults.coverage}%`);
    
    // Step 5: Update JIRA status to In Progress
    console.log('\n📈 Step 5: Updating JIRA status...');
    const statusUpdate = await updateJiraStatus(issueKey, 'In Progress');
    console.log(`✅ ${statusUpdate}`);
    
    // Step 6: Simulate GitHub PR creation
    console.log('\n🔀 Step 6: Creating GitHub PR...');
    const prResult = simulateGitHubPR(issueKey, issue, codeChanges);
    console.log(`✅ PR created: ${prResult.url}`);
    console.log(`✅ Branch: ${prResult.branch}`);
    
    // Summary
    console.log('\n🎉 Workflow completed successfully!');
    console.log('=' .repeat(60));
    console.log(`📋 JIRA Issue: ${issue.key} - ${issue.fields.summary}`);
    console.log(`💻 Code Files: ${codeChanges.files.length}`);
    console.log(`🧪 Unit Tests: ${testResults.testCount}`);
    console.log(`🔀 GitHub PR: ${prResult.url}`);
    
    return {
      issue,
      requirements,
      codeChanges,
      testResults,
      prResult,
      status: 'SUCCESS'
    };
    
  } catch (error) {
    console.error(`❌ Workflow failed: ${error.message}`);
    throw error;
  }
}

// Helper functions (simulate the actual implementation)
function parseJiraRequirements(issue) {
  const summary = issue.fields.summary;
  const description = issue.fields.description || '';
  
  // Extract component name from summary
  const componentMatch = summary.match(/\[UI\]\s*(\w+)/i) || summary.match(/(\w+Component)/i);
  const componentName = componentMatch ? componentMatch[1] : 'GeneratedComponent';
  
  // Determine component type
  let componentType = 'functional';
  if (description.toLowerCase().includes('form')) componentType = 'form';
  else if (description.toLowerCase().includes('modal')) componentType = 'modal';
  else if (description.toLowerCase().includes('table')) componentType = 'table';
  
  return {
    componentName,
    componentType,
    requirements: [
      'Implement core functionality',
      'Add proper styling',
      'Include error handling',
      'Add accessibility features'
    ],
    acceptanceCriteria: [
      'Component renders correctly',
      'User interactions work as expected',
      'Error states are handled gracefully'
    ]
  };
}

function simulateCodeGeneration(requirements) {
  const { componentName } = requirements;
  return {
    files: [
      `src/components/${componentName}/index.jsx`,
      `src/components/${componentName}/${componentName}.css`,
      `src/components/${componentName}/${componentName}.types.js`
    ],
    description: `Generated ${componentName} component with full functionality`
  };
}

function simulateTestGeneration(requirements) {
  return {
    testCount: requirements.requirements.length + requirements.acceptanceCriteria.length,
    coverage: 95,
    testFile: `src/components/${requirements.componentName}/${requirements.componentName}.test.js`
  };
}

function simulateGitHubPR(issueKey, issue, codeChanges) {
  const branchName = `feature/${issueKey.toLowerCase()}-${issue.fields.summary.toLowerCase().replace(/\s+/g, '-').substring(0, 30)}`;
  return {
    url: `https://github.com/yourorg/yourrepo/pull/123`,
    branch: branchName,
    title: `${issueKey}: ${issue.fields.summary}`
  };
}

// Interactive menu
async function showMenu() {
  console.log('\n🎯 JIRA-Driven Development Workflow');
  console.log('=====================================');
  console.log('1. List JIRA Projects');
  console.log('2. Search JIRA Issues');
  console.log('3. Get Issue Details');
  console.log('4. Update Issue Status');
  console.log('5. Execute Full Workflow');
  console.log('6. Exit');
  console.log('=====================================');
  
  return new Promise((resolve) => {
    rl.question('Select option (1-6): ', (answer) => {
      resolve(answer.trim());
    });
  });
}

async function getInput(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Main interactive loop
async function main() {
  console.log('🚀 Welcome to JIRA-Driven Development Workflow!');
  
  while (true) {
    try {
      const choice = await showMenu();
      
      switch (choice) {
        case '1':
          console.log('\n📋 Listing JIRA Projects...');
          const projects = await listJiraProjects();
          projects.forEach(project => {
            console.log(`📁 ${project.key}: ${project.name}`);
          });
          break;
          
        case '2':
          const jql = await getInput('Enter JQL query (or press Enter for default): ');
          console.log('\n🔍 Searching JIRA Issues...');
          const issues = await searchJiraIssues(jql || 'project = SCRUM');
          issues.issues.forEach(issue => {
            console.log(`🎫 ${issue.key}: ${issue.fields.summary} [${issue.fields.status.name}]`);
          });
          break;
          
        case '3':
          const issueKey = await getInput('Enter issue key (e.g., SCRUM-1): ');
          console.log(`\n📋 Getting details for ${issueKey}...`);
          const issue = await getJiraIssue(issueKey);
          console.log(`✅ ${issue.key}: ${issue.fields.summary}`);
          console.log(`📊 Status: ${issue.fields.status.name}`);
          console.log(`📋 Type: ${issue.fields.issuetype.name}`);
          break;
          
        case '4':
          const updateKey = await getInput('Enter issue key: ');
          const newStatus = await getInput('Enter new status: ');
          console.log(`\n📈 Updating ${updateKey} to ${newStatus}...`);
          const result = await updateJiraStatus(updateKey, newStatus);
          console.log(`✅ ${result}`);
          break;
          
        case '5':
          const workflowKey = await getInput('Enter issue key for full workflow: ');
          await executeJiraDrivenWorkflow(workflowKey);
          break;
          
        case '6':
          console.log('👋 Goodbye!');
          rl.close();
          return;
          
        default:
          console.log('❌ Invalid option. Please select 1-6.');
      }
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
    
    // Pause before showing menu again
    await getInput('\nPress Enter to continue...');
  }
}

// Export functions for use in other scripts
module.exports = {
  executeJiraDrivenWorkflow,
  listJiraProjects,
  searchJiraIssues,
  getJiraIssue,
  updateJiraStatus
};

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
