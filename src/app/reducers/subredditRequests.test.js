import createTest from 'platform/createTest';
import * as loginActions from 'app/actions/login';
import subredditRequests from './subredditRequests';
import * as subredditActions from 'app/actions/subreddits';

createTest({ reducers: { subredditRequests } }, ({ getStore, expect }) => {
  describe('subredditRequests', () => {
    const NAME = 'foo';

    describe('LOGGED_IN and LOGGED_OUT', () => {
      it('should return default on log in', () => {
        const { store } = getStore({
          subredditRequests: { request: {} },
        });
        store.dispatch(loginActions.loggedIn());

        const { subredditRequests } = store.getState();
        expect(subredditRequests).to.eql({});
      });

      it('should return default on log out', () => {
        const { store } = getStore({
          subredditRequests: { request: {} },
        });
        store.dispatch(loginActions.loggedOut());

        const { subredditRequests } = store.getState();
        expect(subredditRequests).to.eql({});
      });
    });

    describe('FETCHING_SUBREDDIT', () => {
      it('should add a new subredditRequest to the store', () => {
        const { store } = getStore();
        store.dispatch(subredditActions.fetching(NAME));

        const { subredditRequests } = store.getState();
        expect(subredditRequests).to.be.eql({
          foo: { id: NAME, loading: true, failed: false },
        });
      });
    });

    describe('FETCHING_SUBREDDIT', () => {
      it('should update the loading state of a subredditRequest', () => {
        const { store } = getStore({
          subredditRequests: {
            foo: { id: NAME, loading: true, failed: false },
          },
        });

        store.dispatch(subredditActions.received(NAME));

        const { subredditRequests } = store.getState();
        expect(subredditRequests).to.be.eql({
          foo: { id: NAME, loading: false, failed: false },
        });
      });
    });
  });
});
