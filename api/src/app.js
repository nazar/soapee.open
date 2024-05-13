import bodyParser from 'body-parser';
import compression from 'compression';
import config from 'config';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import { collectDefaultMetrics } from 'prom-client';
import { graphqlUploadExpress } from 'graphql-upload';
import { graphqlHTTP } from 'express-graphql';
import { formatError } from 'graphql';
import httpContext from 'express-http-context';

import { Model } from 'objection';

import schema from 'schemas';
import knex from 'services/knex';
import logger from 'services/logger';

import dataLoader from 'middleware/dataLoader';
import logging from 'middleware/logging';
import remoteIp from 'middleware/remoteIpAddress';
import requestId from 'middleware/requestId';
import token from 'middleware/token';
import user from 'middleware/user';

import routes from 'routes';

const app = express();

app.set('port', process.env.PORT || 3000);

// wire up express morgan with central logging system
app.use(logging(), token, dataLoader, user, remoteIp);
// set up helmet, basic security checklist
app.use(
  helmet({
    dnsPrefetchControl: false,
    hsts: false,
    // to enable graphql playground - see https://github.com/graphql/graphql-playground/issues/1283
    contentSecurityPolicy: (process.env.NODE_ENV === 'production') ? undefined : false
  })
);

// wire misc things

Model.knex(knex);

// set up basic middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(cookieParser());
app.use(httpContext.middleware);
app.use(requestId);

// graphql endpoints

app.use('/api/graphql',
  graphqlUploadExpress({ maxFileSize: 5000000, maxFiles: 10 }),
  graphqlHTTP(({ loaders, authToken, user: reqUser, body, remoteIpAddress }) => ({
    schema,
    context: {
      loaders,
      authToken,
      user: reqUser
    },
    customFormatErrorFn: (error) => {
      logger.error('graphQL Error', {
        error,
        body,
        remoteIpAddress,
        stack: error.stack,
        tokenPayload: authToken
      });

      return formatError(error);
    }
  })));

if (config.get('nodeExporter.enabled')) {
  collectDefaultMetrics();
  routes(app);
}

export default app;
