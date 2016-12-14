import createTest from '@r/platform/createTest';
import merge from '@r/platform/merge';

import moderatingSubreddits from './moderatingSubreddits';
import * as modToolActions from 'app/actions/modTools';
import * as loginActions from 'app/actions/login';


createTest({ reducers: { moderatingSubreddits } }, ({ getStore, expect }) => {
  describe('moderatingSubreddits', () => {
    describe('LOGGED_IN and LOGGED_OUT', () => {
      it('should return default on log in', () => {
        const { store } = getStore({
          moderatingSubreddits: {
            names: ['test'],
            responseCode: 200,
            loading: false,
          },
        });
        store.dispatch(loginActions.loggedIn());

        const { moderatingSubreddits } = store.getState();
        expect(moderatingSubreddits).to.eql({
          loading: false,
          responseCode: null,
          names: [],
        });
      });

      it('should return default on log out', () => {
        const { store } = getStore({
          moderatingSubreddits: {
            names: ['test'],
            responseCode: 200,
            loading: false,
          },
        });
        store.dispatch(loginActions.loggedOut());

        const { moderatingSubreddits } = store.getState();
        expect(moderatingSubreddits).to.eql({
          loading: false,
          responseCode: null,
          names: [],
        });
      });
    });

    describe('FETCHING_MODERATING_SUBREDDITS', () => {
      it('should not make API call if moderatingSubreddits exists in state', () => {
        const MODERATING_SUBREDDITS = {
          loading: false,
          responseCode: 200,
          names: ['test', 'test1'],
        };

        const { store } = getStore({
          moderatingSubreddits: MODERATING_SUBREDDITS,
        });

        store.dispatch(modToolActions.fetchModeratingSubreddits());

        const { moderatingSubreddits } = store.getState();
        expect(moderatingSubreddits).to.equal(MODERATING_SUBREDDITS);
      });

      it('should fetch moderatingSubreddits for a user', () => {
        const MODERATING_SUBREDDITS = {
          loading: false,
          responseCode: null,
          names: [],
        };

        const { store } = getStore({
          moderatingSubreddits: MODERATING_SUBREDDITS,
        });

        store.dispatch(modToolActions.fetchingSubs());

        const { moderatingSubreddits } = store.getState();
        expect(moderatingSubreddits).to.eql(merge(moderatingSubreddits, {
          loading: true,
          responseCode: null,
          names: [],
        }));
      });
    });

    describe('RECEIVED_MODERATING_SUBREDDITS', () => {
      it('should update the loading state and results of moderatingSubreddits', () => {
        const MODERATING_SUBREDDITS = {
          loading: true,
          responseCode: null,
          names: [],
        };

        const RESULTS = [
          { uuid: 'pics' },
          { uuid: 'test' },
          { uuid: 'askHistorians' },
        ];

        const { store } = getStore({
          moderatingSubreddits: MODERATING_SUBREDDITS,
        });

        store.dispatch(modToolActions.receivedSubs(
          { results: RESULTS,
            response: { status: 200 },
          },
        ));

        const { moderatingSubreddits } = store.getState();
        expect(moderatingSubreddits).to.eql(merge(moderatingSubreddits, {
          loading: false,
          names: ['pics', 'test', 'askHistorians'],
          responseCode: 200,
        }));
      });
    });

    describe('FAILED', () => {
      it('should update the loading state and set responseCode', () => {
        const { store } = getStore({
          moderatingSubreddits: {
            loading: true,
            responseCode: null,
            names: [],
          },
        });

        store.dispatch(modToolActions.fetchSubsFailed(
          { status: 404 }
        ));

        const { moderatingSubreddits } = store.getState();
        expect(moderatingSubreddits).to.eql(merge(moderatingSubreddits, {
          loading: false,
          responseCode: 404,
          names: [],
        }));
      });
    });
  });
});
