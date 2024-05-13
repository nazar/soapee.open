import md5 from 'md5';

export default function getGravatarHash(user) {
  if (user.email) {
    const email = (user.email || '').trim().toLowerCase();

    return md5(email, { encoding: 'binary' });
  }
}
