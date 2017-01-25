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
            error: null,
            loading: false,
          },
        });
        store.dispatch(loginActions.loggedIn());

        const { moderatingSubreddits } = store.getState();
        expect(moderatingSubreddits).to.eql({
          loading: false,
          error: null,
          names: null,
        });
      });

      it('should return default on log out', () => {
        const { store } = getStore({
          moderatingSubreddits: {
            names: ['test'],
            error: null,
            loading: false,
          },
        });
        store.dispatch(loginActions.loggedOut());

        const { moderatingSubreddits } = store.getState();
        expect(moderatingSubreddits).to.eql({
          loading: false,
          error: null,
          names: null,
        });
      });
    });

    describe('FETCHING_MODERATING_SUBREDDITS', () => {
      it('should not make API call if moderatingSubreddits exists in state', () => {
        const MODERATING_SUBREDDITS = {
          loading: false,
          error: null,
          names: ['test', 'test1'],
        };

        const { store } = getStore({
          moderatingSubreddits: MODERATING_SUBREDDITS,
        });

        store.dispatch(modToolActions.fetchModeratingSubreddits());

        const { moderatingSubreddits } = store.getState();
        expect(moderatingSubreddits).to.equal(MODERATING_SUBREDDITS);
      });

      it('should not make API call if moderatingSubreddits is []', () => {
        const MODERATING_SUBREDDITS = {
          loading: false,
          error: null,
          names: [],
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
          error: null,
          names: null,
        };

        const { store } = getStore({
          moderatingSubreddits: MODERATING_SUBREDDITS,
        });

        store.dispatch(modToolActions.fetchingSubs());

        const { moderatingSubreddits } = store.getState();
        expect(moderatingSubreddits).to.eql(merge(moderatingSubreddits, {
          loading: true,
          error: null,
          names: null,
        }));
      });
    });

    describe('RECEIVED_MODERATING_SUBREDDITS', () => {
      it('should update the loading state and results of moderatingSubreddits', () => {
        const MODERATING_SUBREDDITS = {
          loading: true,
          error: null,
          names: null,
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
          error: null,
        }));
      });
    });

    describe('FAILED', () => {
      it('should update the loading state and set error', () => {
        const { store } = getStore({
          moderatingSubreddits: {
            loading: true,
            error: null,
            names: null,
          },
        });

        store.dispatch(modToolActions.fetchSubsFailed(
          { status: 404 }
        ));

        const { moderatingSubreddits } = store.getState();
        expect(moderatingSubreddits).to.eql(merge(moderatingSubreddits, {
          loading: false,
          error: { status: 404 },
          names: [],
        }));
      });
    });
  });
});
