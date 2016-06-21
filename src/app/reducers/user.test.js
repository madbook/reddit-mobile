import createTest from '@r/platform/createTest';

import user from './user';
import * as accountActions from 'app/actions/accounts';
import * as loginActions from 'app/actions/login';

createTest({ reducers: { user } }, ({ getStore, expect }) => {
  describe('user', () => {
    describe('LOGGED_IN and LOGGED_OUT', () => {
      it('should return default on log in', () => {
        const { store } = getStore({
          user: { name: 'tester', loggedOut: false },
        });
        store.dispatch(loginActions.loggedOut());

        const { user } = store.getState();
        expect(user).to.eql({ loggedOut: true });
      });

      it('should return default on log out', () => {
        const { store } = getStore({
          user: { name: 'tester', loggedOut: false },
        });
        store.dispatch(loginActions.loggedIn());

        const { user } = store.getState();
        expect(user).to.eql({ loggedOut: true });
      });
    });

    describe('FETCHING_ACCOUNT', () => {
      it('should not set the user if current loading state is true', () => {
        const { store } = getStore({ user: { loading: true } });
        store.dispatch(accountActions.fetching({ name: 'me', loggedOut: true }));

        const { user } = store.getState();
        expect(user).to.eql({ loading: true });
      });

      it('should not set the user if name isnt "me"', () => {
        const { store } = getStore();
        store.dispatch(accountActions.fetching({ name: 'foo', loggedOut: true }));

        const { user } = store.getState();
        expect(user).to.eql({ loggedOut: true });
      });

      it('should set the user if loading is false and the name is "me"', () => {
        const { store } = getStore({ user: { loading: false } });
        store.dispatch(accountActions.fetching({ name: 'me', loggedOut: true }));

        const { user } = store.getState();
        expect(user).to.eql({ loading: true, name: 'me', loggedOut: true });
      });
    });

    describe('RECEIVED_ACCOUNT', () => {
      it('should not set the user if name isnt "me"', () => {
        const { store } = getStore({
          user: { loggedOut: true, loading: true },
        });

        store.dispatch(accountActions.received({
          name: 'foo',
          loggedOut: true,
        }, {
          results: [ { type: 'account', uuid: 'me', paginationId: 'me' } ],
        }));

        const { user } = store.getState();
        expect(user).to.eql({ loggedOut: true, loading: true });
      });

      it('shouldnt set the user if the current name matches the action\'s uuid', () => {
        const { store } = getStore({
          user: { name: 'me', loggedOut: true, loading: true },
        });

        store.dispatch(accountActions.received({
          name: 'me',
          loggedOut: true,
        }, {
          results: [ { type: 'account', uuid: 'me', paginationId: 'me' } ],
        }));

        const { user } = store.getState();
        expect(user).to.eql({ name: 'me', loggedOut: true, loading: true });
      });

      it('should set the user', () => {
        const { store } = getStore({
          user: { loggedOut: true, loading: true },
        });

        store.dispatch(accountActions.received({
          name: 'me',
          loggedOut: true,
        }, {
          results: [ { type: 'account', uuid: 'me', paginationId: 'me' } ],
        }));

        const { user } = store.getState();
        expect(user).to.eql({ loading: false, name: 'me', loggedOut: true });
      });
    });
  });
});
