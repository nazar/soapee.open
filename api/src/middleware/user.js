import _ from 'lodash';
import Bluebird from 'bluebird';

export default function userMiddleware(req, res, next) {
  if (req?.tokenPayload?.userId) {
    Bluebird
      .join(
        req.loaders.userById.load(req.tokenPayload.userId),
        req.loaders.userIsAdminLoader.load(req.tokenPayload.userId),
        (user, userAdmin) => {
          req.user = {
            ...user,
            isAdmin: !(_.isEmpty(userAdmin))
          };
        }
      )
      .finally(() => next());
  } else {
    next();
  }
}
