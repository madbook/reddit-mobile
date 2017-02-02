import * as accountActions from 'app/actions/accounts';
import * as modToolActions from 'app/actions/modTools';

export const fetchMyUser = () => async (dispatch, getState) => {
  const state = getState();
  // we want `fetchMyUser` to block until we're done fetching the account.
  // since `fetchMyUser` is an async function, by awaiting on the dispatch call,
  // we prevent the promise that `fetchMyUser` returns from resolving until
  // the dispatch is complete.
  await dispatch(accountActions.fetch({ name: 'me', loggedOut: !state.session.accessToken }));
  await dispatch(modToolActions.fetchModeratingSubreddits());
};
