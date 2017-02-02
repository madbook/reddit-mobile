import * as preferenceActions from 'app/actions/preferences';
import * as userActions from 'app/actions/user';

export const fetchUserBasedData = (dispatch) => {
  return Promise.all([
    dispatch(userActions.fetchMyUser()),
    dispatch(preferenceActions.fetch()),
  ]);
};
