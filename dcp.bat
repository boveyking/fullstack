@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM  dcp.bat - Delta deploy to remote server.
REM
REM  Packs changed files (since last deploy) into one tar.gz,
REM  uploads it, and extracts remotely with sudo - directory
REM  structure preserved automatically.
REM
REM  Usage:
REM    dcp            Deploy delta files only
REM    dcp full       Deploy ALL files (ignore marker)
REM    dcp deploy     Deploy delta files, then run deploy.sh
REM    dcp full deploy
REM ============================================================

REM === Server configuration ===
set "SSH_HOST=54.169.214.129"
set "SSH_USER=dev"
set "APP=bking"
set "SSH_PASS=pwd"
set "REMOTE_WEB_DIR=/var/www/!APP!"
set "REMOTE_TMP=/home/!SSH_USER!/!APP!_deploy.tar.gz"

set "ROOT=%~dp0"
if "!ROOT:~-1!"=="\" set "ROOT=!ROOT:~0,-1!"
set "ARCHIVE=!ROOT!\deploy.tar.gz"
set "MARKER=!ROOT!\.dcp_marker"

REM === Parse args (order-independent: full / deploy) ===
set "FULL="
set "RUN_DEPLOY="
for %%A in (%*) do (
    if /i "%%~A"=="full"   set "FULL=-Full"
    if /i "%%~A"=="deploy" set "RUN_DEPLOY=1"
)

REM === 1. Pack delta files ===
echo Detecting delta files...
set "COUNT="
for /f "usebackq tokens=2 delims==" %%C in (`powershell -NoProfile -ExecutionPolicy Bypass -File "!ROOT!\dcp-delta.ps1" -Root "!ROOT!" -Out "!ARCHIVE!" -Marker "!MARKER!" !FULL!`) do set "COUNT=%%C"

if not defined COUNT (
    echo ERROR: delta detection failed.
    exit /b 1
)
if "!COUNT!"=="0" (
    echo No delta files to deploy.
    goto :deploy
)
echo Packed !COUNT! file^(s^) into deploy.tar.gz

REM === 2. Record timestamp BEFORE upload (so concurrent edits aren't missed) ===
for /f "usebackq delims=" %%D in (`powershell -NoProfile -Command "(Get-Date).ToString('o')"`) do set "STAMP=%%D"

REM === 3. Upload the single archive ===
echo Uploading archive...
pscp -pw %SSH_PASS% "!ARCHIVE!" %SSH_USER%@%SSH_HOST%:"!REMOTE_TMP!"
if errorlevel 1 (
    echo ERROR: upload failed.
    exit /b 1
)

REM === 4. Extract remotely (sudo), preserving structure; clean up temp ===
echo Extracting on remote...
echo y | plink -pw %SSH_PASS% %SSH_USER%@%SSH_HOST% "echo %SSH_PASS% | sudo -S mkdir -p !REMOTE_WEB_DIR! && echo %SSH_PASS% | sudo -S tar -xzf !REMOTE_TMP! -C !REMOTE_WEB_DIR! && rm -f !REMOTE_TMP!"
if errorlevel 1 (
    echo ERROR: remote extract failed. Marker NOT updated.
    exit /b 1
)

REM === 5. Success: advance marker and clean local archive ===
> "!MARKER!" echo !STAMP!
del "!ARCHIVE!" 2>nul
echo Deploy complete.

:deploy
if defined RUN_DEPLOY (
    echo.
    echo Running deploy.sh in !REMOTE_WEB_DIR! ...
    echo y | plink -pw %SSH_PASS% %SSH_USER%@%SSH_HOST% "cd !REMOTE_WEB_DIR! && echo %SSH_PASS% | sudo -S bash deploy.sh"
)

endlocal
goto :eof
