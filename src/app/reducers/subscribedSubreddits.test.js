import createTest from 'platform/createTest';
import Record from 'apiClient/apiBase/Record';
import subscribedSubreddits from './subscribedSubreddits';
import * as loginActions from 'app/actions/login';
import * as subscribedSubredditsActions from 'app/actions/subscribedSubreddits';
import { newSubscribedSubredditsModel } from 'app/models/SubscribedSubreddits';

createTest({ reducers: { subscribedSubreddits } }, ({ getStore, expect }) => {
  describe('subscribedSubreddits', () => {
    describe('LOGGED_IN and LOGGED_OUT', () => {
      it('should return default on log in', () => {
        const { store } = getStore({
          subscribedSubreddits: { 'foobar': 't5_12345' },
        });
        store.dispatch(loginActions.loggedIn());

        const { subscribedSubreddits } = store.getState();
        expect(subscribedSubreddits).to.eql(newSubscribedSubredditsModel());
      });

      it('should return default on log out', () => {
        const { store } = getStore({
          subscribedSubreddits: { 'foobar': 't5_12345' },
        });
        store.dispatch(loginActions.loggedOut());

        const { subscribedSubreddits } = store.getState();
        expect(subscribedSubreddits).to.eql(newSubscribedSubredditsModel());
      });
    });

    describe('FETCHING_SUBSCRIBED_SUBREDDITS', () => {
      it('should update the fetching state to true', () => {
        const { store } = getStore();
        store.dispatch(subscribedSubredditsActions.fetching());

        const { subscribedSubreddits } = store.getState();
        expect(subscribedSubreddits.fetching).to.equal(true);
      });

      describe('RECEIVED_SUBSCRIBED_SUBREDDITS', () => {
        it('should add the subreddits to the store', () => {
          const SUBREDDIT = new Record('subreddit', 'foobar', 't5_12345');

          const { store } = getStore();
          store.dispatch(subscribedSubredditsActions.received({
            results: [ SUBREDDIT ],
          }));

          const { subscribedSubreddits } = store.getState();
          expect(subscribedSubreddits.subreddits).to.eql({ foobar: SUBREDDIT });
        });

        it('should set the loaded state to true', () => {
          const { store } = getStore();
          store.dispatch(
            subscribedSubredditsActions.received({ results: [] })
          );

          const { subscribedSubreddits } = store.getState();
          expect(subscribedSubreddits.loaded).to.equal(true);
        });
      });
    });
  });
});
