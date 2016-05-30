import createTest from '@r/platform/createTest';

import * as loidActions from 'app/actions/loid';
import loid from './loid';

createTest({ reducers: { loid } }, ({ getStore, expect }) => {
  describe('loid', () => {
    describe('SET_LOID', () => {
      it('should set loid', () => {
        const LOID = 'EbxVm9pOhRDdk0Ck7S';
        const CREATED = '2016-05-27T05:05:49.012Z';
        const { store } = getStore();
        store.dispatch(loidActions.setLOID(LOID, CREATED));

        const { loid: { loid, loidcreated } } = store.getState();
        expect(loid).to.equal(LOID);
        expect(loidcreated).to.equal(CREATED);
      });
    });
  });
});
