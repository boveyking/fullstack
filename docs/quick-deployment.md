## Quick deployment demo
that demo assume the following:
- you have a server and you have the public static ip (ssh_ip)
- you already have a user (ssh_user ) and password (ssh_pws)  with ssh perssion to the server 
- you already have a domain name (domain) ,such as jared.fei-tian.org
- you already have a proper dns setting to point this domain  to this server 

## steps to launch demo
- make or choose a workspace folder
- enter workspace folder
- `git clone https://github.com/boveyking/fullstack.git`
- `cd fullstack`
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
- `chmod +x *.sh`  (linux )!important
- `dcp deploy`   or  `./dcp.sh deploy`
  - watch the output of building process
- open browser and point to your domain such as https://jared.fei-tian.org, the website should go live
- change the text "Fullstack" (line 124) to a new text in  /frontend/src/pages/Home.tsx
- run `dcp deploy`   or  `./dcp.sh deploy` again
- refresh the website in browser, and the new text should replace the "Fullstack"
