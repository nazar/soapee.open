server {
  server_name soapee.com;

  # set client body size to 4M
  client_max_body_size 4M;

  # Uploaded imageables
  location /imageables/ {
    alias /var/www/soapee/shared/images/;
  }

  # ReactJS Static Files
  location / {
    gzip_static on;
    root /var/www/soapee/current/client;
    try_files $uri @index;
  }

  location @index {
    expires -1;
    gzip_static on;
    root /var/www/soapee/current/client;
    try_files /index.html =404;
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

}

# redirect www.soapee.com -> soapee.com
server {
    server_name  www.soapee.com;
    rewrite ^(.*) http://soapee.com$1 permanent;
}
