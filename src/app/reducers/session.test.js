import createTest from '@r/platform/createTest';

import session from './session';
import * as sessionActions from 'app/actions/session';

createTest({ reducers: { session } }, ({ getStore, expect }) => {
  describe('session', () => {
    describe('SET_SESSION', () => {
      it('should set the session', () => {
        const { store } = getStore();
        store.dispatch(sessionActions.setSession({ expires: null }));

        const { session } = store.getState();
        expect(session).to.eql({ expires: null });
      });
    });
  });
});
