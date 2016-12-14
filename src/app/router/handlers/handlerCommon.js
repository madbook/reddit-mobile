import * as preferenceActions from 'app/actions/preferences';
import * as userActions from 'app/actions/user';
import * as modActions from 'app/actions/modTools';

export const fetchUserBasedData = (dispatch) => {
  return Promise.all([
    dispatch(userActions.fetchMyUser()),
    dispatch(preferenceActions.fetch()),
    dispatch(modActions.fetchModeratingSubreddits()),
  ]);
};
