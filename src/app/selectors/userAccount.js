import { createSelector } from 'reselect';

export const userAccountSelector = createSelector(
  (state) => {
    const { user } = state;
    if (user.loggedOut) { return; }
    const { name } = user;
    if (!name) { return; }

    return state.accounts[name];
  },
  (user) => (user),
);
