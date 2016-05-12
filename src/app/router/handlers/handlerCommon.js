import * as subscribedSubredditsActions from '../../actions/subscribedSubreddits';

export const fetchUserBasedData = (dispatch) => {
  dispatch(subscribedSubredditsActions.fetchSubscribedSubreddits(true));
};
