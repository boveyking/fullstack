@echo off
set "TARGET_DIR=D:\vpn-deployment"
echo ========================================
echo Copying deployment files to %TARGET_DIR%
echo ========================================

REM Create target directory if it doesn't exist
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"

REM Copy files excluding development/build artifacts
xcopy *.* "%TARGET_DIR%\" /E /I /D /Y /H /EXCLUDE:dc-exclude.txt

 
