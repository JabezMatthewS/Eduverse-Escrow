# EDUVERSE Escrow System - Stop Script (PowerShell)

Write-Host "`n--- Stopping EDUVERSE Escrow System ---" -ForegroundColor Cyan

function Stop-PortProcess {
    param (
        [int]$Port,
        [string]$Name
    )
    $pidToKill = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1
    if ($pidToKill) {
        Write-Host ">> Stopping $Name (Port $Port, PID $pidToKill)..." -ForegroundColor Yellow
        Stop-Process -Id $pidToKill -Force
    } else {
        Write-Host ">> No process found on Port $Port ($Name)." -ForegroundColor DarkGray
    }
}

# Kill Hardhat
Stop-PortProcess -Port 8545 -Name "Hardhat Node"

# Kill Backend
Stop-PortProcess -Port 3000 -Name "Node.js Backend"

# Kill Frontend (Python Default)
Stop-PortProcess -Port 8000 -Name "Python Frontend"

Write-Host "`n--- All processes cleared. System stopped. ---" -ForegroundColor Green
Write-Host "--- You can now close the secondary terminal windows. ---`n"
