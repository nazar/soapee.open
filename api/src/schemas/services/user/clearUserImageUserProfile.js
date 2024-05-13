import clearImageable from '../image/clearImageable';

export default function clearUserImageUserProfile({ user, trx }) {
  return clearImageable({ imageableId: user.id, imageableType: 'user_profile', trx });
}
