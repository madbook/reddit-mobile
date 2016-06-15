import createTest from '@r/platform/createTest';

import replying from './replying';
import * as replyActions from 'app/actions/reply';

createTest({ reducers: { replying } }, ({ getStore, expect }) => {
  describe('replying', () => {
    describe('REPLYING', () => {
      const ID = '1';
      it('should set the models\'s reply state to true', () => {
        const { store } = getStore();
        store.dispatch(replyActions.replying(ID, 'foo'));

        const { replying } = store.getState();
        expect(replying[ID]).to.be.equal(true);
      });

      it('remove the model from the state', () => {
        const { store } = getStore({ replying: { [ID]: true } });
        store.dispatch(replyActions.replied(ID, 'foo'));

        const { replying } = store.getState();
        expect(replying).to.be.eql({});
      });
    });
  });
});
