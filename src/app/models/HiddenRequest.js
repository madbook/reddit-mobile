import { objectToHash } from 'lib/objectToHash';

export const paramsToHiddenRequestid = params => objectToHash(params);

export const newHiddenRequest = (id, params) => ({
  id,
  params,
  loading: true,
  results: [],
});
