# Backend Startup Script
cd $PSScriptRoot
.\.venv\Scripts\activate
$Env:PYTHONPATH = ".."
Write-Host "Starting Flask backend server..." -ForegroundColor Green
Write-Host "Backend will be available at: http://localhost:5000" -ForegroundColor Cyan
python run.py






