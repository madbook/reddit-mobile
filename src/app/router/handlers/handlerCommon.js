import * as subscribedSubredditsActions from 'app/actions/subscribedSubreddits';
import * as preferenceActions from 'app/actions/preferences';

export const fetchUserBasedData = (dispatch) => {
  dispatch(subscribedSubredditsActions.fetchSubscribedSubreddits(true));
  dispatch(preferenceActions.fetch());
};
