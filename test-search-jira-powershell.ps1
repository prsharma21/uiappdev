# PowerShell test script for JIRA issues search via MCP server
# Based on the user's example

Write-Host "🔍 Testing JIRA Issues Search via MCP Server (PowerShell)" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "🌐 MCP Server: http://localhost:8080" -ForegroundColor Green
Write-Host "🔧 Tool: search_jira_issues" -ForegroundColor Green
Write-Host "📅 Test Time: $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss.fffZ')" -ForegroundColor Green
Write-Host ""

try {
    Write-Host "🔎 Test 1: Search all projects (user's example)" -ForegroundColor Yellow
    Write-Host "================================================" -ForegroundColor Yellow
    
    # User's example query
    $body1 = @{ 
        jql = "project is not EMPTY ORDER BY updated DESC"
        maxResults = 20 
    } | ConvertTo-Json
    
    Write-Host "🔍 JQL Query: project is not EMPTY ORDER BY updated DESC" -ForegroundColor White
    Write-Host "📊 Max Results: 20" -ForegroundColor White
    Write-Host "⏳ Making request..." -ForegroundColor Yellow
    
    $result1 = Invoke-RestMethod -Uri "http://localhost:8080/tools/search_jira_issues" -Method POST -ContentType "application/json" -Body $body1 -TimeoutSec 15
    
    if ($result1.result -and $result1.result.content -and $result1.result.content[0]) {
        $jiraData1 = $result1.result.content[0].text
        Write-Host "✅ JIRA Data Retrieved Successfully!" -ForegroundColor Green
        Write-Host "===================================" -ForegroundColor Green
        
        # Try to parse as JSON
        try {
            $jiraResponse1 = $jiraData1 | ConvertFrom-Json
            
            if ($jiraResponse1.issues -and $jiraResponse1.issues.Count -gt 0) {
                Write-Host "🎯 Found $($jiraResponse1.issues.Count) issues:" -ForegroundColor Green
                Write-Host ""
                
                for ($i = 0; $i -lt [Math]::Min(5, $jiraResponse1.issues.Count); $i++) {
                    $issue = $jiraResponse1.issues[$i]
                    Write-Host "$($i + 1). 🎫 $($issue.key): $($issue.fields.summary)" -ForegroundColor White
                    
                    if ($issue.fields.status) {
                        Write-Host "   📊 Status: $($issue.fields.status.name)" -ForegroundColor Cyan
                    }
                    if ($issue.fields.priority) {
                        Write-Host "   🔥 Priority: $($issue.fields.priority.name)" -ForegroundColor Yellow
                    }
                    if ($issue.fields.issuetype) {
                        Write-Host "   📋 Type: $($issue.fields.issuetype.name)" -ForegroundColor Blue
                    }
                    Write-Host ""
                }
                
                if ($jiraResponse1.issues.Count -gt 5) {
                    Write-Host "... and $($jiraResponse1.issues.Count - 5) more issues" -ForegroundColor Gray
                }
                
                Write-Host "📊 Summary:" -ForegroundColor Yellow
                Write-Host "   Total issues: $($jiraResponse1.issues.Count)" -ForegroundColor White
                if ($jiraResponse1.total) {
                    Write-Host "   Total available: $($jiraResponse1.total)" -ForegroundColor White
                }
            } else {
                Write-Host "📭 No issues found" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "ℹ️ JIRA data (not JSON format):" -ForegroundColor Yellow
            Write-Host $jiraData1 -ForegroundColor White
        }
    } elseif ($result1.error) {
        Write-Host "❌ MCP Error: $($result1.error.message)" -ForegroundColor Red
        if ($result1.error.code) {
            Write-Host "   Error Code: $($result1.error.code)" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️ Unexpected response format" -ForegroundColor Yellow
        Write-Host ($result1 | ConvertTo-Json -Depth 3) -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "🔎 Test 2: Search specific project" -ForegroundColor Yellow
    Write-Host "==================================" -ForegroundColor Yellow
    
    # Search for UI project specifically
    $body2 = @{ 
        jql = "project = 'UI' ORDER BY created DESC"
        maxResults = 10 
    } | ConvertTo-Json
    
    Write-Host "🔍 JQL Query: project = 'UI' ORDER BY created DESC" -ForegroundColor White
    Write-Host "📊 Max Results: 10" -ForegroundColor White
    Write-Host "⏳ Making request..." -ForegroundColor Yellow
    
    $result2 = Invoke-RestMethod -Uri "http://localhost:8080/tools/search_jira_issues" -Method POST -ContentType "application/json" -Body $body2 -TimeoutSec 10
    
    if ($result2.result -and $result2.result.content -and $result2.result.content[0]) {
        $jiraData2 = $result2.result.content[0].text
        
        try {
            $jiraResponse2 = $jiraData2 | ConvertFrom-Json
            
            if ($jiraResponse2.issues -and $jiraResponse2.issues.Count -gt 0) {
                Write-Host "🎯 Found $($jiraResponse2.issues.Count) UI project issues:" -ForegroundColor Green
                Write-Host ""
                
                foreach ($issue in $jiraResponse2.issues) {
                    Write-Host "🎫 $($issue.key): $($issue.fields.summary)" -ForegroundColor White
                    if ($issue.fields.status) {
                        Write-Host "   📊 $($issue.fields.status.name)" -ForegroundColor Cyan
                    }
                }
            } else {
                Write-Host "📭 No UI project issues found" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "ℹ️ UI project data (not JSON):" -ForegroundColor Yellow
            Write-Host $jiraData2 -ForegroundColor White
        }
    } else {
        Write-Host "❌ UI project search failed" -ForegroundColor Red
    }
        }
    } else {
        Write-Host "❌ UI project search failed" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "🔎 Test 3: Simple recent issues" -ForegroundColor Yellow
    Write-Host "==============================" -ForegroundColor Yellow
    
    # Simple search for recent issues
    $body3 = @{ 
        jql = "ORDER BY updated DESC"
        maxResults = 5 
    } | ConvertTo-Json
    
    Write-Host "🔍 JQL Query: ORDER BY updated DESC" -ForegroundColor White
    Write-Host "📊 Max Results: 5" -ForegroundColor White
    Write-Host "⏳ Making request..." -ForegroundColor Yellow
    
    $result3 = Invoke-RestMethod -Uri "http://localhost:8080/tools/search_jira_issues" -Method POST -ContentType "application/json" -Body $body3 -TimeoutSec 10
    
    if ($result3.result -and $result3.result.content -and $result3.result.content[0]) {
        $jiraData3 = $result3.result.content[0].text
        
        try {
            $jiraResponse3 = $jiraData3 | ConvertFrom-Json
            
            if ($jiraResponse3.issues -and $jiraResponse3.issues.Count -gt 0) {
                Write-Host "🎯 Latest $($jiraResponse3.issues.Count) issues:" -ForegroundColor Green
                Write-Host ""
                
                foreach ($issue in $jiraResponse3.issues) {
                    Write-Host "🎫 $($issue.key): $($issue.fields.summary)" -ForegroundColor White
                }
            }
        } catch {
            Write-Host "ℹ️ Recent issues data (not JSON):" -ForegroundColor Yellow
            Write-Host $jiraData3 -ForegroundColor White
        }
    }
    
} catch {
    Write-Host "❌ Connection Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Make sure MCP server is running on port 8080" -ForegroundColor Yellow
    Write-Host "💡 Verify JIRA MCP server is configured and connected" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 PowerShell JIRA Search Tests Completed!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
