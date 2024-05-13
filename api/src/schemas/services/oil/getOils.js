import Oil from 'models/oil';

export default function getOils() {
  return Oil
    .query();
}
