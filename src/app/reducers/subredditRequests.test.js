import createTest from '@r/platform/createTest';

import subredditRequests from './subredditRequests';
import * as subredditActions from 'app/actions/subreddits';

createTest({ reducers: { subredditRequests } }, ({ getStore, expect }) => {
  describe('subredditRequests', () => {
    const NAME = 'foo';

    describe('FETCHING_SUBREDDIT', () => {
      it('should add a new subredditRequest to the store', () => {
        const { store } = getStore();
        store.dispatch(subredditActions.fetchingSubreddit(NAME));

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

        store.dispatch(subredditActions.receivedSubreddit(NAME));

        const { subredditRequests } = store.getState();
        expect(subredditRequests).to.be.eql({
          foo: { id: NAME, loading: false, failed: false },
        });
      });
    });
  });
});
