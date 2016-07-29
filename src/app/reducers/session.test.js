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

    describe('SESSION_ERROR', () => {
      it('should set the session error', () => {
        const { store } = getStore();
        store.dispatch(sessionActions.sessionError('SNOO_WAS_HERE'));

        const { session } = store.getState();
        expect(session).to.eql({ error: 'SNOO_WAS_HERE' });
      });
    });
  });
});
