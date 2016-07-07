import createTest from '@r/platform/createTest';

import editingComment from './editingComment';
import * as commentActions from 'app/actions/comment';

createTest({ reducers: { editingComment } }, ({ getStore, expect }) => {
  describe('editComments', () => {
    it('should note which comment is being edited', () => {
      const { store } = getStore();
      store.dispatch(commentActions.toggleEditForm('test-id'));
      expect(store.getState().editingComment).to.eql('test-id');
    });

    it('should remove the reference to the comment being edited', () => {
      const { store } = getStore({ editingComment: 'test-id' });
      store.dispatch(commentActions.toggleEditForm(null));
      expect(store.getState().editingComment).to.eql(null);
    });

    it('should toggle the edit state of a comment', () => {
      const { store } = getStore({ editingComment: 'test-id' });
      store.dispatch(commentActions.toggleEditForm('test-id'));
      expect(store.getState().editingComment).to.eql(null);
    });
  });
});
