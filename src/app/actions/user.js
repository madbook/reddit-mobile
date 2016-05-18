import * as accountActions from 'app/actions/accounts';

export const fetchMyUser = () => async (dispatch, getState) => {
  const state = getState();
  dispatch(accountActions.fetch({ name: 'me', loggedOut: !state.session.accessToken }));
};
