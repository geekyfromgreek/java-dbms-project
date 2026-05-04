@REM Maven Wrapper for Windows - Downloads and runs Maven automatically
@echo off
setlocal

@REM Point to JDK (not JRE) - required for compilation
if exist "C:\Program Files\Zulu\zulu-8\bin\javac.exe" (
    set "JAVA_HOME=C:\Program Files\Zulu\zulu-8"
)

set "MAVEN_VERSION=3.8.8"
set "MAVEN_DIR=%~dp0.mvn\maven"
set "MAVEN_BIN=%MAVEN_DIR%\apache-maven-%MAVEN_VERSION%\bin\mvn.cmd"
set "MAVEN_ZIP=%~dp0.mvn\wrapper\apache-maven-%MAVEN_VERSION%-bin.zip"
set "DOWNLOAD_URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/%MAVEN_VERSION%/apache-maven-%MAVEN_VERSION%-bin.zip"

@REM Check if Maven is already downloaded
if exist "%MAVEN_BIN%" goto runMaven

echo ============================================
echo   Maven not found. Downloading Maven %MAVEN_VERSION%...
echo   (This only happens once)
echo ============================================
echo.

@REM Download Maven using PowerShell
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Write-Host 'Downloading...' ; Invoke-WebRequest -Uri '%DOWNLOAD_URL%' -OutFile '%MAVEN_ZIP%'}"

if not exist "%MAVEN_ZIP%" (
    echo ERROR: Failed to download Maven. Check your internet connection.
    exit /B 1
)

echo Extracting Maven...
powershell -Command "& {Expand-Archive -Path '%MAVEN_ZIP%' -DestinationPath '%MAVEN_DIR%' -Force}"

if not exist "%MAVEN_BIN%" (
    echo ERROR: Failed to extract Maven.
    exit /B 1
)

@REM Clean up zip
del "%MAVEN_ZIP%" >nul 2>&1

echo Maven %MAVEN_VERSION% installed successfully!
echo.

:runMaven
@REM Run Maven with all passed arguments
call "%MAVEN_BIN%" %*

exit /B %ERRORLEVEL%
