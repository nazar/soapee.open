import _ from 'lodash';
import config from 'config';
import morgan from 'morgan';
import httpContext from 'express-http-context';

import logger from 'services/logger';

export default function () {
  const loggingFormat = config.get('logging.format');

  let logging;

  if (loggingFormat === 'text') {
    // eslint-disable-next-line max-len
    logging = morgan(':graphOperation :status :res[content-length] - :response-time ms - :requestPayloadString :requestId', {
      stream: {
        write: (message) => {
          logger.request('', message);
        }
      }
    });
  } else if (loggingFormat === 'json') {
    logging = morgan((tokens, req, res) => {
      // don't log the metrics when in json mode
      if (req.path !== '/api/metrics') {
        logger.request('', {
          graphOperation: tokens.graphOperation(req),
          status: tokens.status(req, res),
          remoteAddress: tokens.remoteAddress(req),
          contentLength: tokens.res(req, res, 'content-length'),
          responseTime: tokens['response-time'](req, res),
          referrer: tokens.referrer(req, res),
          requestPayload: tokens.requestPayload(req, res),
          tokenPayload: tokens.tokenPayload(req),
          requestId: httpContext.get('requestId'),
          user: tokens.user(req)
        });
      }
    });
  } else {
    throw new Error(`${loggingFormat} not recognised logging type`);
  }

  morgan.token('requestPayload', (req) => {
    if (req.method.toUpperCase() === 'GET') {
      return req.query;
    } else {
      return req.body;
    }
  });

  morgan.token('requestPayloadString', (req) => {
    let payload;

    if (req.method.toUpperCase() === 'GET') {
      payload = req.query;
    } else {
      payload = req.body;
    }

    try {
      payload = JSON.stringify(payload, passwordRemover, 2);
    } catch (e) {
      payload = 'Not stringifiable';
    }

    return payload;
  });


  morgan.token('graphOperation', (req) => {
    return _.get(req, 'body.operationName') || `${req.method} ${req.path}`;
  });

  morgan.token('tokenPayload', (req) => {
    return req.tokenPayload;
  });

  morgan.token('user', (req) => {
    return req.user && {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    };
  });

  morgan.token('remoteAddress', (req) => {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  });

  morgan.token('requestId', () => {
    return `request-id: ${httpContext.get('requestId')}`;
  });

  return logging;
}

// /////////////////////

function passwordRemover(key, value) {
  if (_.includes([
    'password',
    'newPassword',
    'newPasswordConfirm',
    'confirmPassword'
  ], key)) {
    return '********';
  }

  return value;
}
