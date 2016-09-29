import createTest from '@r/platform/createTest';
import * as platformActions from '@r/platform/actions';

import toaster, { GENERIC_ERROR } from './toaster';
import * as postingActions from 'app/actions/posting';
import * as toasterActions from 'app/actions/toaster';
import * as reportingActions from 'app/actions/reporting';

createTest({ reducers: { toaster } }, ({ getStore, expect }) => {
  describe('toaster: ', () => {
    it('should show close upon navigation away', () => {
      const { store } = getStore();
      store.dispatch({ type: postingActions.VALIDATION_FAILURE, message: 'foo' });

      const { toaster } = store.getState();
      expect(toaster).to.eql({
        isOpen: true,
        type: toasterActions.TYPES.ERROR,
        message: 'foo',
      });
    });

    it('should show a posting validation failure', () => {
      const { store } = getStore();
      store.dispatch({ type: postingActions.VALIDATION_FAILURE, message: 'foo' });

      const { toaster } = store.getState();
      expect(toaster).to.eql({
        isOpen: true,
        type: toasterActions.TYPES.ERROR,
        message: 'foo',
      });
    });

    it('should show a reporting api failure', () => {
      const { store } = getStore();
      store.dispatch({ type: reportingActions.FAILURE });

      const { toaster } = store.getState();
      expect(toaster).to.eql({
        isOpen: true,
        type: toasterActions.TYPES.ERROR,
        message: GENERIC_ERROR,
      });
    });


    it('should show a generic exception', () => {
      const { store } = getStore();
      store.dispatch({ type: postingActions.FAILURE });

      const { toaster } = store.getState();
      expect(toaster).to.eql({
        isOpen: true,
        type: toasterActions.TYPES.ERROR,
        message: GENERIC_ERROR,
      });
    });

    it('should close upon CLOSE action', () => {
      const { store } = getStore({
        toaster: { isOpen: true, message: 'foo', type: 'bar' },
      });
      store.dispatch({ type: toasterActions.CLOSE });

      const { toaster } = store.getState();
      expect(toaster).to.eql({
        isOpen: false,
        type: null,
        message: null,
      });
    });

    it('should show close upon navigation away', () => {
      const { store } = getStore({ toaster: { isOpen: true } });
      store.dispatch(platformActions.setPage('/'));

      const { toaster } = store.getState();
      expect(toaster.isOpen).to.equal(false);
    });
  });
});
