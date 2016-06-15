import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import { models } from '@r/api-client';

export const VOTED = 'VOTED';
export const voted = (id, model) => ({ type: VOTED, id, model });

export const vote = (id, direction) => async (dispatch, getState) => {
  const state = getState();
  const type = models.ModelTypes.thingType(id);
  const thing = state[`${type}s`][id];

  const stub = thing._vote(apiOptionsFromState(state), direction);
  dispatch(voted(id, stub));

  try {
    const resolved = await stub.promise();
    dispatch(voted(id, resolved));
  } catch (e) {
    dispatch(voted(id, thing));
  }
};
