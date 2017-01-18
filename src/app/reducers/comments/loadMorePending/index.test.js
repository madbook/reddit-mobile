import createTest from '@r/platform/createTest';

import loadMorePending from './index';
import * as commentActions from 'app/actions/comment';

createTest({ reducers: { loadMorePending } }, ({ getStore, expect }) => {
  describe('REDUCER - comments.loadMorePending', () => {
    it('should mark a load more comments object as pending the api', () => {
      const { store } = getStore();
      const loadMoreId = 'foo';

      store.dispatch(commentActions.pending(loadMoreId));
      expect(store.getState().loadMorePending).to.eql({ [loadMoreId]: true });
    });

    it('should remove the mark when the call succeeds', () => {
      const { store } = getStore();
      const loadMoreId = 'foo';

      store.dispatch(commentActions.pending(loadMoreId));
      store.dispatch(commentActions.success({}, 'pageId', loadMoreId));
      expect(store.getState().loadMorePending).to.eql({ [loadMoreId]: false });
    });

    it('should remove the mark when the call fails', () => {
      const { store } = getStore();
      const loadMoreId = 'foo';

      store.dispatch(commentActions.pending(loadMoreId));
      store.dispatch(commentActions.failure(loadMoreId));
      expect(store.getState().loadMorePending).to.eql({ [loadMoreId]: false });
    });
  });
});
