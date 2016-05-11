import * as subscribedSubredditsActions from '../../actions/subscribedSubredditsActions';

export const fetchUserBasedData = (dispatch) => {
  dispatch(subscribedSubredditsActions.fetchSubscribedSubreddits());
};
