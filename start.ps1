# EDUVERSE Escrow System - Start Script (PowerShell)

Write-Host "`n--- Starting EDUVERSE Escrow System ---" -ForegroundColor Cyan

# 1. Start Hardhat Node
Write-Host "[1/4] Launching Local Blockchain (Hardhat)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd smart-contract; npx hardhat node"

# Wait for node to be ready
Start-Sleep -Seconds 5

# 2. Deploy Smart Contract
Write-Host "[2/4] Deploying Smart Contract to Localhost..." -ForegroundColor Yellow
$deployOutput = Set-Location smart-contract; npx hardhat run scripts/deploy.js --network localhost; Set-Location ..
$contractAddr = ($deployOutput | Select-String "Escrow deployed to: (0x[a-fA-F0-9]{40})").Matches.Groups[1].Value

if (-not $contractAddr) {
    Write-Host "!! Error: Could not find deployed contract address in output. !!" -ForegroundColor Red
    Write-Host $deployOutput
    $contractAddr = "CHECK_TERMINAL_LOGS"
} else {
    Write-Host ">> Successfully deployed to: $contractAddr" -ForegroundColor Green
}

# 3. Start Backend
Write-Host "[3/4] Starting Express Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; node server.js"

# 4. Start Frontend
Write-Host "[4/4] Starting Frontend Python Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; python -m http.server 8000"

# Dashboard Display
Clear-Host
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "     EDUVERSE ESCROW SYSTEM IS NOW RUNNING" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "`n[ DETAILS ]"
Write-Host "  Contract Address:   $contractAddr" -ForegroundColor Green
Write-Host "  Local RPC URL:     http://127.0.0.1:8545"
Write-Host "  Backend API:       http://localhost:3000"
Write-Host "  Frontend App:      http://localhost:8000" -ForegroundColor White -BackgroundColor Blue

Write-Host "`n[ METAMASK CONFIG ]"
Write-Host "  Network Name:      Hardhat Localhost"
Write-Host "  New RPC URL:       http://127.0.0.1:8545"
Write-Host "  Chain ID:          1337"
Write-Host "  Currency Symbol:   ETH"

Write-Host "`n--- Keep the 3 new terminal windows open! ---" -ForegroundColor DarkGray
Write-Host "--- Use ./stop.ps1 to shut everything down. ---`n" -ForegroundColor DarkGray
