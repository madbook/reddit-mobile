import { endpoints, errors } from '@r/api-client';
const { WikisEndpoint } = endpoints;
const { ResponseError } = errors;

import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import { makeWikiPath, cleanWikiPath } from 'lib/makeWikiPath';

export const FETCHING_WIKI = 'FETCHING_WIKI';
export const fetching = options => ({
  type: FETCHING_WIKI,
  ...options,
});

export const RECEIVED_WIKI = 'RECEIVED_WIKI';
export const received = (options, apiResponse) => ({
  type: RECEIVED_WIKI,
  ...options,
  apiResponse,
});

export const FAILED = 'FAILED_WIKI';
export const failed = (options, error) => ({
  type: FAILED,
  ...options,
  error,
});

export const fetch = (options) => async (dispatch, getState) => {
  const { subredditName } = options;
  let { path } = options;
  path = cleanWikiPath(path);

  const state = getState();
  const wikiPath = makeWikiPath(subredditName, path);
  const currentRequest = state.wikiRequests[wikiPath];
  if (currentRequest) { return; }

  dispatch(fetching(options));
  const query = { subredditName, path };

  try {
    const apiResponse = await WikisEndpoint.get(apiOptionsFromState(state), query);
    dispatch(received(options, apiResponse));
  } catch (e) {
    if (e instanceof ResponseError) {
      dispatch(failed(options, e));
    } else {
      throw e;
    }
  }
};
