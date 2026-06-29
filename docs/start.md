## Tools we need
- curl
- ssh
- winget  
- git
- ssh client(Termora) : https://github.com/TermoraDev/termora


## Set up Python (skip if it is already set)
- winget install Python.Python.3.12
- sudo apt update && sudo apt install -y python3 python3-pip python3-venv

## Set up nodejs (skip if it is already set)
- winget install OpenJS.NodeJS.LTS
- curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt install -y nodejs




## vscode extension
- install vscode
- install extension: live share, sqlite, cline


## cline setting
- move the chat to right:
        Open the Cline panel.
        Right-click the Cline icon or Cline tab.
        Move View
        → Secondary Side Bar
- model: set it to xiaomi/mimo-v2.5


## clone repository  
- create  a project folder such as work_space
- git clone https://github.com/boveyking/fullstack.git work_space
- cd  work_space



## create python virtual environment
in project root folder, run

- `python -m venv .venv`

- ubuntu :

 `source  .venv/bin/activate`

- windows:

  `.venv/scripts/activate.bat`

## dev environment settings
run the following scripts to set the environment setting. 


- `cd work_space`  (make sure enter the project folder)
- `chmod +x *.sh`  (only need for linux )
- run dev setup scripts
  - `./dev_setup.sh` (linux )
  - `dev_setup`   (windows )
- input the following variables in console
  - app_name: anything_you_want_but_no_space 
  - domain: your domain such as jared.fei-tian.org
  - unique_port: 8245  (this must be very unique if you have must classmates practising on same server. Suggest using number great than 5000)
  - ssh_ip: your public ip of the servre
  - ssh_user: the user name
  - ssh_password: the password for this server

the database name will use the app_name you provide above.




## lunch backend
- cd backend, run the command to install all necessary libs:

  `pip install -r requirements.txt`
- select 'dev server backend' in terminal launch profile
- check the output for any error for port 8000 in terminal
- or run the command to run manuually:

  `npm run dev`

## lunch frontend
run the following command to install dependant packages:

` npm install `

- select 'dev server frontend' in terminal launch profile
- open browser at http://localost:3000

## environmnet variables setting
- in local dev, environmnet variables are set in .env which won't be upload to server
- in production, environmnet variables are set in Dockerfile
 



