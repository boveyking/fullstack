@echo off
setlocal enabledelayedexpansion

goto :main

:main
REM === Server Configuration ===
set "SSH_HOST=UPDATE_THIS_WITH_REAL_IP"
set "SSH_USER=dev"
set "APP=vpn"
set "SSH_PASS=UPDATE_THIS_WITH_REAL_PWD"
set "REMOTE_VPN_DIR=/home/!SSH_USER!/!APP!"
set "REMOTE_WEB_DIR=/var/www/!APP!"

REM === Detect plink.exe (PuTTY) for password-based SSH ===
set "PLINK_EXE="
where plink >nul 2>&1
if !errorlevel! equ 0 (
    set "PLINK_EXE=plink"
) else (
    if exist "C:\Program Files\PuTTY\plink.exe" set "PLINK_EXE=C:\Program Files\PuTTY\plink.exe"
    if exist "C:\Program Files (x86)\PuTTY\plink.exe" set "PLINK_EXE=C:\Program Files (x86)\PuTTY\plink.exe"
)
if not defined PLINK_EXE (
    echo ERROR: plink.exe not found. Install PuTTY or add plink to PATH.
    exit /b 1
)

REM 1. Extract TARGET_DIR from dc.bat dynamically
set "TARGET_DRIVE="
for /f "usebackq tokens=2 delims==" %%T in (`findstr /b "set \"TARGET_DIR=" dc.bat`) do (
    set "TARGET_DIR_VAL=%%T"
    REM Strip trailing quote
    set "TARGET_DIR_VAL=!TARGET_DIR_VAL:"=!"
    REM Extract drive letter (first 2 chars, e.g. "D:")
    set "TARGET_DRIVE=!TARGET_DIR_VAL:~0,2!"
)
if not defined TARGET_DRIVE (
    echo ERROR: Could not detect TARGET_DIR drive from dc.bat
    exit /b 1
)
echo Detected target drive: %TARGET_DRIVE%

REM 2. Run dc.bat and output console result to file ttt
echo Running dc.bat to copy deployment files...
call dc.bat > ttt
type ttt

REM 3. Collect files to upload into a temporary file
echo Collecting files to upload...
echo. > upload_list.txt

for /f "usebackq delims=" %%A in ("ttt") do (
    set "line=%%A"
    
    REM Check if the line contains the target drive letter and is not empty
    echo "!line!" | findstr "%TARGET_DRIVE%" >nul
    if !errorlevel! equ 0 (
        set "src_file=!line:*%TARGET_DRIVE%=!"
        if not "!src_file!"=="" (
            echo !src_file! >> upload_list.txt
        )
    )
)

REM 4. Process the collected files
echo Processing collected files for upload...
for /f "usebackq delims=" %%B in (upload_list.txt) do (
    call :upload_file "%%B"
)

REM 5. Clean up temporary file
del upload_list.txt

echo.
echo Checking if files were uploaded...
echo %SSH_PASS% | "%PLINK_EXE%" -pw %SSH_PASS% %SSH_USER%@%SSH_HOST% "ls -la %REMOTE_VPN_DIR%"

echo.
echo Copying remote folder tree %REMOTE_VPN_DIR%/ to %REMOTE_WEB_DIR%/...
echo %SSH_PASS% | "%PLINK_EXE%" -pw %SSH_PASS% %SSH_USER%@%SSH_HOST% "sudo cp -rf %REMOTE_VPN_DIR%/* %REMOTE_WEB_DIR%/ 2>/dev/null || echo 'No files to copy or copy failed'"
echo %SSH_PASS% | "%PLINK_EXE%" -pw %SSH_PASS% %SSH_USER%@%SSH_HOST% "sudo rm -rf %REMOTE_VPN_DIR%/* 2>/dev/null || echo 'No files to clean up'"

set "RUN_DEPLOY=0"
if /i "%~1"=="deploy" set "RUN_DEPLOY=1"

if "!RUN_DEPLOY!"=="1" (
    echo.
    echo Running deploy.sh in %REMOTE_WEB_DIR%...
    echo %SSH_PASS% | "%PLINK_EXE%" -pw %SSH_PASS% %SSH_USER%@%SSH_HOST% "cd %REMOTE_WEB_DIR% && sudo bash deploy.sh"
)

goto :eof

REM Upload subroutine
:upload_file
set "src=%~1"
REM Normalize: strip spaces (paths here shouldn't contain spaces)
set "src=%src: =%"
if "%src%"=="" exit /b 0

REM Replace backslashes with forward slashes for remote path
set "remote=%src:\=/%"

echo Processing %src%...

REM Create remote directory structure first
echo y | "%PLINK_EXE%" -pw %SSH_PASS% %SSH_USER%@%SSH_HOST% "mkdir -p \"$(dirname '%REMOTE_VPN_DIR%/%remote%')\""

echo Uploading "%src%" to "%REMOTE_VPN_DIR%/%remote%"...
echo y | "%PLINK_EXE%" -pw %SSH_PASS% -scp %src% %SSH_USER%@%SSH_HOST%:%REMOTE_VPN_DIR%/%remote%
exit /b 0
