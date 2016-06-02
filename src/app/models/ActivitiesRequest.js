import { objectToHash } from 'lib/objectToHash';

export const paramsToActiviesRequestId = params => objectToHash(params);

export const newActivitesRequest = (id, params) => ({
  id,
  params,
  loading: true,
  results: [],
});
