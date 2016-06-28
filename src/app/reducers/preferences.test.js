import createTest from '@r/platform/createTest';

// NOTE: default is an instanceOf a Preferences model from
// api-client. So for testing we need to call .set instead
// of using object splats. .set will return a new instance
// so its okay to keep calling .set on the DEFAULT object
import preferences, { DEFAULT } from './preferences';
import * as loginActions from 'app/actions/login';
import * as preferenceActions from 'app/actions/preferences';

createTest({ reducers: { preferences }}, ({ getStore, expect }) => {
  describe('preferences', () => {
    describe('LOGGED_IN and LOGGED_OUT', () => {
      it('should return default on log in', () => {
        const { store } = getStore({
          preferences: DEFAULT.set('over18', true),
        });

        store.dispatch(loginActions.loggedIn());
        const { preferences } = store.getState();
        expect(preferences).to.eql(DEFAULT);
      });

      it('should return default on log out', () => {
        const { store } = getStore({
          preferences: DEFAULT.set('over18', true),
        });

        store.dispatch(loginActions.loggedOut());
        const { preferences } = store.getState();
        expect(preferences).to.eql(DEFAULT);
      });
    });

    describe('RECEIEVED', () => {
      it('should update the state with newest preferences object', () => {
        const { store } = getStore();

        const updatedPreferences = DEFAULT.set('over18', true);
        store.dispatch(preferenceActions.received(updatedPreferences));
        const { preferences } = store.getState();
        expect(preferences).to.eql(updatedPreferences);
      });
    });

    describe('IS_OVER_18', () => {
      it('should optimistically update state to set over18 to true', () => {
        const { store } = getStore();

        store.dispatch(preferenceActions.isOver18());
        const { preferences } = store.getState();
        const over18Preferences = DEFAULT.set('over18', true);
        expect(preferences).to.eql(over18Preferences);
      });
    });
  });
});
