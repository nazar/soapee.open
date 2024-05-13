#!/usr/bin/env bash

apt-get update -y
apt-get upgrade  -y

# install essentials

apt-get install -y rsync curl net-tools

# install Node 12 LTS

curl -sL https://deb.nodesource.com/setup_12.x | bash -
apt-get install -y nodejs

# install yarn

curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
apt-get update
apt install -y yarn

# postgres 13

sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt-get update
sudo apt-get -y install postgresql-13

# redis
apt install -y redis-server

# install passenger

apt-get install -y dirmngr gnupg
apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 561F9B9CAC40B2F7
apt-get install -y apt-transport-https ca-certificates build-essential
sh -c 'echo deb https://oss-binaries.phusionpassenger.com/apt/passenger buster main > /etc/apt/sources.list.d/passenger.list'
apt-get update
apt-get install -y nginx-extras passenger libnginx-mod-http-passenger

if [ ! -f /etc/nginx/modules-enabled/50-mod-http-passenger.conf ]; then ln -s /usr/share/nginx/modules-available/mod-http-passenger.load /etc/nginx/modules-enabled/50-mod-http-passenger.conf ; fi
ls /etc/nginx/conf.d/mod-http-passenger.conf


# create the soapee user to host the node process via passenger
adduser --disabled-password --gecos "" soapee

# for the following bits: su - postgres
# now the soapee user and database
runuser -l postgres -c 'createuser soapee'
runuser -l postgres -c 'createdb -O soapee soapee'
echo "alter user soapee with encrypted password 'SECURE-PRODUCTION-PASSWORD-GOES-HERE';" | runuser -l postgres -c 'psql'
