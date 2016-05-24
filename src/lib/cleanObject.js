import { omitBy } from 'lodash/object';

const nonNullValue = value => {
  return value === undefined || value === null;
};

export const cleanObject = (object) => {
  return omitBy(object, nonNullValue);
};
