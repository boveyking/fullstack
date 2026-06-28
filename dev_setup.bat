@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM  dev_setup.bat - Interactive project setup.
REM  Replaces #placeholder# values across config files.
REM ============================================================

echo === Project Setup ===
echo.

set /p "app_name=app_name: "
set /p "domain=domain: "
set /p "unique_port=unique_port: "
set /p "ssh_ip=ssh_ip: "
set /p "ssh_user=ssh_user: "
set /p "ssh_password=ssh_password: "

echo.
echo Renaming .dev files...

set "ROOT=%~dp0"
if "!ROOT:~-1!"=="\" set "ROOT=!ROOT:~0,-1!"

for %%F in (
    "docker-compose.yml"
    "Dockerfile"
    "deploy.sh"
    "dcp.bat"
    "dcp.sh"
) do (
    if exist "!ROOT!\%%~F.dev" (
        if exist "!ROOT!\%%~F" del "!ROOT!\%%~F"
        rename "!ROOT!\%%~F.dev" "%%~F"
        echo   %%~F.dev -> %%~F
    )
)
if exist "!ROOT!\backend\fullstack.conf.dev" (
    if exist "!ROOT!\backend\fullstack.conf" del "!ROOT!\backend\fullstack.conf"
    rename "!ROOT!\backend\fullstack.conf.dev" "fullstack.conf"
    echo   backend\fullstack.conf.dev -> backend\fullstack.conf
)

echo.
echo Applying values...

REM --- Helper: replace in file via PowerShell ---
REM Usage: call :replace <file> <old> <new>
goto :main

:replace
powershell -NoProfile -Command ^
    "(Get-Content '%~1') -replace [regex]::Escape('%~2'), '%~3' | Set-Content '%~1'"
goto :eof

:main

REM === docker-compose.yml ===
call :replace "!ROOT!\docker-compose.yml" "#unique_port#" "!unique_port!"
call :replace "!ROOT!\docker-compose.yml" "#container_name#" "!app_name!"

REM === Dockerfile ===
call :replace "!ROOT!\Dockerfile" "#app_name#" "!app_name!"

REM === deploy.sh ===
call :replace "!ROOT!\deploy.sh" "#DB_NAME#" "!app_name!"

REM === backend\.env ===
call :replace "!ROOT!\backend\.env" "#app_name#" "!app_name!"

REM === backend\fullstack.conf ===
call :replace "!ROOT!\backend\fullstack.conf" "#domain#" "!domain!"
call :replace "!ROOT!\backend\fullstack.conf" "#unique_port#" "!unique_port!"

REM === dcp.bat ===
call :replace "!ROOT!\dcp.bat" "#app_name#" "!app_name!"
call :replace "!ROOT!\dcp.bat" "#ssh_password#" "!ssh_password!"
call :replace "!ROOT!\dcp.bat" "#ssh_ip#" "!ssh_ip!"
call :replace "!ROOT!\dcp.bat" "#ssh_user#" "!ssh_user!"

REM === dcp.sh ===
call :replace "!ROOT!\dcp.sh" "#app_name#" "!app_name!"
call :replace "!ROOT!\dcp.sh" "#ssh_password#" "!ssh_password!"
call :replace "!ROOT!\dcp.sh" "#ssh_ip#" "!ssh_ip!"
call :replace "!ROOT!\dcp.sh" "#ssh_user#" "!ssh_user!"

REM === Rename fullstack.conf -> {app_name}.conf ===
if exist "!ROOT!\backend\fullstack.conf" (
    rename "!ROOT!\backend\fullstack.conf" "!app_name!.conf"
    echo Renamed backend\fullstack.conf to backend\!app_name!.conf
)

echo.
echo Setup complete.
endlocal
