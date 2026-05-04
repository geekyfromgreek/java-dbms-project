@echo off
chcp 65001 >nul 2>&1

REM Set JAVA_HOME to JDK (not JRE) for compilation
if exist "C:\Program Files\Zulu\zulu-8\bin\javac.exe" (
    set "JAVA_HOME=C:\Program Files\Zulu\zulu-8"
)

echo ==========================================
echo   Starting Student DBMS (Java Version)
echo ==========================================
echo.

REM Get the directory where start.bat lives
set "PROJECT_DIR=%~dp0"

REM Start Java Backend using Maven Wrapper
echo [1/2] Launching Java Backend (Spring Boot + JDBC)...
start "Java Backend" cmd /k "set "JAVA_HOME=C:\Program Files\Zulu\zulu-8" && cd /d "%PROJECT_DIR%backend" && echo. && echo Starting Spring Boot Server... && echo. && mvnw.cmd spring-boot:run"

REM Wait for backend to begin initializing
timeout /t 3 /nobreak >nul

REM Start React Frontend
echo [2/2] Launching React Frontend (Vite)...
start "React Frontend" cmd /k "cd /d "%PROJECT_DIR%frontend" && echo. && echo Starting React Dev Server... && echo. && npm run dev"

echo.
echo ==========================================
echo   Both servers are starting up!
echo ==========================================
echo.
echo   Java Backend:    http://localhost:5000
echo   React Frontend:  http://localhost:5173
echo.
echo   (Make sure MySQL is running on localhost:3306)
echo.
echo   Press any key to close this launcher window...
pause >nul
