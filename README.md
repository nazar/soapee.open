# Soapee Next Source Code

Soapee is a Saponification Calculator and a Soap Recipe Database.

Here lies the source code for [Soapee](http://soapee.com). The source code is released to the community under the [AGPLv3 License](https://www.gnu.org/licenses/agpl-3.0.html). Source code is released as-is and no warranty or support will be provided by the author.

The soapee.com website was decommissioned on the 30th of April 2024 and its source code is presented here for all who wish to run their own private versions of Soapee. This repo is archived and no further commits will be pushed. 

Hosting this code for public access is strongly discouraged due to the code's outdated nature - doing so would make your public facing server susceptible to security breaches now or in the future.

# Developing and running Soapee locally

1. Get [Docker](https://www.docker.com/get-started)
2. From withing the project root folder, type `docker compose up` to start the local environment
3. Once docker has created all containers and all services have started, run `yarn db:migrate` to create the local dev database then run `yarn db:seed` to seed the local Postgres database. Once your local database is seeded, you are ready to use Soapee. You might want to [add a volume to map the PG database files](https://hub.docker.com/_/postgres) via the `PGDATA` Environment variable to a local folder in the `db` service in the [docker-compose.yml](./docker-compose.yml) file to persist the Postgres database files.
4. Point your browser at http://localhost:5000

# FAQ

## Why did Soapee shutdown?

Due to  professional and personal commitments, I am not able to dedicate any further time on running and maintaining Soapee. 

## Can you help me with X, Y, Z?

I'm very sorry, but I am not able to offer any assistance to any Soapee issues nor questions.

## I want to buy Soapee

Neither the soapee.com domain nor the Soapee database is for sale. The database contains identifiable user information and private recipes and as such I am not comfortable releasing it. The Soapee source code is available to run Soapee on your own hardware.



Copyright (c) the respective contributors, as shown by the AUTHORS file.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
