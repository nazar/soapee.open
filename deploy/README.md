# Instructions

Reminder to self how to build the server and deploy

## Deploying

1. create a debain 10 (buster) based linode server

## Provisioning

See [provision](./provision.sh) for server installation script.

### Post Provisioning configurations

#### Postgres

Change PG auth from `peer` to `md5`

1. `nano /etc/postgresql/13/main/pg_hba.conf`
2. change line `local all postgres peer` to `local all postgres md5`
3. `service postgresql restart`

### Private key

Steps to generate a private key to place in [./keys/production](./keys/production) for auto SSH login.

1. `ssh-keygen`
2. `cat /home/USER/.ssh/id_rsa` to get the private key. Copy it into [./keys/production](./keys/production).
3. `chmod 400 ./keys/production`
4. create the `/home/soapee/.ssh` folder and `chmod 700 .ssh`
5. create the `/home/soapee/authorized_keys` file and `chmod 644 authorized_keys`
6. copy the [authorized_keys](../deploy/keys/authorized_keys) to `/home/soapee/.ssh/authorized_keys`
7. Create the `/var/www/soapee` folder on the server. Chown it to a non-privileged `soapee` user
8. in the `/var/www/soapee` folder, create folders `shared` and `releases` 
8. copy [deploy/etc/nginx/sites-available/soapee.com](../deploy/etc/nginx/sites-available/soapee.com) to the remote
server to `/etc/nginxs/sites-available/soapee.com`
9. create a link to `soapee.com` file in `/etc/nginxs/sites-enabled/` via `ln -s /etc/nginx/sites-available/soapee.com /etc/nginx/sites-enabled/`
10. in remote server, delete `rm /etc/nginx/sites-enabled/default`


### Post setup

#### Setup fail2ban

1. `apt-get install -y fail2ban`
2. white list `82.69.30.21` via `nano /etc/fail2ban/jail.conf` and set `ignoreip = 127.0.0.1/8 ::1 82.69.30.21`
3. `service fail2ban restart`

#### Setup SMTP for outgoing emails

Based on https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-postfix-as-a-send-only-smtp-server-on-debian-10

1. `apt install -y mailutils`
2. `apt install -y postfix`
3. from the popup, select `Internet Site`
4. System mail name: `soapee.com`
5. `nano /etc/postfix/main.cf` and change `inet_interfaces` to `inet_interfaces = loopback-only`
6. `service postfix restart`
7. configure `soapee.com` DNS so that emails sent are not marked as spam

#### Let's Encrypt Certificate

1. `apt-get update && apt-get install -y certbot python3-certbot-nginx`
2. `certbot --nginx -d soapee.com -d www.soapee.com`
3. confirm renew is working via `certbot renew --dry-run`

certbot updates the `/etc/nginx/sites-avaiable/soapee.com` to

```
server {
  server_name soapee.com;

  # ReactJS Static Files
  location / {
    gzip_static on;
    root /var/www/soapee/current/client;
    try_files $uri /index.html;
  }

  # the NodeJS API server
  location /api {
    #define NODE_ENV
    passenger_app_env production;

    #api server index.js location
    passenger_app_root /var/www/soapee/current/api;
    passenger_app_type node;
    passenger_startup_file index.js;

    passenger_enabled on;
  }


    listen 80; # managed by Certbot

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/soapee.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/soapee.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}

# redirect www.soapee.com -> soapee.com
server {
    server_name  www.soapee.com;
    return 301 https://$host$request_uri;

    listen 80; # managed by Certbot

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/soapee.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/soapee.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
```


2. setup log rotation
3. setup linode longview

To deploy: `yarn shipit production deploy-local`
