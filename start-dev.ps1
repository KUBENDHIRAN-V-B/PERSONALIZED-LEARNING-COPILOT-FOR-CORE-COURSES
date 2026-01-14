# Start both frontend and backend servers
Write-Host "Starting Personalized Learning Copilot..." -ForegroundColor Green
Write-Host ""

# Start backend in background
Write-Host "Starting backend server..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location "backend"
    npm run dev
}

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting frontend server..." -ForegroundColor Yellow
Set-Location "frontend"
npm start