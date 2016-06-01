import createTest from '@r/platform/createTest';

import sessionRefreshing from './sessionRefreshing';
import * as sessionRefreshingActions from 'app/actions/sessionRefreshing';

createTest({ reducers: { sessionRefreshing } }, ({ expect, getStore }) => {
  describe('SESSION_REFRESHING', () => {
    it('should set the refreshing state to true', () => {
      const { store } = getStore();
      store.dispatch(sessionRefreshingActions.refreshing());

      const { sessionRefreshing } = store.getState();
      expect(sessionRefreshing).to.be.equal(true);
    });
  });

  describe('SESSION_REFRESHED', () => {
    it('should set the refreshing state to false', () => {
      const { store } = getStore({ sessionRefreshing: true });
      store.dispatch(sessionRefreshingActions.refreshed());

      const { sessionRefreshing } = store.getState();
      expect(sessionRefreshing).to.be.equal(false);
    });
  });
});
