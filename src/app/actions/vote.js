import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import { updatedModel } from './apiResponse';
import { models } from '@r/api-client';

export const VOTING = 'VOTING';
export const VOTED = 'VOTED';
export const VOTE = 'VOTE';

export const voting = (id, direction) => ({ type: VOTING, id, direction });
export const voted = (id, direction) => ({ type: VOTED, id, direction });
export const vote = (id, direction) => async (dispatch, getState) => {
  const state = getState();
  const type = models.ModelTypes.thingType(id);
  const thing = state[`${type}s`][id];

  const stub = thing._vote(apiOptionsFromState(state), direction);
  dispatch(updatedModel(stub, type));

  try {
    const resolved = await stub.promise();
    dispatch(updatedModel(resolved, type));
  } catch (e) {
    dispatch(updatedModel(thing, type));
  }
};

