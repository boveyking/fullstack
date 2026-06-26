## Description
This repository provide a quick ramp up for student to start web application using fastapi+reactjs stack.
## Tools we need
- curl
- ssh
- winget  
- git

## clone repository  
- git clone https://github.com/boveyking/fullstack.git

## Set up Python
- winget install Python.Python.3.12
- sudo apt update && sudo apt install -y python3 python3-pip python3-venv

## Set up nodejs
- winget install OpenJS.NodeJS.LTS
- curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt install -y nodejs

## Grant execution 
sudo chmod +x dc.sh
sudo chmod +x dcp.sh

## set the TARGET_DIR 
- dc.sh
- dc.bat

## set the  app name
- dcp.bat
- dcp.sh

## vscode extension
- install vscode
- install extension: live share, sqlite, cline

## vscode setting
- modify .vscode/settings.json according to your OS and file structure

## cline setting
- move the chat to right:
        Open the Cline panel.
        Right-click the Cline icon or Cline tab.
        Move View
        → Secondary Side Bar
- model: set it to xiaomi/mimo-v2.5


## create python virtual environment
- python -m venv .venv


## database configuration:
- for local dev: change variable DATABASE_URL for the db name  in backend/.env.py  
- for production, edit this variable in dockerfile
- be careful, above 2 settings are in different format, in .env, use relative path, in docker, use volumes.

## lunch backend
- select 'dev server backend' in terminal launch profile
- check the output for any error for port 8000 in terminal

## lunch frontend
- select 'dev server frontend' in terminal launch profile
- open browser at http://localost:3000

## react routing
- App.tsx holds routing rules, pattern --> Page
- ex: <Route path="/register/:token" element={<Register />} />
  /register/:token is pattern, Register is a Page

## api endpoint
- main.py holds api endpoint, pattern --> function
-ex: @app.get("/api/health")
     async def health_check():
     /api/health is the pattern and def health_check() is fucntion to handle this api


## docker file
- env variables
- container_name
- volumnes
- port number 

## data table
- use alembic to add or update table
- modify according in  model.py to make schema and underneath Db synced.


## alembic migration
- run the following command to create a migration python file in versions folder
  alembic revision -m  "the message for changes"
- modify model.py accordingly for the changes made in db
- run the following command to update db:
  alembic upgrade head


## deployment
- dcp.sh /dcp.bat scripts to push local changes to deployment server
- ./deply.sh to deploy

## nginx config
- domain name
- proxy to docker port