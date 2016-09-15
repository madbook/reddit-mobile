import * as subscribedSubredditsActions from 'app/actions/subscribedSubreddits';
import * as preferenceActions from 'app/actions/preferences';
import * as userActions from 'app/actions/user';

export const fetchUserBasedData = (dispatch) => {
  dispatch(subscribedSubredditsActions.fetchSubscribedSubreddits(true));
  dispatch(userActions.fetchMyUser());
  dispatch(preferenceActions.fetch());
};
