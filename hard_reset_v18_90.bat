@echo off
echo ==========================================
echo   Morgan OS - Hard Reset Tool
echo ==========================================
echo.
echo 1. Stopping any running python servers...
taskkill /IM python.exe /F 2>nul
echo.
echo 2. Clearing local storage token (in browser console manually if needed)
echo    Run: localStorage.clear()
echo.
echo 3. Starting FRESH v18.90 server...
start http://localhost:8090/index_v18_90.html
python -m http.server 8090
pause
