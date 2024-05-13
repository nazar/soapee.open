import User from 'models/user';

export default function updateMe({ user, input: { name, email, about, imageUrl } }) {
  return User
    .query()
    .update({
      name, email, about, imageUrl
    })
    .where({ id: user.id })
    .returning('*')
    .first();
}
