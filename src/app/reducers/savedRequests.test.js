import createTest from '@r/platform/createTest';
import merge from '@r/platform/merge';
import { models } from '@r/api-client';

import savedRequests from './savedRequests';
import * as savedActions from 'app/actions/saved';
import * as loginActions from 'app/actions/login';

createTest({ reducers: { savedRequests }}, ({ getStore, expect}) => {
  describe('savedRequests', () => {
    describe('LOGGED_IN and LOGGED_OUT', () => {
      it('should return default on log in', () => {
        const { store } = getStore();
        store.dispatch(loginActions.loggedIn());

        const { savedRequests } = store.getState();
        expect(savedRequests).to.eql({});
      });

      it('should return default on log out', () => {
        const { store } = getStore();
        store.dispatch(loginActions.loggedOut());

        const { savedRequests } = store.getState();
        expect(savedRequests).to.eql({});
      });
    });

    describe('FETCHING_SAVED', () => {
      const SAVED_ID = '1';
      const SAVED_PARAMS = { user: 'me' };

      it('should try the cache for a pre-existing saved-request first', () => {
        const CACHED_SAVED = {
          id: SAVED_ID,
          params: SAVED_PARAMS,
          loading: false,
          results: [],
        };

        const { store } = getStore({
          savedRequests: {
            [SAVED_ID]: CACHED_SAVED,
          },
        });

        store.dispatch(savedActions.fetching(SAVED_ID, CACHED_SAVED.params));

        const { savedRequests } = store.getState();
        expect(savedRequests[SAVED_ID]).to.equal(CACHED_SAVED);
      });

      it('should add a new request model to the store', () => {
        const { store } = getStore();
        store.dispatch(savedActions.fetching(SAVED_ID, SAVED_PARAMS));

        const { savedRequests } = store.getState();
        expect(savedRequests[SAVED_ID]).to.eql({
          id: SAVED_ID,
          params: SAVED_PARAMS,
          loading: true,
          results: [],
        });
      });
    });

    describe('RECEIVED_SAVED', () => {
      const SAVED_ID = '1';
      const SAVED_PARAMS = { user: 'me' };

      it('should update the state and results of a saved request', () => {
        const LOADIGN_SAVED = {
          id: SAVED_ID,
          params: SAVED_PARAMS,
          loading: true,
          results: [],
        };

        const RESULTS = [
          new models.Record('comment', 't1_comment'),
          new models.Record('comment', 't2_comment'),
        ];

        const { store } = getStore({
          savedRequests: {
            [SAVED_ID]: LOADIGN_SAVED,
          },
        });

        store.dispatch(savedActions.received(SAVED_ID, { results: RESULTS }));

        const { savedRequests } = store.getState();
        expect(savedRequests).to.eql(merge(savedRequests, {
          [SAVED_ID]: {
            loading: false,
            results: RESULTS,
          },
        }));
      });
    });
  });
});
