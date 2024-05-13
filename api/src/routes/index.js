import Bluebird from 'bluebird';
import basicAuth from 'express-basic-auth';
import { register } from 'prom-client';

import logger from 'services/logger';

const basicAuthMiddleware = basicAuth({
  users: {
    'soapee-loki-username': 'sdfdsafsdfq3trf34trqwawfv431t2fvwqefcf216n12nu3ve'
  },
  challenge: true,
  realm: 'soapee'
});

export default function routes(app) {
  app.get('/api/metrics',
    basicAuthMiddleware,
    (req, res) => {
      Bluebird
        .resolve(register.metrics())
        .then((metrics) => {
          res.set('Content-Type', register.contentType);
          res.end(metrics);
        })
        .catch((e) => {
          logger.error('Error during metrics', { error: e });
          res.status(500).end(e);
        });
    });
}
