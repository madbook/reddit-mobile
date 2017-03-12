import createTest from 'platform/createTest';
import * as loidActions from 'app/actions/loid';
import * as accountActions from 'app/actions/accounts';

import loid, { DEFAULT } from './loid';

createTest({ reducers: { loid } }, ({ getStore, expect }) => {
  describe('loid', () => {
    describe('SET_LOID', () => {
      it('should set loid', () => {
        const LOID = 'EbxVm9pOhRDdk0Ck7S';
        const CREATED = '2016-05-27T05:05:49.012Z';
        const { store } = getStore();
        store.dispatch(loidActions.setLOID({
          loid: LOID,
          loidCookie: LOID,
          loidCreated: CREATED,
          loidCreatedCookie: CREATED,
        }));

        const { loid: { loid, loidCreated } } = store.getState();
        expect(loid).to.equal(LOID);
        expect(loidCreated).to.equal(CREATED);
      });

      it('should set loids when the current user account is fetched', () => {
        const LOID = 'EbxVm9pOhRDdk0Ck7S';
        const CREATED = '2016-05-27T05:05:49.012Z';
        const API_RESPONSE = {
          accounts: {
            me: {
              ...DEFAULT,
              loid: LOID,
              loidCreated: CREATED,
            },
          },
          meta: {},
        };

        const { store } = getStore();
        store.dispatch(accountActions.received({}, API_RESPONSE));

        const { loid: { loid, loidCreated } } = store.getState();
        expect(loid).to.equal(LOID);
        expect(loidCreated).to.equal(CREATED);
      });

      it('should update the loid and loicreated cookies when the current user is fetched', () => {
        const LOID = 'abcefg1234';
        const CREATED = '123456000';
        const tomorrow = (() => {
          const now = new Date();
          now.setHours(24);
          return now.toUTCString();
        })();
        const setCookie = (name, value) => `${name}=${value}; path=/; expires=${tomorrow}`;
        const API_RESPONSE = {
          accounts: {
            me: DEFAULT,
          },
          meta: {
            'set-cookie': [
              setCookie('loid', LOID),
              setCookie('loidcreated', CREATED),
            ],
          },
        };

        const { store } = getStore();
        store.dispatch(accountActions.received({}, API_RESPONSE));

        const { loid: { loidCookie, loidCreatedCookie }} = store.getState();
        expect(loidCookie).to.equal(LOID);
        expect(loidCreatedCookie).to.equal(CREATED);
      });

      it('should not set loids when a different user account is received', () => {
        const LOID = 'EbxVm9pOhRDdk0Ck7S';
        const CREATED = '2016-05-27T05:05:49.012Z';
        const API_RESPONSE = {
          accounts: {
            some_other_account: { loid: 'foobar', loidCreated: '12341234000' },
          },
        };

        const { store } = getStore();
        store.dispatch(loidActions.setLOID({
          loid: LOID,
          loidCookie: LOID,
          loidCreated: CREATED,
          loidCreatedCookie: CREATED,
        }));
        store.dispatch(accountActions.received({}, API_RESPONSE));

        const { loid: { loid, loidCreated } } = store.getState();
        expect(loid).to.equal(LOID);
        expect(loidCreated).to.equal(CREATED);
      });
    });
  });
});
