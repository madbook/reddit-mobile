import * as subscribedSubredditsActions from 'app/actions/subscribedSubreddits';
import * as accountActions from 'app/actions/accounts';

export const fetchUserBasedData = (dispatch) => {
  dispatch(subscribedSubredditsActions.fetchSubscribedSubreddits(true));

  dispatch(async (d, getState) => {
    const state = getState();
    d(accountActions.fetch({ name: 'me', loggedOut: !state.session.accessToken }));
  });
};
