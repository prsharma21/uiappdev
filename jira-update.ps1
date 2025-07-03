# JIRA Status Updater PowerShell Wrapper
# Usage: .\jira-update.ps1 SCRUM-2 "In Progress"

param(
    [Parameter(Position=0)]
    [string]$IssueKey,
    
    [Parameter(Position=1)]
    [string]$TargetStatus,
    
    [Parameter()]
    [string]$BatchFile,
    
    [switch]$Interactive,
    
    [switch]$Help
)

function Show-Help {
    Write-Host @"
🎯 JIRA Status Updater - PowerShell Wrapper
===========================================

Update JIRA issue statuses using the MCP server backend.

USAGE:
  .\jira-update.ps1 <IssueKey> <TargetStatus>     # Direct update
  .\jira-update.ps1 -Interactive                  # Interactive mode  
  .\jira-update.ps1 -BatchFile updates.json       # Batch mode
  .\jira-update.ps1 -Help                         # Show this help

EXAMPLES:
  .\jira-update.ps1 SCRUM-2 "In Progress"
  .\jira-update.ps1 PROJ-123 "Done"
  .\jira-update.ps1 -Interactive
  .\jira-update.ps1 -BatchFile batch-updates-sample.json

VALID STATUSES:
  • To Do
  • In Progress  
  • In Review
  • Testing
  • Done
  • Blocked
  • Cancelled

REQUIREMENTS:
  • Node.js installed
  • MCP server running on http://localhost:8080
  • Valid JIRA credentials configured in MCP server
"@
}

function Test-Prerequisites {
    # Check if Node.js is installed
    try {
        $nodeVersion = node --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
        } else {
            throw "Node.js not found"
        }
    } catch {
        Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
        Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }
    
    # Check if the main script exists
    if (-not (Test-Path "jira-status-updater.js")) {
        Write-Host "❌ jira-status-updater.js not found in current directory" -ForegroundColor Red
        exit 1
    }
    
    # Check MCP server availability (optional)
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 5 -ErrorAction SilentlyContinue
        Write-Host "✅ MCP server is reachable" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Warning: MCP server may not be running on http://localhost:8080" -ForegroundColor Yellow
        Write-Host "   Please ensure the MCP server is started before running updates" -ForegroundColor Yellow
    }
}

function Invoke-JiraUpdate {
    param($Arguments)
    
    Write-Host "🚀 Starting JIRA status update..." -ForegroundColor Cyan
    
    try {
        # Execute the Node.js script
        $process = Start-Process -FilePath "node" -ArgumentList $Arguments -NoNewWindow -Wait -PassThru
        
        if ($process.ExitCode -eq 0) {
            Write-Host "🎉 JIRA update completed successfully!" -ForegroundColor Green
        } else {
            Write-Host "❌ JIRA update failed with exit code: $($process.ExitCode)" -ForegroundColor Red
            exit $process.ExitCode
        }
    } catch {
        Write-Host "❌ Error executing JIRA update: $_" -ForegroundColor Red
        exit 1
    }
}

# Main execution
try {
    Write-Host "🎯 JIRA Status Updater" -ForegroundColor Cyan
    Write-Host "======================" -ForegroundColor Cyan
    Write-Host ""
    
    # Show help if requested
    if ($Help) {
        Show-Help
        exit 0
    }
    
    # Check prerequisites
    Test-Prerequisites
    Write-Host ""
    
    # Determine execution mode
    if ($BatchFile) {
        # Batch mode
        if (-not (Test-Path $BatchFile)) {
            Write-Host "❌ Batch file not found: $BatchFile" -ForegroundColor Red
            exit 1
        }
        Write-Host "📁 Running batch update from: $BatchFile" -ForegroundColor Yellow
        Invoke-JiraUpdate @("jira-status-updater.js", "--batch", $BatchFile)
        
    } elseif ($Interactive) {
        # Interactive mode
        Write-Host "🎮 Starting interactive mode..." -ForegroundColor Yellow
        Invoke-JiraUpdate @("jira-status-updater.js")
        
    } elseif ($IssueKey -and $TargetStatus) {
        # Direct update mode
        Write-Host "🎯 Updating $IssueKey to '$TargetStatus'" -ForegroundColor Yellow
        Invoke-JiraUpdate @("jira-status-updater.js", $IssueKey, $TargetStatus)
        
    } else {
        # Invalid arguments - show usage
        Write-Host "❌ Invalid arguments provided" -ForegroundColor Red
        Write-Host ""
        Write-Host "USAGE:" -ForegroundColor Yellow
        Write-Host "  .\jira-update.ps1 <IssueKey> <TargetStatus>"
        Write-Host "  .\jira-update.ps1 -Interactive"
        Write-Host "  .\jira-update.ps1 -BatchFile <file>"
        Write-Host "  .\jira-update.ps1 -Help"
        Write-Host ""
        Write-Host "Use -Help for detailed information"
        exit 1
    }
    
} catch {
    Write-Host "❌ Unexpected error: $_" -ForegroundColor Red
    exit 1
}
