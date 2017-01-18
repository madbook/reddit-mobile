import createTest from '@r/platform/createTest';

import loadMoreComments from './index';
import * as commentsPageActions from 'app/actions/commentsPage';
import * as commentActions from 'app/actions/comment';

createTest({ reducers: { loadMoreComments } }, ({ getStore, expect }) => {
  describe('REDUCER - loadMoreComments.data', () => {
    it('should merge a new "load more" object in when available', () => {
      const { store } = getStore();
      const TEST_DATA = { commentLoadMoreObjects: { foo: { id: 'foo' } } };

      store.dispatch(commentsPageActions.received('pageId', TEST_DATA));

      expect(store.getState().loadMoreComments).to.eql(TEST_DATA.commentLoadMoreObjects);
    });

    it('should merge in a new "load more" obj from the \'load more comments\' api', () => {
      const { store } = getStore();
      const TEST_DATA = { commentLoadMoreObjects: { foo: { id: 'foo' } } };

      store.dispatch(commentActions.success(TEST_DATA, 'pageid'));

      expect(store.getState().loadMoreComments).to.eql(TEST_DATA.commentLoadMoreObjects);
    });
  });
});
