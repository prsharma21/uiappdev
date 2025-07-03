# PowerShell script to update JIRA status using MCP server
Write-Host "🔄 Update JIRA Issue Status via MCP Server" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# Test updating SCRUM-3 status to In Progress
Write-Host "📋 Updating SCRUM-3 status to 'In Progress'..." -ForegroundColor Yellow

try {
    $body = @{ 
        issueKey = "SCRUM-3"
        targetStatus = "In Progress" 
    } | ConvertTo-Json
    
    Write-Host "Request body: $body" -ForegroundColor Gray
    
    $result = Invoke-RestMethod -Uri "http://localhost:8080/tools/update_jira_status" -Method POST -ContentType "application/json" -Body $body -TimeoutSec 15
    
    Write-Host "✅ Response received!" -ForegroundColor Green
    Write-Host "Raw response:" -ForegroundColor Cyan
    Write-Host ($result | ConvertTo-Json -Depth 3) -ForegroundColor White
    
    if ($result.result -and $result.result.content -and $result.result.content[0]) {
        $updateResult = $result.result.content[0].text
        Write-Host "📊 Update Result:" -ForegroundColor Yellow
        Write-Host "=================" -ForegroundColor Yellow
        Write-Host $updateResult -ForegroundColor White
        
        if ($updateResult -match "success|updated|transitioned") {
            Write-Host "🎉 Status update appears successful!" -ForegroundColor Green
        } elseif ($updateResult -match "error") {
            Write-Host "❌ Status update failed" -ForegroundColor Red
        } else {
            Write-Host "⚠️ Status update result unclear" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️ Unexpected response format" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔍 Now let's check the updated status..." -ForegroundColor Cyan

# Check the updated status
try {
    $checkBody = @{ issueKey = "SCRUM-3" } | ConvertTo-Json
    $checkResult = Invoke-RestMethod -Uri "http://localhost:8080/tools/get_jira_issue" -Method POST -ContentType "application/json" -Body $checkBody -TimeoutSec 10
    
    if ($checkResult.result -and $checkResult.result.content -and $checkResult.result.content[0]) {
        $issueData = $checkResult.result.content[0].text
        Write-Host "📋 Current SCRUM-3 Status:" -ForegroundColor Green
        Write-Host "=========================" -ForegroundColor Green
        Write-Host $issueData -ForegroundColor White
    }
} catch {
    Write-Host "❌ Error checking status: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Status update test completed!" -ForegroundColor Green
