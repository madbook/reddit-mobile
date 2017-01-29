import createTest from '@r/platform/createTest';
import merge from '@r/platform/merge';

import Record from 'apiClient/apiBase/Record';
import hiddenRequests from './hiddenRequests';
import * as hiddenActions from 'app/actions/hidden';
import * as loginActions from 'app/actions/login';


createTest({ reducers: { hiddenRequests }}, ({ getStore, expect}) => {
  describe('hiddenRequests', () => {
    describe('LOGGED_IN and LOGGED_OUT', () => {
      it('should return default on log in', () => {
        const { store } = getStore({
          hidden: { 'request': {} },
        });
        store.dispatch(loginActions.loggedIn());

        const { hiddenRequests } = store.getState();
        expect(hiddenRequests).to.eql({});
      });

      it('should return default on log out', () => {
        const { store } = getStore({
          hidden: { 'request': {} },
        });
        store.dispatch(loginActions.loggedOut());

        const { hiddenRequests } = store.getState();
        expect(hiddenRequests).to.eql({});
      });
    });

    describe('FETCHING_HIDDEN', () => {
      const HIDDEN_ID = '1';
      const HIDDEN_PARAMS = { user: 'me' };

      it('should try the cache for a pre-existing hidden-request first', () => {
        const CACHED_HIDDEN = {
          id: HIDDEN_ID,
          params: HIDDEN_PARAMS,
          loading: false,
          results: [],
        };

        const { store } = getStore({
          hiddenRequests: {
            [HIDDEN_ID]: CACHED_HIDDEN,
          },
        });

        store.dispatch(hiddenActions.fetching(HIDDEN_ID, CACHED_HIDDEN.params));

        const { hiddenRequests } = store.getState();
        expect(hiddenRequests[HIDDEN_ID]).to.equal(CACHED_HIDDEN);
      });

      it('should add a new request model to the store', () => {
        const { store } = getStore();
        store.dispatch(hiddenActions.fetching(HIDDEN_ID, HIDDEN_PARAMS));

        const { hiddenRequests } = store.getState();
        expect(hiddenRequests[HIDDEN_ID]).to.eql({
          id: HIDDEN_ID,
          params: HIDDEN_PARAMS,
          loading: true,
          results: [],
        });
      });
    });

    describe('RECEIVED_HIDDEN', () => {
      const HIDDEN_ID = '1';
      const HIDDEN_PARAMS = { user: 'me' };

      it('should update the state and results of a hidden request', () => {
        const LOADING_HIDDEN = {
          id: HIDDEN_ID,
          params: HIDDEN_PARAMS,
          loading: true,
          results: [],
        };

        const RESULTS = [
          new Record('comment', 't1_comment'),
          new Record('comment', 't2_comment'),
        ];

        const { store } = getStore({
          hiddenRequests: {
            [HIDDEN_ID]: LOADING_HIDDEN,
          },
        });

        store.dispatch(hiddenActions.received(HIDDEN_ID, { results: RESULTS }));

        const { hiddenRequests } = store.getState();
        expect(hiddenRequests).to.eql(merge(hiddenRequests, {
          [HIDDEN_ID]: {
            loading: false,
            results: RESULTS,
          },
        }));
      });
    });
  });
});
