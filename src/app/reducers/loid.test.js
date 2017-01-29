import createTest from 'platform/createTest';
import * as loidActions from 'app/actions/loid';
import * as accountActions from 'app/actions/accounts';

import loid from './loid';

createTest({ reducers: { loid } }, ({ getStore, expect }) => {
  describe('loid', () => {
    describe('SET_LOID', () => {
      it('should set loid', () => {
        const LOID = 'EbxVm9pOhRDdk0Ck7S';
        const CREATED = '2016-05-27T05:05:49.012Z';
        const { store } = getStore();
        store.dispatch(loidActions.setLOID(LOID, CREATED));

        const { loid: { loid, loidCreated } } = store.getState();
        expect(loid).to.equal(LOID);
        expect(loidCreated).to.equal(CREATED);
      });

      it('should set loids when a new user account is fetched', () => {
        const LOID = 'EbxVm9pOhRDdk0Ck7S';
        const CREATED = '2016-05-27T05:05:49.012Z';
        const API_RESPONSE = {
          accounts: {
            me: { loid: LOID, loidCreated: CREATED },
          },
        };

        const { store } = getStore();
        store.dispatch(accountActions.received({}, API_RESPONSE));

        const { loid: { loid, loidCreated } } = store.getState();
        expect(loid).to.equal(LOID);
        expect(loidCreated).to.equal(CREATED);
      });
    });
  });
});
