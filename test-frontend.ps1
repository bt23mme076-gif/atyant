# Frontend Test Script
# Run with: .\test-frontend.ps1

$FRONTEND_URL = "https://www.atyant.in"

Write-Host "`n=== Testing Frontend at $FRONTEND_URL ===`n" -ForegroundColor Cyan

# Test 1: Check if frontend is loading
Write-Host "Test 1: Frontend Loading..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $FRONTEND_URL -Method Get -ErrorAction Stop
    Write-Host "  PASS - Frontend is accessible" -ForegroundColor Green
    Write-Host "  Status: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "  FAIL - Cannot reach frontend" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Test 2: Check what API URL the frontend is using
Write-Host "`nTest 2: Checking API Configuration..." -ForegroundColor Yellow
try {
    $html = $response.Content
    
    # Look for API_URL or api.atyant.in in the bundled JS
    if ($html -match "api\.atyant\.in") {
        Write-Host "  PASS - Frontend configured to use api.atyant.in" -ForegroundColor Green
    } elseif ($html -match "localhost:5000|localhost:3000") {
        Write-Host "  FAIL - Frontend still using localhost URLs" -ForegroundColor Red
        Write-Host "  Action: Vercel needs to redeploy with new build" -ForegroundColor Yellow
    } else {
        Write-Host "  WARN - Could not detect API URL in HTML" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  WARN - Could not parse HTML" -ForegroundColor Yellow
}

# Test 3: Check Vercel deployment
Write-Host "`nTest 3: Checking Vercel Deployment..." -ForegroundColor Yellow
try {
    $headers = $response.Headers
    if ($headers["x-vercel-id"]) {
        Write-Host "  INFO - Vercel Deployment ID: $($headers['x-vercel-id'])" -ForegroundColor Gray
    }
    if ($headers["x-vercel-cache"]) {
        Write-Host "  INFO - Cache Status: $($headers['x-vercel-cache'])" -ForegroundColor Gray
    }
} catch {
    Write-Host "  WARN - Could not get Vercel headers" -ForegroundColor Yellow
}

# Test 4: Check if JS bundles are fresh
Write-Host "`nTest 4: Checking Build Freshness..." -ForegroundColor Yellow
try {
    # Look for index.js or main.js in the HTML
    if ($html -match 'src="(/assets/[^"]+\.js)"') {
        $jsFile = $matches[1]
        Write-Host "  INFO - Found JS bundle: $jsFile" -ForegroundColor Gray
        
        # Try to fetch the JS file
        $jsUrl = "$FRONTEND_URL$jsFile"
        $jsResponse = Invoke-WebRequest -Uri $jsUrl -Method Get -ErrorAction Stop
        
        # Check if it contains the new API URL
        if ($jsResponse.Content -match "api\.atyant\.in") {
            Write-Host "  PASS - JS bundle contains api.atyant.in" -ForegroundColor Green
        } else {
            Write-Host "  FAIL - JS bundle does not contain api.atyant.in" -ForegroundColor Red
            Write-Host "  Action: Force redeploy on Vercel" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "  WARN - Could not check JS bundle" -ForegroundColor Yellow
}

# Test 5: Simulate API call from browser
Write-Host "`nTest 5: Testing API Call with CORS..." -ForegroundColor Yellow
try {
    $headers = @{
        "Origin" = $FRONTEND_URL
        "Referer" = $FRONTEND_URL
    }
    $response = Invoke-WebRequest -Uri "https://api.atyant.in/api/health" -Method Get -Headers $headers -ErrorAction Stop
    
    $corsHeader = $response.Headers["Access-Control-Allow-Origin"]
    if ($corsHeader) {
        Write-Host "  PASS - CORS header present: $corsHeader" -ForegroundColor Green
    } else {
        Write-Host "  FAIL - No CORS header in response" -ForegroundColor Red
    }
} catch {
    Write-Host "  FAIL - API call failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "`n=== Diagnosis ===" -ForegroundColor Cyan
Write-Host "`nCommon Issues:"
Write-Host "  1. Vercel serving old build"
Write-Host "     Fix: Go to Vercel dashboard and click 'Redeploy'"
Write-Host ""
Write-Host "  2. Environment variable not set in Vercel"
Write-Host "     Fix: Vercel Settings > Environment Variables"
Write-Host "     Add: VITE_API_URL = https://api.atyant.in"
Write-Host ""
Write-Host "  3. Browser cache"
Write-Host "     Fix: Hard refresh (Ctrl+Shift+R) or clear cache"
Write-Host ""
Write-Host "Check Vercel deployment at:"
Write-Host "  https://vercel.com/dashboard"
Write-Host ""
