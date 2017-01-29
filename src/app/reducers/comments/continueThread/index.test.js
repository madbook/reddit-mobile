import createTest from 'platform/createTest';

import continueThread from './index';
import * as commentActions from 'app/actions/comment';
import * as commentsPageActions from 'app/actions/commentsPage';

createTest({ reducers: { continueThread } }, ({ getStore, expect }) => {
  describe('REDUCER - continueThread.data', () => {
    it('should merge a new "continue thread" object in when available', () => {
      const { store } = getStore();
      const TEST_DATA = { continueThreadObjects: { foo: { id: 'foo' } } };

      store.dispatch(commentsPageActions.received('id', TEST_DATA));

      expect(store.getState().continueThread).to.eql(TEST_DATA.continueThreadObjects);
    });

    it('should merge a new "continue thread" obj in from more comments request', () => {
      const { store } = getStore();
      const TEST_DATA = { continueThreadObjects: { foo: { id: 'foo' } } };

      store.dispatch(commentActions.success(TEST_DATA, 'pageId'));

      expect(store.getState().continueThread).to.eql(TEST_DATA.continueThreadObjects);
    });
  });
});
