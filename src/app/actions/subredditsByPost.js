import { endpoints, errors } from '@r/api-client';
import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import { some } from 'lodash/collection';

import { flags } from 'app/constants';
import features from 'app/featureFlags';
import { trackExperimentClickEvent } from 'lib/eventUtils';

const { SubredditsByPost } = endpoints;
const { ResponseError } = errors;

const {
  VARIANT_RECOMMENDED_BY_POST,
} = flags;

export const FETCHING_SUBREDDITS_BY_POST = 'FETCHING_SUBREDDITS_BY_POST';
export const fetching = name => ({
  type: FETCHING_SUBREDDITS_BY_POST,
  name,
});

export const RECEIVED_SUBREDDITS_BY_POST = 'RECEIVED_SUBREDDITS_BY_POST';
export const received = (postId, apiResponse) => ({
  type: RECEIVED_SUBREDDITS_BY_POST,
  postId,
  apiResponse,
});

export const FAILED = 'FAILED_SUBREDDITS_BY_POST';
export const failed = (name, error) => ({
  type: FAILED,
  name,
  error,
});

export const trackSubredditRecommendationClick = (subreddit) => {
  return async (dispatch, getState) => {
    trackExperimentClickEvent(getState(), 'subreddits_by_post', 105, subreddit);
  };
};

export const fetchSubredditsByPost = (post, experimentId, maxRecs=3) => {
  return async (dispatch, getState) => {
    const state = getState();
    const feature = features.withContext({ state });
    if (some([VARIANT_RECOMMENDED_BY_POST], variant => feature.enabled(variant))) {
      dispatch(fetching(post.name));
      const apiOptions = apiOptionsFromState(state);

      try {
        const response = await SubredditsByPost.get(
          apiOptions,
          {
            link: post.name,
            variant: 'nb',
            experiment_id: experimentId,
            max_recs: maxRecs,
          },
        );
        dispatch(received(post.name, response));
      } catch (e) {
        if (e instanceof ResponseError) {
          dispatch(failed(post.name, e));
        } else {
          throw e;
        }
      }
    }
  };
};
