import createTest from '@r/platform/createTest';

import subreddits from './subreddits';

import * as loginActions from 'app/actions/login';
import * as searchActions from 'app/actions/search';
import * as subredditActions from 'app/actions/subreddits';
import * as subscribedSubredditsActions from 'app/actions/subscribedSubreddits';


createTest({ reducers: { subreddits }}, ({ getStore, expect }) => {
  describe('subreddits', () => {
    describe('LOGGED_IN and LOGGED_OUT', () => {
      it('should return default on log ou', () => {
        const { store } = getStore({
          subreddits: {
            't5_1': { name: 'askreddit' },
          },
        });

        store.dispatch(loginActions.loggedOut());
        const { subreddits } = store.getState();
        expect(subreddits).to.eql({});
      });

      it('should return the default on log in', () => {
        const { store } = getStore({
          subreddits: {
            't5_1': { name: 'askreddit' },
          },
        });

        store.dispatch(loginActions.loggedIn());
        const { subreddits } = store.getState();
        expect(subreddits).to.eql({});
      });
    });

    describe('RECEIVED SEARCH REQUEST', () => {
      it('should consume subreddits from search requests', () => {
        const SUBREDDIT = {
          uuid: 'askreddit',
          name: 't5_1',
        };

        const { store } = getStore();
        store.dispatch(searchActions.received('', {
          subreddits: {
            [SUBREDDIT.uuid]: SUBREDDIT,
          },
        }));

        const { subreddits } = store.getState();
        expect(subreddits).to.eql({
          [SUBREDDIT.uuid]: SUBREDDIT,
        });
      });
    });

    describe('RECEIVED_SUBSCRIBED_SUBREDDITS', () => {
      it('should consume subreddits from subscribed subreddits', () => {
        const SUBREDDIT = {
          uuid: 'askreddit',
          name: 't5_1',
        };

        const { store } = getStore();
        store.dispatch(subscribedSubredditsActions.received({
          subreddits: {
            [SUBREDDIT.uuid]: SUBREDDIT,
          },
        }));

        const { subreddits } = store.getState();
        expect(subreddits).to.eql({
          [SUBREDDIT.uuid]: SUBREDDIT,
        });
      });
    });

    describe('RECEIVED_SUBREDDIT', () => {
      it('should consume subreddits from fetching an individual subreddit', () => {
        const SUBREDDIT = {
          uuid: 'askreddit',
          name: 't5_1',
        };

        const { store } = getStore();
        store.dispatch(subredditActions.received(SUBREDDIT.uuid, SUBREDDIT));

        const { subreddits } = store.getState();
        expect(subreddits).to.eql({
          [SUBREDDIT.uuid]: SUBREDDIT,
        });
      });
    });

    describe('TOGGLED_SUBSCRIPTION', () => {
      it('should consume and update subreddits from toggling their subscrition', () => {
        const SUBREDDIT = {
          uuid: 'askreddit',
          name: 't5_1',
          userIsSubscriber: false,
        };

        const SUBSCRIBED = {
          ...SUBREDDIT,
          userIsSubscriber: true,
        };

        const { store } = getStore();
        store.dispatch(subscribedSubredditsActions.toggled(SUBREDDIT.uuid, SUBREDDIT));

        const { subreddits } = store.getState();
        expect(subreddits).to.eql({
          [SUBREDDIT.uuid]: SUBREDDIT,
        });

        store.dispatch(subscribedSubredditsActions.toggled(SUBREDDIT.uuid, SUBSCRIBED));
        const { subreddits: toggledSubreddits } = store.getState();
        expect(toggledSubreddits).to.eql({
          [SUBREDDIT.uuid]: SUBSCRIBED,
        });
      });
    });
  });
});
