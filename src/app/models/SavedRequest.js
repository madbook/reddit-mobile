import { objectToHash } from 'lib/objectToHash';

export const paramsToSavedRequestId = params => objectToHash(params);

export const newSavedRequest = (id, params) => ({
  id,
  params,
  loading: true,
  results: [],
});
