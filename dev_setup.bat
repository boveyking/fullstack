@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM  dev_setup.bat - Interactive project setup.
REM  Copies *.dev templates to real files, then replaces
REM  #placeholder# values with user input.
REM ============================================================

set "ROOT=%~dp0"
if "!ROOT:~-1!"=="\" set "ROOT=!ROOT:~0,-1!"

echo === Copying .dev templates ===
call :copydev "!ROOT!\docker-compose.yml.dev"      "!ROOT!\docker-compose.yml"
call :copydev "!ROOT!\Dockerfile.dev"              "!ROOT!\Dockerfile"
call :copydev "!ROOT!\deploy.sh.dev"               "!ROOT!\deploy.sh"
call :copydev "!ROOT!\backend\fullstack.conf.dev"  "!ROOT!\backend\fullstack.conf"
call :copydev "!ROOT!\dcp.bat.dev"                 "!ROOT!\dcp.bat"
call :copydev "!ROOT!\dcp.sh.dev"                  "!ROOT!\dcp.sh"
call :copydev "!ROOT!\backend\.env.dev"            "!ROOT!\backend\.env"

echo.
echo === Project Setup ===
set /p "app_name=app_name: "
set /p "domain=domain: "
set /p "unique_port=unique_port: "
set /p "ssh_ip=ssh_ip: "
set /p "ssh_user=ssh_user: "
set /p "ssh_password=ssh_password: "

echo.
echo Applying values...

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

REM === Copy fullstack.conf -> {app_name}.conf ===
if exist "!ROOT!\backend\fullstack.conf" (
    copy /Y "!ROOT!\backend\fullstack.conf" "!ROOT!\backend\!app_name!.conf" >nul
    echo Copied backend\fullstack.conf to backend\!app_name!.conf
    del "!ROOT!\backend\fullstack.conf" >nul
    echo Removed intermediate backend\fullstack.conf
)

echo.
echo === Setting up Python virtual environment ===
python -m venv "!ROOT!\.venv"
call "!ROOT!\.venv\Scripts\activate.bat"

echo.
echo === Installing backend dependencies ===
pip install -r "!ROOT!\backend\requirements.txt"

echo.
echo === Installing frontend dependencies ===
npm install --prefix "!ROOT!\frontend"

echo.
echo Setup complete.
endlocal
goto :eof

REM --- copy <src> <dst> (only if src exists) ---
:copydev
if exist "%~1" (
    copy /Y "%~1" "%~2" >nul
    echo   %~nx1 -^> %~nx2
) else (
    echo   SKIP: %~nx1 not found
)
goto :eof

REM --- replace <file> <old> <new> via PowerShell ---
REM Literal .Replace() (no regex) + WriteAllText preserves original
REM line endings (LF stays LF) and handles special chars in values.
:replace
powershell -NoProfile -Command ^
    "$c=[IO.File]::ReadAllText('%~1'); $c=$c.Replace('%~2','%~3'); [IO.File]::WriteAllText('%~1',$c)"
goto :eof
