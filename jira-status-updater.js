#!/usr/bin/env node

/**
 * Generic JIRA Status Updater
 * 
 * This script provides a flexible way to update JIRA issue statuses
 * using the MCP server backend.
 * 
 * Usage:
 *   node jira-status-updater.js <issueKey> <targetStatus>
 *   node jira-status-updater.js SCRUM-2 "In Progress"
 *   node jira-status-updater.js PROJ-123 "Done"
 * 
 * Interactive mode:
 *   node jira-status-updater.js
 */

const axios = require('axios');
const readline = require('readline');

// Configuration
const MCP_SERVER_URL = 'http://localhost:8080';
const VALID_STATUSES = [
  'To Do',
  'In Progress', 
  'In Review',
  'Testing',
  'Done',
  'Blocked',
  'Cancelled'
];

/**
 * Update JIRA issue status via MCP server
 * @param {string} issueKey - The JIRA issue key (e.g., SCRUM-2)
 * @param {string} targetStatus - The target status (e.g., "In Progress")
 * @returns {Promise<string>} Result message
 */
async function updateJiraStatus(issueKey, targetStatus) {
  try {
    console.log(`🔄 Updating JIRA issue ${issueKey} to status: ${targetStatus}`);
    
    const response = await axios.post(`${MCP_SERVER_URL}/tools/update_jira_status`, {
      issueKey: issueKey,
      targetStatus: targetStatus
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });
    
    console.log('✅ Response received from MCP server');
    
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
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

/**
 * Validate JIRA issue key format
 * @param {string} issueKey - The issue key to validate
 * @returns {boolean} True if valid format
 */
function validateIssueKey(issueKey) {
  const issueKeyPattern = /^[A-Z]+-\d+$/;
  return issueKeyPattern.test(issueKey);
}

/**
 * Validate status name
 * @param {string} status - The status to validate
 * @returns {boolean} True if valid status
 */
function validateStatus(status) {
  return VALID_STATUSES.includes(status);
}

/**
 * Interactive mode - prompt user for input
 */
async function interactiveMode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => new Promise((resolve) => {
    rl.question(prompt, resolve);
  });

  try {
    console.log('🎯 JIRA Status Updater - Interactive Mode');
    console.log('======================================\n');
    
    // Get issue key
    let issueKey;
    do {
      issueKey = await question('Enter JIRA issue key (e.g., SCRUM-2): ');
      if (!validateIssueKey(issueKey)) {
        console.log('❌ Invalid issue key format. Use format: PROJECT-123');
      }
    } while (!validateIssueKey(issueKey));
    
    // Show available statuses
    console.log('\n📋 Available statuses:');
    VALID_STATUSES.forEach((status, index) => {
      console.log(`  ${index + 1}. ${status}`);
    });
    
    // Get target status
    let targetStatus;
    do {
      const statusInput = await question('\nEnter target status (name or number): ');
      
      // Check if it's a number (menu selection)
      const statusNumber = parseInt(statusInput);
      if (!isNaN(statusNumber) && statusNumber >= 1 && statusNumber <= VALID_STATUSES.length) {
        targetStatus = VALID_STATUSES[statusNumber - 1];
      } else {
        targetStatus = statusInput;
      }
      
      if (!validateStatus(targetStatus)) {
        console.log('❌ Invalid status. Please select from the list above.');
      }
    } while (!validateStatus(targetStatus));
    
    console.log(`\n🎯 Updating ${issueKey} to "${targetStatus}"`);
    const confirm = await question('Continue? (y/N): ');
    
    if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
      const result = await updateJiraStatus(issueKey, targetStatus);
      console.log('\n🎉 Update completed successfully!');
    } else {
      console.log('❌ Update cancelled by user');
    }
    
  } catch (error) {
    console.error('❌ Interactive mode error:', error.message);
  } finally {
    rl.close();
  }
}

/**
 * Batch mode - update multiple issues from a configuration file
 * @param {string} configFile - Path to JSON configuration file
 */
async function batchMode(configFile) {
  try {
    const fs = require('fs');
    const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    
    console.log(`🔄 Running batch updates from ${configFile}`);
    console.log(`📊 Found ${config.updates.length} updates to process\n`);
    
    const results = [];
    
    for (const update of config.updates) {
      try {
        console.log(`--- Processing ${update.issueKey} ---`);
        
        if (!validateIssueKey(update.issueKey)) {
          throw new Error(`Invalid issue key format: ${update.issueKey}`);
        }
        
        if (!validateStatus(update.targetStatus)) {
          throw new Error(`Invalid status: ${update.targetStatus}`);
        }
        
        const result = await updateJiraStatus(update.issueKey, update.targetStatus);
        results.push({ issueKey: update.issueKey, status: 'SUCCESS', result });
        
        // Add delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Failed to update ${update.issueKey}:`, error.message);
        results.push({ issueKey: update.issueKey, status: 'FAILED', error: error.message });
      }
    }
    
    // Summary
    console.log('\n📊 Batch Update Summary:');
    console.log('========================');
    const successful = results.filter(r => r.status === 'SUCCESS').length;
    const failed = results.filter(r => r.status === 'FAILED').length;
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${results.length}`);
    
  } catch (error) {
    console.error('❌ Batch mode error:', error.message);
    process.exit(1);
  }
}

/**
 * Display help information
 */
function showHelp() {
  console.log(`
🎯 JIRA Status Updater
======================

Update JIRA issue statuses using the MCP server backend.

USAGE:
  node jira-status-updater.js <issueKey> <targetStatus>
  node jira-status-updater.js                           # Interactive mode
  node jira-status-updater.js --batch <configFile>      # Batch mode
  node jira-status-updater.js --help                    # Show this help

EXAMPLES:
  node jira-status-updater.js SCRUM-2 "In Progress"
  node jira-status-updater.js PROJ-123 "Done"
  node jira-status-updater.js --batch updates.json

VALID STATUSES:
  ${VALID_STATUSES.map(s => `• ${s}`).join('\n  ')}

BATCH CONFIG FORMAT (updates.json):
  {
    "updates": [
      { "issueKey": "SCRUM-1", "targetStatus": "In Progress" },
      { "issueKey": "SCRUM-2", "targetStatus": "Done" }
    ]
  }

REQUIREMENTS:
  • MCP server running on ${MCP_SERVER_URL}
  • Valid JIRA credentials configured in MCP server
  • Network access to JIRA instance
`);
}

/**
 * Main function - handle command line arguments
 */
async function main() {
  const args = process.argv.slice(2);
  
  try {
    // Check for help flag
    if (args.includes('--help') || args.includes('-h')) {
      showHelp();
      return;
    }
    
    // Check for batch mode
    if (args[0] === '--batch' && args[1]) {
      await batchMode(args[1]);
      return;
    }
    
    // Command line mode with arguments
    if (args.length === 2) {
      const [issueKey, targetStatus] = args;
      
      // Validate inputs
      if (!validateIssueKey(issueKey)) {
        console.error('❌ Error: Invalid issue key format. Use format: PROJECT-123');
        console.error('Use --help for more information.');
        process.exit(1);
      }
      
      if (!validateStatus(targetStatus)) {
        console.error('❌ Error: Invalid status name.');
        console.error('Valid statuses:', VALID_STATUSES.join(', '));
        console.error('Use --help for more information.');
        process.exit(1);
      }
      
      // Execute update
      const result = await updateJiraStatus(issueKey, targetStatus);
      console.log('🎉 Update completed successfully!');
      return;
    }
    
    // No arguments or invalid arguments - start interactive mode
    if (args.length === 0) {
      await interactiveMode();
      return;
    }
    
    // Invalid arguments
    console.error('❌ Error: Invalid arguments.');
    console.error('Use --help for usage information.');
    process.exit(1);
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Export functions for use as module
module.exports = {
  updateJiraStatus,
  validateIssueKey,
  validateStatus,
  VALID_STATUSES
};

// Run main function if called directly
if (require.main === module) {
  main();
}
