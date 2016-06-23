import * as accountActions from 'app/actions/accounts';

export const fetchMyUser = () => async (dispatch, getState) => {
  const state = getState();
  const loggedIn = !!state.session.accessToken;
  dispatch(accountActions.fetch({ name: 'me', loggedOut: !state.session.accessToken }));

};
