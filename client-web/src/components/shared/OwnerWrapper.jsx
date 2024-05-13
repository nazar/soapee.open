import useCurrentUser from 'hooks/useCurrentUser';

export default function LoginWrapper({ object, children, ownerKey = 'userId' }) {
  const currentUser = useCurrentUser();

  if (currentUser && (Number(currentUser.id) === Number(object[ownerKey]))) {
    return children;
  } else {
    return null;
  }
}
