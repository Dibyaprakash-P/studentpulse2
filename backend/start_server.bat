@echo off
echo ============================================
echo   Student Pulse Backend Server
echo ============================================
echo.

cd /d "%~dp0"

echo Starting server on 0.0.0.0:8000 (accessible from all devices on network)...
echo.

REM Show the machine's IP addresses so users know what to enter in the app
echo Your IP addresses (use one of these in the app):
echo ------------------------------------------------
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do echo   %%a
echo ------------------------------------------------
echo.

python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

pause
