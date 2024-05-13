import { parse, differenceInSeconds } from 'date-fns';

export function createdAtAndUpdatedAtDiffer(object) {
  if (object.createdAt && object.updatedAt) {
    return differsInSeconds(object.createdAt, object.updatedAt);
  } else {
    return false;
  }
}

export function differsInSeconds(time1, time2) {
  if (time1 && time2) {
    const parsed1 = parse(time1);
    const parsed2 = parse(time2);

    const diffSeconds = differenceInSeconds(parsed1, parsed2);

    return Math.abs(diffSeconds) > 2;
  } else {
    return false;
  }
}
