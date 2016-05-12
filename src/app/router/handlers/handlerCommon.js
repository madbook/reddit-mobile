import * as subscribedSubredditsActions from 'app/actions/subscribedSubreddits';

export const fetchUserBasedData = (dispatch) => {
  dispatch(subscribedSubredditsActions.fetchSubscribedSubreddits(true));
};
