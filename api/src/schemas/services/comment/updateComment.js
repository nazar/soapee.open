import Bluebird from 'bluebird';
import { raw } from 'objection';

import Comment from 'models/comment';
import { objectOwnerCheck } from 'services/security';
import { emptyObjectChecker } from 'services/errors';
import sanitiseHtml, { stripAllHtml } from 'services/sanitiseHtml';

export default function ({ user, id, comment }) {
  return Bluebird
    .resolve(
      Comment
        .query()
        .findById(id)
    )
    .tap(emptyObjectChecker)
    .tap(dbComment => objectOwnerCheck(dbComment, user))
    .then(dbComment =>
      dbComment
        .$query()
        .patch({
          comment: sanitiseHtml(comment),
          weightedTsv: raw("to_tsvector('english', ?)", [stripAllHtml(comment)]),
          lastEdited: new Date()
        })
        .returning('*')
        .first()
    );
}
