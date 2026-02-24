@echo off
echo ==========================================
echo   Morgan OS FINAL RESCUE (v18.90)
echo ==========================================
echo.
echo Starting fresh server on port 8090...
echo Opening index_v18_90.html...
echo.

:: Open the specific new file
start http://localhost:8090/index_v18_90.html

:: Start Python server on port 8090
python -m http.server 8090
