## Clean up the deployment 

- app_name you provide when setup dev is the working folder in remote server.
- ssh to remote server 
  - `ssh {ssh_user}@{ssh_ip}
  - `cd /var/www/{app_name}` 
  - `docker compose down`
  - `cd ..`
  - `rm -fr {app_name} `  
  - `rm /etc/nginx/sites-enabled/{app_name}.conf `
   
please replace {app_name} with the real app_name your provided.


