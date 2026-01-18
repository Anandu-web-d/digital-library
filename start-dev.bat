@echo off
REM IntelliLib Development Startup Script for Windows
REM This script starts all services for development

echo Starting IntelliLib Development Environment...

REM Start Backend
echo Starting Backend...
cd backend
start "IntelliLib Backend" cmd /k "npm run dev"
cd ..

timeout /t 3 /nobreak >nul

REM Start Frontend
echo Starting Frontend...
cd frontend
start "IntelliLib Frontend" cmd /k "npm run dev"
cd ..

timeout /t 2 /nobreak >nul

REM Start AI Service
echo Starting AI Service...
cd ai-services

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat
pip install -r requirements.txt >nul 2>&1
start "IntelliLib AI Service" cmd /k "python app.py"
cd ..

echo.
echo All services started!
echo.
echo Services:
echo    Backend:  http://localhost:5000
echo    Frontend: http://localhost:3000
echo    AI Service: http://localhost:8000
echo.
echo Close the command windows to stop services.

pause

