import { v4 as uuidv4 } from 'uuid';
import httpContext from 'express-http-context';

export default function(req, res, next) {
  httpContext.set('requestId', uuidv4());
  next();
}
