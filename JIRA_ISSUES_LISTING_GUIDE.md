# JIRA Issues Listing Guide

## 🎯 How to List JIRA Issues

Once your MCP server is properly configured, you can list JIRA issues in several ways:

## 🔧 Current System Status

**⚠️ Issues Detected:**
1. **MCP Server Configuration**: Missing utility modules (`./utils/logger.util.js`)
2. **TypeScript Compilation**: Some type declaration issues
3. **JIRA Connection**: Requires proper JIRA server configuration

## 📋 Methods to List JIRA Issues

### 1. Using the Web Interface (`/jira-mcp`)

Once the React app is running, navigate to the JIRA-MCP Integration section:

1. **URL**: `http://localhost:3000/jira-mcp`
2. **Features Available**:
   - Search by JQL (JIRA Query Language)
   - Fetch specific issues by key
   - Browse recent issues
   - Filter by project, status, assignee

### 2. Using API Endpoints (Direct HTTP Calls)

#### Search Issues by JQL
```powershell
# Search for all issues ordered by creation date
Invoke-RestMethod -Uri "http://localhost:3002/api/jira/issues/search" -Method POST -ContentType "application/json" -Body '{"jql": "ORDER BY created DESC", "maxResults": 50}'

# Search for UI-related issues
Invoke-RestMethod -Uri "http://localhost:3002/api/jira/issues/search" -Method POST -ContentType "application/json" -Body '{"jql": "summary ~ \"[UI]\" ORDER BY priority DESC", "maxResults": 20}'

# Search for issues assigned to current user
Invoke-RestMethod -Uri "http://localhost:3002/api/jira/issues/search" -Method POST -ContentType "application/json" -Body '{"jql": "assignee = currentUser() ORDER BY updated DESC", "maxResults": 30}'

# Search for high priority issues
Invoke-RestMethod -Uri "http://localhost:3002/api/jira/issues/search" -Method POST -ContentType "application/json" -Body '{"jql": "priority = High ORDER BY created DESC", "maxResults": 25}'
```

#### Fetch Specific Issues
```powershell
# Fetch a single issue by key
Invoke-RestMethod -Uri "http://localhost:3002/api/jira/issue/MYP-1"

# Fetch multiple issues in bulk
Invoke-RestMethod -Uri "http://localhost:3002/api/jira/issues/bulk" -Method POST -ContentType "application/json" -Body '{"issueKeys": ["MYP-1", "MYP-2", "PROJECT-123"]}'
```

### 3. Using JavaScript Service

```javascript
import jiraService from './services/jiraService';

// Get all UI issues
const uiIssues = await jiraService.getUIIssues();

// Get my assigned issues
const myIssues = await jiraService.getMyAssignedIssues();

// Get high priority issues
const highPriorityIssues = await jiraService.getHighPriorityIssues();

// Custom search
const customResults = await jiraService.searchIssues('project = "MYP" AND status = "In Progress"');

// Get recent issues
const recentIssues = await jiraService.searchIssues('updated >= -7d ORDER BY updated DESC');
```

## 🔍 Common JQL Queries for Listing Issues

### By Status
```sql
-- All open issues
status != Done ORDER BY priority DESC

-- In Progress issues
status = "In Progress" ORDER BY updated DESC

-- Ready for development
status = "Ready for Development" ORDER BY priority DESC

-- Recently completed
status = Done AND updated >= -7d ORDER BY updated DESC
```

### By Assignment
```sql
-- My assigned issues
assignee = currentUser() ORDER BY priority DESC

-- Unassigned issues
assignee IS EMPTY ORDER BY created DESC

-- Issues reported by me
reporter = currentUser() ORDER BY created DESC
```

### By Project and Component
```sql
-- All issues in a specific project
project = "MYP" ORDER BY created DESC

-- UI component issues
component = "UI" ORDER BY priority DESC

-- Frontend issues
labels = "frontend" ORDER BY updated DESC
```

### By Time and Priority
```sql
-- Recently created (last 7 days)
created >= -7d ORDER BY created DESC

-- Recently updated (last 3 days)
updated >= -3d ORDER BY updated DESC

-- High priority issues
priority = High ORDER BY created DESC

-- Critical issues
priority = Critical ORDER BY created ASC
```

### UI-Specific Queries
```sql
-- UI enhancement issues
summary ~ "[UI]" ORDER BY priority DESC

-- Component-related issues
summary ~ "component" OR description ~ "component" ORDER BY created DESC

-- Frontend bugs
type = Bug AND component = "Frontend" ORDER BY priority DESC

-- New features for UI
type = "New Feature" AND labels = "ui" ORDER BY created DESC
```

## 📊 Expected Response Format

When listing issues, you'll receive responses in this format:

```json
{
  "success": true,
  "data": [
    {
      "key": "MYP-1",
      "id": "10001",
      "summary": "[UI] Enhanced Component Implementation",
      "description": "Implement enhanced UI component with accessibility features...",
      "status": "In Progress",
      "priority": "High",
      "issueType": "Story",
      "assignee": "John Doe",
      "reporter": "Jane Smith",
      "created": "2025-01-01T10:00:00.000Z",
      "updated": "2025-01-15T14:30:00.000Z",
      "labels": ["ui", "enhancement", "accessibility"],
      "components": ["Frontend", "UI"],
      "project": {
        "key": "MYP",
        "name": "My Project"
      },
      "acceptanceCriteria": [
        "Component should be keyboard accessible",
        "Include loading states",
        "Support responsive design"
      ]
    }
  ],
  "total": 1,
  "maxResults": 50
}
```

## 🛠️ Troubleshooting Current Issues

### Fix MCP Server Issues

1. **Install Missing Dependencies**:
```powershell
cd "C:\Priyanka\projects\mcp-server-atlassian-jira-main\mcp-server-atlassian-jira-main"
npm install
```

2. **Create Missing Utility Files**:
The server expects `./utils/logger.util.js` - this might need to be created or the import path updated.

3. **Configure JIRA Connection**:
Ensure your MCP server has proper JIRA credentials and server configuration.

### Alternative: Direct JIRA API

If the MCP server continues to have issues, you can connect directly to JIRA:

```javascript
// Direct JIRA REST API call
const response = await fetch('https://your-jira-instance.atlassian.net/rest/api/3/search', {
  method: 'POST',
  headers: {
    'Authorization': 'Basic ' + btoa('email:api_token'),
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    jql: 'ORDER BY created DESC',
    maxResults: 50
  })
});
```

## 🎯 Quick Start Commands

Once everything is working, these commands will list your issues:

```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:3002/api/health"

# List recent issues
Invoke-RestMethod -Uri "http://localhost:3002/api/jira/issues/search" -Method POST -ContentType "application/json" -Body '{"jql": "ORDER BY created DESC", "maxResults": 10}'

# List your assigned issues
Invoke-RestMethod -Uri "http://localhost:3002/api/jira/issues/search" -Method POST -ContentType "application/json" -Body '{"jql": "assignee = currentUser()", "maxResults": 20}'

# List UI issues
Invoke-RestMethod -Uri "http://localhost:3002/api/jira/issues/search" -Method POST -ContentType "application/json" -Body '{"jql": "summary ~ \"[UI]\"", "maxResults": 15}'
```

## 🔮 Next Steps

1. **Fix MCP Server Dependencies**: Resolve the missing utility modules
2. **Configure JIRA Connection**: Set up proper JIRA server credentials
3. **Test Issue Fetching**: Verify you can fetch issues successfully
4. **Use React Interface**: Access the web interface for easier issue management

---

**Once the MCP server is properly configured, you'll be able to seamlessly list, search, and manage JIRA issues for UI development!** 🎉
