# EDUVERSE Escrow System - Start Script (PowerShell)

Write-Host "`n--- Starting EDUVERSE Escrow System ---" -ForegroundColor Cyan

# 1. Start Hardhat Node
Write-Host "[1/4] Launching Local Blockchain (Hardhat)..." -ForegroundColor Yellow
$nodeProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd smart-contract; npx hardhat node" -PassThru

# Wait for node to be fully ready
Write-Host "Waiting for blockchain to initialize..." -ForegroundColor DarkGray
$retryCount = 0
$nodeUp = $false
while ($retryCount -lt 30) {
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient("127.0.0.1", 8545)
        $tcp.Close()
        $nodeUp = $true
        break
    } catch {
        Start-Sleep -Seconds 1
        $retryCount++
    }
}

if (-not $nodeUp) {
    Write-Host "!! Error: Local blockchain failed to start on port 8545. !!" -ForegroundColor Red
    exit
}
Write-Host ">> Blockchain is ready!" -ForegroundColor Green

# 2. Deploy Smart Contract
Write-Host "[2/4] Deploying Smart Contract to Localhost..." -ForegroundColor Yellow
Set-Location smart-contract
$deployOutput = npx hardhat run scripts/deploy.js --network localhost | Out-String
Set-Location ..
$contractAddr = $null
if ($deployOutput -match "(0x[a-fA-F0-9]{40})") {
    $contractAddr = $matches[1]
}

if (-not $contractAddr) {
    Write-Host "!! Error: Failed to deploy contract. Make sure no other hardhat nodes are running on port 8545 !!" -ForegroundColor Red
    Write-Host $deployOutput
    Write-Host "Stopping script."
    exit
} else {
    Write-Host ">> Successfully deployed to: $contractAddr" -ForegroundColor Green
    
    # Auto-Sync Contract Address in frontend
    $appJsPath = "frontend/app.js"
    $appJsContent = Get-Content $appJsPath
    $appJsContent = $appJsContent -replace 'const CONTRACT_ADDRESS = ".*";', ("const CONTRACT_ADDRESS = `"$contractAddr`";")
    Set-Content -Path $appJsPath -Value $appJsContent
    Write-Host ">> Auto-synced contract address into frontend/app.js" -ForegroundColor Green
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
