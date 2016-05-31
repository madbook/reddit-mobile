import omitBy from 'lodash/omitBy';

const nonNullValue = value => {
  return value === undefined || value === null;
};

export const cleanObject = (object) => {
  return omitBy(object, nonNullValue);
};
