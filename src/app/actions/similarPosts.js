import { endpoints, errors } from '@r/api-client';
import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import { some } from 'lodash/collection';

import { flags } from 'app/constants';
import features from 'app/featureFlags';

const { SimilarPosts } = endpoints;
const { ResponseError } = errors;

const {
  VARIANT_RECOMMENDED_SIMILAR_POSTS,
} = flags;

export const FETCHING_SIMILAR_POSTS = 'FETCHING_SIMILAR_POSTS';
export const fetching = name => ({
  type: FETCHING_SIMILAR_POSTS,
  name,
});

export const RECEIVED_SIMILAR_POSTS = 'RECEIVED_SIMILAR_POSTS';
export const received = (postId, apiResponse) => ({
  type: RECEIVED_SIMILAR_POSTS,
  postId,
  apiResponse,
});

export const FAILED = 'FAILED_SIMILAR_POSTS';
export const failed = (name, error) => ({
  type: FAILED,
  name,
  error,
});

export const fetchSimilarPosts = (post, experimentId, maxRecs=3) => {
  return async (dispatch, getState) => {
    const state = getState();
    const feature = features.withContext({ state });
    if (some([VARIANT_RECOMMENDED_SIMILAR_POSTS], variant => feature.enabled(variant))) {
      dispatch(fetching(post.name));
      const apiOptions = apiOptionsFromState(state);

      try {
        const response = await SimilarPosts.get(
          apiOptions,
          {
            link: post.name,
            variant: 'cosine_on_votes',
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
