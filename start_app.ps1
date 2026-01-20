Start-Process -FilePath "python" -ArgumentList "-m uvicorn main:app --reload --host 0.0.0.0 --port 8000" -WorkingDirectory "backend" -WindowStyle Normal
Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory "frontend" -WindowStyle Normal
Write-Host "Servers starting in new windows..."
