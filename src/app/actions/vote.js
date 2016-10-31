import { models, errors } from '@r/api-client';
import * as platformActions from '@r/platform/actions';

import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import { LOGGEDOUT_REDIRECT } from 'app/constants';


const { ResponseError } = errors;

export const PENDING = 'VOTE__PENDING';
export const SUCCESS = 'VOTE__SUCCESS';
export const FAILURE = 'VOTE__FAILURE';

export const pending = (id, model) => ({ type: PENDING, id, model });
export const success = (id, model) => ({ type: SUCCESS, id, model });
export const failure = (direction, type) => {
  const voteWord = direction === 1 ? 'upvote' : 'downvote';
  return {
    type: FAILURE,
    message: `Failed to ${voteWord} the ${type}.`,
  };
};

export const vote = (id, direction) => async (dispatch, getState) => {
  const state = getState();
  if (!state.session.isValid) {
    dispatch(platformActions.setPage(LOGGEDOUT_REDIRECT));
    return;
  }

  const type = models.ModelTypes.thingType(id);
  const thing = state[`${type}s`][id];

  const stub = thing._vote(apiOptionsFromState(state), direction);
  dispatch(pending(id, stub));

  try {
    const model = await stub.promise();
    dispatch(success(id, model));

  } catch (e) {
    dispatch(failure(direction, type));
    if (!(e instanceof ResponseError)) {
      throw e;
    }
  }
};
