# Simple PowerShell test using user's exact command format
Write-Host "Testing JIRA Status Update" -ForegroundColor Cyan

# Step 1: Create the request body
$body = @{ issueKey = "SCRUM-3"; targetStatus = "In Progress" } | ConvertTo-Json
Write-Host "Request body: $body"

# Step 2: Make the request
Write-Host "Making request to update_jira_status..."
$result = Invoke-RestMethod -Uri "http://localhost:8080/tools/update_jira_status" -Method POST -ContentType "application/json" -Body $body

# Step 3: Extract the result text
$resultText = $result.result.content[0].text
Write-Host "Result: $resultText"
