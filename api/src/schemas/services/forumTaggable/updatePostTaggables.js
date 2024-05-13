import Bluebird from 'bluebird';
import _ from 'lodash';

import ForumTaggable from 'models/forumTaggable';

export default function updatePostTaggables({ postId, forumTags, trx }) {
  const inserts = _.map(
    forumTags,
    (forumTagId) => ({ forumTagId, postId, updatedAt: 'now()', createdAt: 'now()' })
  );

  return Bluebird.try(() => {
    if (_.isEmpty(inserts)) {
      return trx.raw(`
        delete from forums_taggables 
        where post_id = :postId
        returning *
    `, { postId });
    } else {
      // eslint-disable-next-line max-len
      const insertStatement = ForumTaggable.query().insert(inserts).toKnexQuery().toString().replace('returning "id"', '');

      return trx.raw(`
        with insert_forum_taggables as (
          ${insertStatement}
            on conflict (post_id, forum_tag_id) DO UPDATE SET 
              updated_at = now() 
          returning *  
        ), delete_forum_taggables as (
          delete from forums_taggables 
          where post_id = :postId
          and forum_tag_id not in (${forumTags})
          returning *
        )
        
        SELECT *, 'inserted' AS operation FROM insert_forum_taggables
        UNION
        SELECT *, 'deleted' AS operation FROM delete_forum_taggables
  `, {
        postId,
        forumTags
      });
  }})
      .then(({ rows }) => rows);
}
