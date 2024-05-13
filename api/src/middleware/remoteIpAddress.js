export default function remoteIpAddress(req, res, next) {
  req.remotepAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  next();
}
