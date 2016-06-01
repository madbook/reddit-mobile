import createTest from '@r/platform/createTest';
import { models } from '@r/api-client';

import subscribedSubreddits from './subscribedSubreddits';
import * as loginActions from 'app/actions/login';
import * as subscribedSubredditsActions from 'app/actions/subscribedSubreddits';
import * as apiResponseActions from 'app/actions/apiResponse';
import { newSubscribedSubredditsModel } from 'app/models/SubscribedSubreddits';

createTest({ reducers: { subscribedSubreddits } }, ({ getStore, expect }) => {
  describe('subscribedSubreddits', () => {
    describe('LOGGED_IN and LOGGED_OUT', () => {
      it('should return default on log in', () => {
        const { store } = getStore();
        store.dispatch(loginActions.loggedIn());

        const { subscribedSubreddits } = store.getState();
        expect(subscribedSubreddits).to.eql(newSubscribedSubredditsModel());
      });

      it('should return default on log out', () => {
        const { store } = getStore();
        store.dispatch(loginActions.loggedOut());

        const { subscribedSubreddits } = store.getState();
        expect(subscribedSubreddits).to.eql(newSubscribedSubredditsModel());
      });
    });

    describe('FETCHING_SUBSCRIBED_SUBREDDITS', () => {
      it('should update the fetching state to true', () => {
        const { store } = getStore();
        store.dispatch(subscribedSubredditsActions.fetchingSubscribedSubreddits());

        const { subscribedSubreddits } = store.getState();
        expect(subscribedSubreddits.fetching).to.equal(true);
      });

      describe('RECEIVED_SUBSCRIBED_SUBREDDITS', () => {
        it('should add the subreddits to the store', () => {
          const SUBREDDIT = new models.Record('subreddit', 'foobar', 't5_12345');

          const { store } = getStore();
          store.dispatch(subscribedSubredditsActions.receivedSubscribedSubreddits(
            [ SUBREDDIT ],
          ));

          const { subscribedSubreddits } = store.getState();
          expect(subscribedSubreddits.subreddits).to.eql({ foobar: SUBREDDIT });
        });

        it('should set the loaded state to true', () => {
          const { store } = getStore();
          store.dispatch(
            subscribedSubredditsActions.receivedSubscribedSubreddits([])
          );

          const { subscribedSubreddits } = store.getState();
          expect(subscribedSubreddits.loaded).to.equal(true);
        });
      });
    });

    describe('RECEIVED_API_RESPONSE', () => {
      it('should add the subreddits to the store', () => {
        const SUBREDDIT = new models.Record('subreddit', 'foobar', 't5_12345');

        const { store } = getStore({
          subscribedSubreddits: {
            subreddits: {},
            loaded: true,
          },
        });

        store.dispatch(apiResponseActions.receivedResponse({
          results: [ SUBREDDIT ],
          subreddits: {
            foobar: {
              uuid: 'foobar',
              title: 'Foobar!',
              userIsSubscriber: true,
              toRecord: () => SUBREDDIT,
            },
          },
        }));

        const { subscribedSubreddits } = store.getState();
        expect(subscribedSubreddits.subreddits).to.eql({ foobar: SUBREDDIT });
      });
    });
  });
});
