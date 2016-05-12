import { map } from 'lodash/collection';
import { omit } from 'lodash/object';

const queryStringFromDictionary = (queryParams) => {
  const keys = Object.keys(queryParams);
  if (keys.length) {
    return `?${ map(keys, k => `${k}=${encodeURIComponent(queryParams[k])}`).join('&') }`;
  }

  return '';
};

export const urlWith = (url, queryParams) => {
  return `${url}${queryStringFromDictionary(queryParams)}`;
};

export const urlWithQueryParamToggled = (url, queryParams, paramName, paramValue) => {
  const currentParam = queryParams[paramName];

  // remove the parameter if its in the current params, but only if its the same value.
  if (currentParam && currentParam === paramValue) {
    return urlWith(url, omit(queryParams, paramName));
  }

  return urlWith(url, { ...queryParams, [paramName]: paramValue });
};
