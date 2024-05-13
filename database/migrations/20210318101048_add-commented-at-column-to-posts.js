exports.up = function(knex) {
  return knex.schema.table('posts', (table) => {
    table.timestamp('commented_at').index();
  })
    .then(() => knex.raw('update posts set commented_at = created_at'))
    .then(() => {
      return knex.raw(`
WITH latest_comments AS (
  SELECT commentable_id, commentable_type, MAX(created_at) as created_at
  FROM comments
  WHERE commentable_type = 'posts'
  GROUP BY commentable_id, commentable_type
)

update posts set
  commented_at = latest_comments.created_at
from latest_comments
where posts.postable_type = 'forums'
and posts.id = latest_comments.commentable_id      
      `)
    })
};

exports.down = function(knex) {
  return knex.schema.table('posts', (table) => {
    table.dropColumn('commented_at');
  });
};
