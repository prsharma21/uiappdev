# Simple PowerShell test for JIRA search (user's exact command)
Write-Host "🔍 Testing JIRA Search (User's Exact Command)" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

try {
    Write-Host "⏳ Running user's exact command..." -ForegroundColor Yellow
    Write-Host "Command: `$body = @{ jql = `"project is not EMPTY ORDER BY updated DESC`"; maxResults = 20 } | ConvertTo-Json; `$result = Invoke-RestMethod -Uri `"http://localhost:8080/tools/search_jira_issues`" -Method POST -ContentType `"application/json`" -Body `$body; `$result.result.content[0].text" -ForegroundColor Gray
    Write-Host ""
    
    # User's exact command
    $body = @{ jql = "project is not EMPTY ORDER BY updated DESC"; maxResults = 20 } | ConvertTo-Json
    $result = Invoke-RestMethod -Uri "http://localhost:8080/tools/search_jira_issues" -Method POST -ContentType "application/json" -Body $body
    $jiraText = $result.result.content[0].text
    
    Write-Host "✅ Success! Got JIRA data:" -ForegroundColor Green
    Write-Host "=========================" -ForegroundColor Green
    Write-Host $jiraText -ForegroundColor White
    
    Write-Host ""
    Write-Host "🔍 Attempting to parse as JSON..." -ForegroundColor Yellow
    
    try {
        $jiraData = $jiraText | ConvertFrom-Json
        
        if ($jiraData.issues) {
            Write-Host "🎯 Found $($jiraData.issues.Count) issues:" -ForegroundColor Green
            Write-Host ""
            
            for ($i = 0; $i -lt [Math]::Min(5, $jiraData.issues.Count); $i++) {
                $issue = $jiraData.issues[$i]
                Write-Host "$($i + 1). 🎫 $($issue.key): $($issue.fields.summary)" -ForegroundColor White
                if ($issue.fields.status) {
                    Write-Host "   📊 Status: $($issue.fields.status.name)" -ForegroundColor Cyan
                }
                if ($issue.fields.priority) {
                    Write-Host "   🔥 Priority: $($issue.fields.priority.name)" -ForegroundColor Yellow
                }
                Write-Host ""
            }
            
            Write-Host "📊 Total issues: $($jiraData.issues.Count)" -ForegroundColor Green
            if ($jiraData.total) {
                Write-Host "📈 Total available: $($jiraData.total)" -ForegroundColor Green
            }
        } else {
            Write-Host "⚠️ No issues array found in response" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "ℹ️ Could not parse as JSON, raw data:" -ForegroundColor Yellow
        Write-Host $jiraText -ForegroundColor White
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Make sure MCP server is running on port 8080" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Test completed!" -ForegroundColor Green
