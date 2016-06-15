import createTest from '@r/platform/createTest';

import accounts from './accounts';
import * as accountActions from 'app/actions/accounts';
import * as loginActions from 'app/actions/login';

createTest({ reducers: { accounts } }, ({ getStore, expect }) => {
  describe('accounts', () => {
    describe('LOGGED_IN and LOGGED_OUT', () => {
      it('should return default on log out', () => {
        const { store } = getStore({
          accounts: {
            't2_0001': { name: 'test account' },
          },
        });

        store.dispatch(loginActions.loggedOut());
        const { accounts } = store.getState();
        expect(accounts).to.eql({});
      });

      it('should return the default on log in', () => {
        const { store } = getStore({
          accounts: {
            't2_0001': { name: 'test account' },
          },
        });

        store.dispatch(loginActions.loggedIn());
        const { accounts } = store.getState();
        expect(accounts).to.eql({});
      });
    });

    describe('RECEIVED_ACCOUNT', () => {
      it('should pull account models out of accountActions.received', () => {
        const { store } = getStore();

        const ACCOUNT = {
          uuid: 't2_0001',
          name: 'test account',
        };

        store.dispatch(accountActions.received({}, {
          accounts: {
            [ACCOUNT.uuid]: ACCOUNT,
          },
        }));

        const { accounts } = store.getState();
        expect(accounts).to.eql({
          [ACCOUNT.uuid]: ACCOUNT,
        });
      });
    });
  });
});
