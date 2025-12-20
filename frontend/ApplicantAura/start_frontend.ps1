# Frontend Startup Script
cd $PSScriptRoot
$Env:VITE_REACT_APP_BASE_URL = "http://localhost:5000/api/v1"
Write-Host "Starting Vite frontend server..." -ForegroundColor Green
Write-Host "Frontend will be available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "API Base URL: $Env:VITE_REACT_APP_BASE_URL" -ForegroundColor Yellow
npm run dev






