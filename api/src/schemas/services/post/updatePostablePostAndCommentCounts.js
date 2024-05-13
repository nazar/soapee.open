import Forum from 'models/forum';
import Oil from 'models/oil';


export default async function updatePostablePostAndCommentCounts({ post, trx }) {
  // a postable is currently either an oil or a forum
  // an oil is basically it's own forum and all postables have a posts and comments stats counts
  // postable (oil or forum) -> posts -> comments

  // give a postable, count all posts and posts comments

  const Model = {
    oils: Oil,
    forums: Forum
  }[post.postableType];

  if (Model) {
    const postable = await Model.query(trx).findById(post.postableId);

    return trx.raw(`
      with postable_posts as (
        select posts.id
        from posts
        where posts.postable_id = :postableId 
        and posts.postable_type = :postableType
        and posts.deleted_at is null
      ), postable_comments as (
        select comments.id
        from comments
        where comments.commentable_id in ( select postable_posts.id from postable_posts )
        and comments.commentable_type = 'posts'
        and comments.deleted_at is null
      ), postable_stats as (
        select coalesce(:stats, '{}'::jsonb) || jsonb_build_object(
          'posts', jsonb_build_object('posts', (select count(*) from  postable_posts)),
          'comments', jsonb_build_object('comments', (select count(*) from postable_comments))
        ) as stats
      )
      
      select stats from postable_stats;
    `, { stats: postable.stats, postableId: postable.id, postableType: post.postableType })
      .then(({ rows }) => rows)
      .then(([{ stats }]) => {
        return postable
          .$query(trx)
          .patch({ stats });
      });
  } else {
    throw new Error(`${post.postableType} is not a supported postable`);
  }
}
