 

## react routing
- App.tsx holds routing rules, pattern --> Page
- ex: <Route path="/register/:token" element={<Register />} />
  /register/:token is pattern, Register is a Page

## api endpoint
- main.py holds api endpoint, pattern --> function
-ex: @app.get("/api/health")
     async def health_check():
     /api/health is the pattern and def health_check() is fucntion to handle this api

## development /improve/customize
this template already wired frontend and backend and database, dev can quickly customize based on their aplication
- change frontend page and compoent
- add endpoints in backend
- add schema,  change data   

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

## set the deployment parameters
- TARGET_DIR in dc.bat / dc.sh

- IP, PWD, App Name in    dcp.sh/dcp.bat
- run dc.bat , which copy newly modified files to remote server
- run dc.bat deploy , which copy and deploy
 
## nginx config
- domain name
- proxy to docker port
- certificates for ssl
- /etc/nginx/sites-enable/ -->folder for domain configuration files  
- sudo nginx -t --> test if config file is valid
- sudo service nginx start/stop/restart  -->start/stop/restart nginx service
 


## command command
- pwd  -->show current folder
- cd path -->chang folder to path
- mv src tgt -->move file or rename file
- docker ps  -->list running docker instance
- docker compose up -d --build  -->build docker
- docker compose up -d -->luanch docker
- docker compose down  --> shutdown docker

