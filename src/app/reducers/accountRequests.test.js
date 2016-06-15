import createTest from '@r/platform/createTest';

import accountRequests from './accountRequests';
import * as accountActions from 'app/actions/accounts';
import * as loginActions from 'app/actions/login';

const REQUIRED_KEYS = ['id', 'loading' ];

createTest({ reducers: { accountRequests } }, ({ getStore, expect }) => {
  describe('accountRequests', () => {

    describe('LOGGED_IN and LOGGED_OUT', () => {
      it('should return default on log in', () => {
        const { store } = getStore();
        store.dispatch(loginActions.loggedIn());

        const { accountRequests } = store.getState();
        expect(accountRequests).to.eql({});
      });

      it('should return default on log out', () => {
        const { store } = getStore();
        store.dispatch(loginActions.loggedOut());

        const { accountRequests } = store.getState();
        expect(accountRequests).to.eql({});
      });
    });

    describe('FETCHING_ACCOUNT', () => {
      it('should add an account optimistically', () => {
        const ACCOUNT = { id: 'foobar', loading: true };

        const { store } = getStore();
        store.dispatch(accountActions.fetching({ name: 'foobar' }));

        const { accountRequests } = store.getState();
        expect(accountRequests).to.have.keys('foobar');
        expect(accountRequests.foobar).to.have.all.keys(REQUIRED_KEYS);
        expect(accountRequests.foobar).to.eql(ACCOUNT);
      });
    });

    describe('RECEIVED_ACCOUNT', () => {
      it('should update an account when request is finished', () => {
        const RESULT = { type: 'account', uuid: 'me' };

        const { store } = getStore();
        store.dispatch(accountActions.received({ name: 'foobar' }, RESULT));

        const { accountRequests } = store.getState();
        expect(accountRequests).to.have.keys('foobar');
        expect(accountRequests.foobar).to.have.all.keys(REQUIRED_KEYS);
      });
    });
  });
});
