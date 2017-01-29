import createTest from 'platform/createTest';

import * as subredditRulesActions from 'app/actions/subredditRules';
import subredditRulesRequests from 'app/reducers/subredditRulesRequests';

createTest({ reducers: { subredditRulesRequests }}, ({ getStore, expect }) => {
  describe('subredditRulesRequests', () => {
    describe('FETCHING_SUBREDDIT_RULES', () => {
      it('should add a new request model to state', () => {
        const { store } = getStore();

        store.dispatch(subredditRulesActions.fetching('test'));

        const { subredditRulesRequests } = store.getState();
        expect(subredditRulesRequests).to.eql({
          'test': {
            id: 'test',
            loading: true,
            failed: false,
          },
        });
      });

      it('should not add a new request if one is in progress', () => {
        const INITIAL_STATE = {
          'test': {
            id: 'test',
            loading: true,
            failed: false,
          },
        };
        const { store } = getStore({
          subredditRulesRequests: INITIAL_STATE,
        });

        store.dispatch(subredditRulesActions.fetching('test'));

        const { subredditRulesRequests } = store.getState();
        expect(subredditRulesRequests).to.eql(INITIAL_STATE);
      });
    });

    describe('RECEIVED_SUBREDDIT_RULES', () => {
      it('should set the loading property to false', () => {
        const { store } = getStore({
          subredditRulesRequests: {
            'test': {
              id: 'test',
              loading: true,
              failed: false,
            },
          },
        });

        store.dispatch(subredditRulesActions.received('test', []));

        const { subredditRulesRequests } = store.getState();
        expect(subredditRulesRequests).to.eql({
          'test': {
            id: 'test',
            loading: false,
            failed: false,
          },
        });
      });

      it('should do nothing if there is no request', () => {
        const { store } = getStore({
          subredditRulesRequests: {},
        });

        store.dispatch(subredditRulesActions.received('test', []));

        const { subredditRulesRequests } = store.getState();
        expect(subredditRulesRequests).to.eql({});
      });

      it('should do nothing if there is the existing request is not loading', () => {
        const INITIAL_STATE = {
          'test': {
            id: 'test',
            loading: false,
            failed: false,
          },
        };
        const { store } = getStore({
          subredditRulesRequests: INITIAL_STATE,
        });

        store.dispatch(subredditRulesActions.received('test'));

        const { subredditRulesRequests } = store.getState();
        expect(subredditRulesRequests).to.eql(INITIAL_STATE);
      });
    });

    describe('FAILED', () => {
      it('should set the loading property to false and the failed property to true', () => {
        const { store } = getStore({
          subredditRulesRequests: {
            'test': {
              id: 'test',
              loading: true,
              failed: false,
            },
          },
        });

        store.dispatch(subredditRulesActions.failed('test', {}));

        const { subredditRulesRequests } = store.getState();
        expect(subredditRulesRequests).to.eql({
          'test': {
            id: 'test',
            loading: false,
            failed: true,
          },
        });
      });

      it('should do nothing if there is no request', () => {
        const { store } = getStore({
          subredditRulesRequests: {},
        });

        store.dispatch(subredditRulesActions.failed('test', {}));

        const { subredditRulesRequests } = store.getState();
        expect(subredditRulesRequests).to.eql({});
      });

      it('should do nothing if there is the existing request is not loading', () => {
        const INITIAL_STATE = {
          'test': {
            id: 'test',
            loading: false,
            failed: false,
          },
        };
        const { store } = getStore({
          subredditRulesRequests: INITIAL_STATE,
        });

        store.dispatch(subredditRulesActions.failed('test', {}));

        const { subredditRulesRequests } = store.getState();
        expect(subredditRulesRequests).to.eql(INITIAL_STATE);
      });
    });
  });
});
