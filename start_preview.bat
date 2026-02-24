@echo off
echo ==========================================
echo   Morgan OS Local Preview Server (Debugging)
echo ==========================================
echo.
echo Starting server at http://localhost:8000...
echo.

:: Try starting on port 8000 first, it's safer
start http://localhost:8000

:: Start the Python HTTP server and keep window open on error
python -m http.server 8000
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Server failed to start!
    echo Maybe Python is not installed or not in PATH?
    echo.
    pause
)
pause
