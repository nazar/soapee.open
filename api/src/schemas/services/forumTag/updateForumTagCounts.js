import _ from 'lodash';

import { jsonArrayToPgParams } from 'services/knex';

export default function updateForumTagCounts({ forumTags, trx }) {
  if (!(_.isEmpty(forumTags))) {
    return trx.raw(`
with forumTagCounts as (
  select forums_taggables.forum_tag_id as forumTagId,
         count(forums_taggables.post_id) as tagCount
  from forums_taggables 
  where forums_taggables.forum_tag_id IN (${jsonArrayToPgParams(forumTags)})  
  group by forums_taggables.forum_tag_id
)

update forums_tags set
  stats = jsonb_set(
    coalesce(stats, '{}'::jsonb),
    '{posts}'::text[],
    jsonb_build_object('count', forumTagCounts.tagCount)),
  updated_at = now()                     
from forumTagCounts
where forumTagCounts.forumTagId = forums_tags.id  
  `, forumTags);
  }
}
