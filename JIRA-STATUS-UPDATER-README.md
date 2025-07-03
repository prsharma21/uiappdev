# JIRA Status Updater

A flexible Node.js script for updating JIRA issue statuses via MCP server integration.

## 🎯 Features

- **Multiple Usage Modes**: Command line, interactive, and batch processing
- **Input Validation**: Validates JIRA issue keys and status names
- **Error Handling**: Comprehensive error handling with detailed messages
- **Batch Processing**: Update multiple issues from a configuration file
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **PowerShell Integration**: Includes PowerShell wrapper for Windows users

## 📋 Prerequisites

- Node.js installed on your system
- MCP server running on `http://localhost:8080`
- Valid JIRA credentials configured in the MCP server
- Network access to your JIRA instance

## 🚀 Installation

1. Ensure all files are in your project directory:
   - `jira-status-updater.js` (main script)
   - `jira-update.ps1` (PowerShell wrapper)
   - `batch-updates-sample.json` (sample batch configuration)

2. Install required dependencies:
   ```bash
   npm install axios
   ```

## 📖 Usage

### Command Line Mode

Update a single issue directly:

```bash
# Node.js
node jira-status-updater.js SCRUM-2 "In Progress"
node jira-status-updater.js PROJ-123 "Done"

# PowerShell (Windows)
.\jira-update.ps1 SCRUM-2 "In Progress"
.\jira-update.ps1 PROJ-123 "Done"
```

### Interactive Mode

Start the interactive prompt:

```bash
# Node.js
node jira-status-updater.js

# PowerShell (Windows)
.\jira-update.ps1 -Interactive
```

The interactive mode will guide you through:
1. Entering the JIRA issue key
2. Selecting the target status from a menu
3. Confirming the update

### Batch Mode

Update multiple issues from a configuration file:

```bash
# Node.js
node jira-status-updater.js --batch batch-updates-sample.json

# PowerShell (Windows)
.\jira-update.ps1 -BatchFile batch-updates-sample.json
```

### Help

Display usage information:

```bash
# Node.js
node jira-status-updater.js --help

# PowerShell (Windows)
.\jira-update.ps1 -Help
```

## 📊 Valid Status Values

- **To Do** - Initial state for new issues
- **In Progress** - Work has started
- **In Review** - Code/work is under review
- **Testing** - In testing phase
- **Done** - Work completed
- **Blocked** - Work is blocked
- **Cancelled** - Work was cancelled

## 🔧 Batch Configuration Format

Create a JSON file with the following structure:

```json
{
  "updates": [
    {
      "issueKey": "SCRUM-1",
      "targetStatus": "In Progress",
      "comment": "Moving to in progress - development started"
    },
    {
      "issueKey": "SCRUM-2", 
      "targetStatus": "In Review",
      "comment": "Code complete, ready for review"
    },
    {
      "issueKey": "SCRUM-3",
      "targetStatus": "Done",
      "comment": "Testing complete, deployment successful"
    }
  ],
  "settings": {
    "delayBetweenUpdates": 1000,
    "continueOnError": true,
    "logResults": true
  }
}
```

## 🛠️ Configuration

### MCP Server Configuration

Ensure your MCP server is configured with:
- JIRA base URL
- Valid authentication credentials
- Appropriate permissions for status transitions

### Environment Variables (Optional)

You can set these environment variables:

```bash
# MCP server URL (default: http://localhost:8080)
export MCP_SERVER_URL=http://localhost:8080

# Request timeout in milliseconds (default: 30000)
export MCP_REQUEST_TIMEOUT=30000
```

## 🔍 Troubleshooting

### Common Issues

1. **"Invalid issue key format"**
   - Ensure issue key follows format: `PROJECT-123`
   - Use uppercase letters for project key

2. **"Invalid status name"**
   - Check that status exists in your JIRA workflow
   - Use exact status names (case-sensitive)

3. **"MCP server not responding"**
   - Verify MCP server is running on the configured port
   - Check network connectivity
   - Ensure JIRA credentials are properly configured

4. **"Permission denied"**
   - Verify your JIRA user has permission to transition issues
   - Check if the transition is allowed in the workflow

### Debug Mode

Enable detailed logging by setting the `DEBUG` environment variable:

```bash
# Linux/macOS
DEBUG=true node jira-status-updater.js SCRUM-2 "In Progress"

# Windows PowerShell
$env:DEBUG="true"; node jira-status-updater.js SCRUM-2 "In Progress"
```

## 📈 Examples

### Update Single Issue
```bash
node jira-status-updater.js SCRUM-2 "In Progress"
```

### Batch Update
```bash
node jira-status-updater.js --batch updates.json
```

### Interactive Session
```bash
node jira-status-updater.js
# Follow the prompts to enter issue key and select status
```

### PowerShell Examples
```powershell
# Direct update
.\jira-update.ps1 SCRUM-2 "Done"

# Interactive mode
.\jira-update.ps1 -Interactive

# Batch processing
.\jira-update.ps1 -BatchFile batch-updates.json
```

## 🧪 Testing

Test the script with a known issue:

```bash
# Test with an existing issue
node jira-status-updater.js SCRUM-1 "In Progress"

# Test interactive mode
node jira-status-updater.js
```

## 📁 File Structure

```
project/
├── jira-status-updater.js        # Main Node.js script
├── jira-update.ps1               # PowerShell wrapper
├── batch-updates-sample.json     # Sample batch configuration
├── README.md                     # This file
└── package.json                  # Dependencies
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Related Scripts

- `update-jira-status-fixed.js` - Original status update implementation
- `update-scrum-*.js` - Specific issue update scripts
- `discover-mcp-tools.js` - MCP server tool discovery

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Verify MCP server configuration
3. Review JIRA workflow settings
4. Check network connectivity

---

*This script is part of the JIRA-driven development workflow system.*
