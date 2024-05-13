import Bluebird from 'bluebird';

import Post from 'models/post';
import { emptyObjectChecker } from 'services/errors';

import checkModerationAccess from './checkModerationAccess';

export default function lockPost({ id, user }) {
  return Bluebird
    .resolve(
      Post
        .query()
        .findById(id)
    )
    .tap(emptyObjectChecker)
    .tap(post => checkModerationAccess({ post, user }))
    .then(post => post
      .$query()
      .patch({
        locked: true,
        lockedAt: new Date(),
        lockedByUserId: user.id
      })
      .returning('*')
      .first()
    );
}
