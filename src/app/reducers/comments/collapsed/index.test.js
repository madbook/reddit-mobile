import createTest from 'platform/createTest';

import collapsed from './index';
import * as commentActions from 'app/actions/comment';

createTest({ reducers: { collapsed } }, ({ getStore, expect }) => {
  describe('REDUCER - comments.collapsed', () => {
    it('should alter the collapse state of a comment', () => {
      const { store } = getStore();
      expect(store.getState().collapsed).to.eql({});
      store.dispatch(commentActions.toggleCollapse('foo'));
      expect(store.getState().collapsed).to.eql({ foo: true });
      store.dispatch(commentActions.toggleCollapse('foo'));
      expect(store.getState().collapsed).to.eql({ foo: false });
    });
  });
});
