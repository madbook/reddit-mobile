import createTest from 'platform/createTest';
import * as platformActions from 'platform/actions';
import * as postActions from 'app/actions/posts';
import routes from 'app/router';
import playingPosts, { DEFAULT } from './playingPosts';

createTest({ reducers: { playingPosts }, routes }, ({ getStore, expect }) => {
  describe('playingPosts', () => {
    describe('GOTO_PAGE_INDEX', () => {
      it('should reset PlayingPosts to default', () => {
        const { store } = getStore({ playingPosts: { 'id23e': true }});

        store.dispatch(platformActions.gotoPageIndex());
        const { playingPosts } = store.getState();
        expect(playingPosts).to.eql(DEFAULT);
      });
    });

    describe('SET_PAGE', () => {
      it('should reset state to a blank object', () => {
        const { store } = getStore({ playingPosts: { 'id23e': true }});
        
        store.dispatch(platformActions.setPage('/', {}));
        const { playingPosts } = store.getState();
        expect(playingPosts).to.eql(DEFAULT);
      });

      it('should leave post playing state if user is going to comment page', () => {
        const postId = 'id23e';
        const playingState = { [postId]: true };
        const { store } = getStore({ playingPosts: playingState });

        store.dispatch(platformActions.setPage(`/comments/${postId}`, { urlParams: { postId: postId }}));
        const { playingPosts } = store.getState();
        expect(playingPosts).to.eql(playingState);
      });
    });

    describe('START_PLAYING', () => {
      it('should add post id to playingPosts if not present', () => {
        const postId = 'id23e';
        const { store } = getStore({ playingPosts: {}});

        store.dispatch(postActions.startPlaying(postId));
        const { playingPosts } = store.getState();
        expect(playingPosts[postId]);
      });
    });

    describe('STOP_PLAYING', () => {
      it('should remove id from playingPosts if it is present', () => {
        const postId = 'id23e';
        const { store } = getStore({ playingPosts: { [postId]: true }});

        store.dispatch(postActions.stopPlaying(postId));
        const { playingPosts } = store.getState();
        expect(playingPosts).to.eql(DEFAULT);
      });
    });
  });
});

