import metaForums from './metaForums';

export default function getPostable({ trx, postableType, postableId }) {
  const Forum = require('models/forum').default; // eslint-disable-line global-require
  const Oil = require('models/oil').default;     // eslint-disable-line global-require

  const postableMap = {
    forums: Forum,
    oils: Oil
  };

  const isMetaForum = metaForums[postableId];

  if (isMetaForum) {
    return postableMap[postableType]
      .query(trx)
      .findOne({ name: postableId });
  } else {
    return postableMap[postableType]
      .query(trx)
      .findById(postableId);
  }
}
