import createTest from '@r/platform/createTest';

import modal from './modal';
import * as modalActions from 'app/actions/modal';
import * as reportingActions from 'app/actions/reporting';

createTest({ reducers: { modal } }, ({ getStore, expect }) => {
  describe('modal', () => {
    it('should show when a user wants to report something', () => {
      const { store } = getStore();
      store.dispatch(reportingActions.report('1'));

      const { modal } = store.getState();
      expect(modal).to.eql({
        type: reportingActions.MODAL_TYPE,
        props: { thingId: '1' },
      });
    });

    it('should be able to close', () => {
      const { store } = getStore();
      store.dispatch(modalActions.closeModal());

      const { modal } = store.getState();
      expect(modal).to.eql({ type: null, props: {} });
    });
  });
});
