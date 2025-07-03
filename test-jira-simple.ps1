# Simple PowerShell test for JIRA search
Write-Host "Testing JIRA Search via MCP Server" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

try {
    Write-Host "Making request..." -ForegroundColor Yellow
    
    $body = @{ jql = "project is not EMPTY ORDER BY updated DESC"; maxResults = 20 } | ConvertTo-Json
    $result = Invoke-RestMethod -Uri "http://localhost:8080/tools/search_jira_issues" -Method POST -ContentType "application/json" -Body $body
    $jiraText = $result.result.content[0].text
    
    Write-Host "Success! Got JIRA data:" -ForegroundColor Green
    Write-Host $jiraText
    
    $jiraData = $jiraText | ConvertFrom-Json
    
    if ($jiraData.issues) {
        Write-Host "Found issues: $($jiraData.issues.Count)" -ForegroundColor Green
        
        foreach ($issue in $jiraData.issues | Select-Object -First 3) {
            Write-Host "$($issue.key): $($issue.fields.summary)" -ForegroundColor White
        }
    }
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Test completed!" -ForegroundColor Green
