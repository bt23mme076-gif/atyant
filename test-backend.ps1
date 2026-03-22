# Backend API Test Script for api.atyant.in
# Run with: .\test-backend.ps1

$API_URL = "https://api.atyant.in"

Write-Host "`n=== Testing Backend API at $API_URL ===`n" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "Test 1: Health Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/health" -Method Get -ErrorAction Stop
    Write-Host "  PASS - Health Check OK" -ForegroundColor Green
    Write-Host "  Status: $($response.status)" -ForegroundColor Gray
    Write-Host "  Uptime: $([math]::Round($response.uptime, 2))s" -ForegroundColor Gray
} catch {
    Write-Host "  FAIL - Health Check Failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Profile Route
Write-Host "`nTest 2: Profile Route..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_URL/api/profile/me" -Method Get -ErrorAction Stop
    Write-Host "  FAIL - Should require authentication" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "  PASS - Route exists (requires auth)" -ForegroundColor Green
    } elseif ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "  FAIL - Route NOT FOUND (code outdated)" -ForegroundColor Red
    } else {
        Write-Host "  WARN - Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

# Test 3: Auth Route
Write-Host "`nTest 3: Auth Route..." -ForegroundColor Yellow
try {
    $body = @{ email = "test@test.com"; password = "wrong" } | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "$API_URL/api/auth/login" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "  FAIL - Should reject invalid credentials" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400 -or $_.Exception.Response.StatusCode -eq 401) {
        Write-Host "  PASS - Route exists" -ForegroundColor Green
    } elseif ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "  FAIL - Route NOT FOUND" -ForegroundColor Red
    } else {
        Write-Host "  WARN - Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

# Test 4: Mentor Route
Write-Host "`nTest 4: Mentor Route..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/users/mentors?limit=1" -Method Get -ErrorAction Stop
    Write-Host "  PASS - Mentor route OK" -ForegroundColor Green
    Write-Host "  Returned: $($response.Count) mentor(s)" -ForegroundColor Gray
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "  FAIL - Route NOT FOUND" -ForegroundColor Red
    } else {
        Write-Host "  FAIL - Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 5: Response Time
Write-Host "`nTest 5: Response Time..." -ForegroundColor Yellow
try {
    $responseTime = (Measure-Command { Invoke-RestMethod -Uri "$API_URL/api/health" -Method Get }).TotalMilliseconds
    if ($responseTime -lt 500) {
        Write-Host "  PASS - $([math]::Round($responseTime, 0))ms (Good)" -ForegroundColor Green
    } else {
        Write-Host "  WARN - $([math]::Round($responseTime, 0))ms (Slow)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  FAIL - Could not measure" -ForegroundColor Red
}

# Summary
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "`nIf you see FAIL on profile/auth routes:"
Write-Host "  - Your VPS backend code is outdated"
Write-Host "  - SSH to VPS and run: git pull, npm install, restart"
Write-Host "`nIf health check fails:"
Write-Host "  - Backend is not running"
Write-Host "  - Check docker/pm2/systemd status on VPS"
Write-Host ""
