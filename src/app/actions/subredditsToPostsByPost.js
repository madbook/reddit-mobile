import some from 'lodash/some';

import SubredditsToPostsByPost from 'apiClient/apis/SubredditsToPostsByPost';
import ResponseError from 'apiClient/errors/ResponseError';
import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import { flags } from 'app/constants';
import features from 'app/featureFlags';
import { trackExperimentClickEvent } from 'lib/eventUtils';

const {
  VARIANT_RECOMMENDED_BY_POST_TOP_ALL,
  VARIANT_RECOMMENDED_BY_POST_TOP_DAY,
  VARIANT_RECOMMENDED_BY_POST_TOP_MONTH,
  VARIANT_RECOMMENDED_BY_POST_HOT,
} = flags;

const LEGAL_VARIANTS = [
  VARIANT_RECOMMENDED_BY_POST_TOP_ALL,
  VARIANT_RECOMMENDED_BY_POST_TOP_DAY,
  VARIANT_RECOMMENDED_BY_POST_TOP_MONTH,
  VARIANT_RECOMMENDED_BY_POST_HOT,
];

export const FETCHING_SUBREDDITS_TO_POSTS_BY_POST = 'FETCHING_SUBREDDITS_TO_POSTS_BY_POST';
export const fetching = name => ({
  type: FETCHING_SUBREDDITS_TO_POSTS_BY_POST,
  name,
});

export const RECEIVED_SUBREDDITS_TO_POSTS_BY_POST = 'RECEIVED_SUBREDDITS_TO_POSTS_BY_POST';
export const received = (postId, apiResponse) => ({
  type: RECEIVED_SUBREDDITS_TO_POSTS_BY_POST,
  postId,
  apiResponse,
});

export const FAILED = 'FAILED_SUBREDDITS_TO_POSTS_BY_POST';
export const failed = (name, error) => ({
  type: FAILED,
  name,
  error,
});

export const trackPostRecommendationClick = (post) => {
  return async (dispatch, getState) => {
    trackExperimentClickEvent(getState(), 'subreddits_by_post', 105, post);
  };
};

export const fetchSubredditsToPostsByPost = (post, sort, time, experimentId, maxRecs=3) => {
  return async (dispatch, getState) => {
    const state = getState();
    const feature = features.withContext({ state });
    if (some(LEGAL_VARIANTS, variant => feature.enabled(variant))) {
      dispatch(fetching(post.name));
      const apiOptions = apiOptionsFromState(state);

      try {
        const response = await SubredditsToPostsByPost.get(
          apiOptions,
          {
            link: post.name,
            variant: 'nb',
            experiment_id: experimentId,
            max_recs: maxRecs,
            sort: sort,
            time: time,
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
