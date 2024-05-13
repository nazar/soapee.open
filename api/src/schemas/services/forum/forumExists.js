import { raw } from 'objection';

import Forum from 'models/forum';

export default function forumExists({ name }) {
  return Forum
    .query()
    .where('name', '=', raw('lower(?)', [name])) // using lower(x) here to match the index
    .limit(1)
    .then(res => res.length);
}
