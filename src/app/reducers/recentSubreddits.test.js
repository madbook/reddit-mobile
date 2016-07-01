import createTest from '@r/platform/createTest';

import * as loginActions from 'app/actions/login';
import * as recentSubredditActions from 'app/actions/recentSubreddits';
import * as subredditActions from 'app/actions/subreddits';
import recentSubreddits from './recentSubreddits';

createTest({ reducers: { recentSubreddits } }, ({ expect, getStore }) => {
  describe('recentSubreddits', () => {
    describe('LOGGED_IN and LOGGED_OUT', () => {
      it('should return default on log out', () => {
        const { store } = getStore({
          recentSubreddits: ['a', 'b', 'c'],
        });

        store.dispatch(loginActions.loggedOut());
        const { recentSubreddits } = store.getState();
        expect(recentSubreddits).to.eql([]);
      });

      it('should return the default on log in', () => {
        const { store } = getStore({
          recentSubreddits: ['a', 'b', 'c'],
        });

        store.dispatch(loginActions.loggedIn());
        const { recentSubreddits } = store.getState();
        expect(recentSubreddits).to.eql([]);
      });
    });

    describe('SET_RECENT_SUBREDDITS', () => {
      it('should set recent subreddits', () => {
        const SUBREDDITS = ['foo', 'bar', 'baz'];
        const { store } = getStore();
        store.dispatch(recentSubredditActions.setRecentSubreddits(SUBREDDITS));

        const { recentSubreddits } = store.getState();
        expect(recentSubreddits).to.eql(SUBREDDITS);
      });
    });

    describe('RECEIVED_SUBREDDIT', () => {
      it('should add a subreddit when a subreddit is received', () => {
        const { store } = getStore({ recentSubreddits: [ 'foo', 'baz' ] });
        store.dispatch(subredditActions.received('aww', { displayName: 'aww' }));

        const { recentSubreddits } = store.getState();
        expect(recentSubreddits).to.eql([ 'aww', 'foo', 'baz' ]);
      });
    });
  });
});
