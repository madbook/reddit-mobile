import createTest from '@r/platform/createTest';

import replying from './replying';
import * as commentActions from 'app/actions/comment';

createTest({ reducers: { replying } }, ({ getStore, expect }) => {
  describe('replying', () => {
    describe('REPLYING', () => {
      const ID = '1';
      it('should set the comment\'s state to true', () => {
        const { store } = getStore();
        store.dispatch(commentActions.replying(ID, 'foo'));

        const { replying } = store.getState();
        expect(replying[ID]).to.be.equal(true);
      });

      it('remove the comment from the state', () => {
        const { store } = getStore({ replying: { [ID]: true } });
        store.dispatch(commentActions.replied(ID, 'foo'));

        const { replying } = store.getState();
        expect(replying).to.be.eql({});
      });
    });
  });
});
