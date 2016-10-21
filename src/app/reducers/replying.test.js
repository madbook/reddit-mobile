import createTest from '@r/platform/createTest';

import replying from './replying';
import * as replyActions from 'app/actions/reply';

createTest({ reducers: { replying } }, ({ getStore, expect }) => {
  describe('replying', () => {
    const ID = '1';
    it('should set the reply state to true when currently replying', () => {
      const { store } = getStore();
      store.dispatch(replyActions.toggle(ID));

      const { replying } = store.getState();
      expect(replying[ID]).to.be.equal(true);
    });

    it('should set the reply state to false when toggled off', () => {
      const { store } = getStore({ replying: { [ID]: true } });
      store.dispatch(replyActions.toggle(ID));

      const { replying } = store.getState();
      expect(replying[ID]).to.be.equal(false);
    });

    it('should set the reply state to false when submitted successfully', () => {
      const { store } = getStore({ replying: { [ID]: true } });
      store.dispatch({ id: '1', type: replyActions.SUCCESS });

      const { replying } = store.getState();
      expect(replying[ID]).to.be.equal(false);
    });
  });
});
