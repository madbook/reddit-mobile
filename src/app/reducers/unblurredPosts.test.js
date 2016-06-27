import createTest from '@r/platform/createTest';

import unblurredPosts, { DEFAULT } from './unblurredPosts';
import * as loginActions from 'app/actions/login';
import * as postActions from 'app/actions/posts';

createTest({ reducers: { unblurredPosts } }, ({ getStore, expect }) => {
  describe('unblurredPosts', () => {
    describe('LOGGED_IN and LOGGED_OUT', () => {
      it('should return default on log in', () => {
        const { store } = getStore({
          unblurredPosts: {
            postId: true,
          },
        });

        store.dispatch(loginActions.loggedIn());
        const { unblurredPosts } = store.getState();
        expect(unblurredPosts).to.eql(DEFAULT);
      });

      it('should return default on log out', () => {
        const { store } = getStore({
          unblurredPosts: {
            postId: true,
          },
        });

        store.dispatch(loginActions.loggedOut());
        const { unblurredPosts } = store.getState();
        expect(unblurredPosts).to.eql(DEFAULT);
      });
    });

    describe('TOGGLE_NSFW_BLUR', () => {
      it('should set a post to true for unblurred', () => {
        const { store } = getStore();

        const postId = 't3_test';
        store.dispatch(postActions.toggleNSFWBlur(postId));
        const { unblurredPosts } = store.getState();
        expect(unblurredPosts).to.eql({
          [postId]: true,
        });
      });

      it('should toggle the blurred state if the post is already unblurred', () => {
        const postId = 't3_test';
        const { store } = getStore({
          unblurredPosts: {
            [postId]: true,
          },
        });

        store.dispatch(postActions.toggleNSFWBlur(postId));
        const { unblurredPosts } = store.getState();
        expect(unblurredPosts).to.eql({
          [postId]: false,
        });
      });
    });
  });
});
