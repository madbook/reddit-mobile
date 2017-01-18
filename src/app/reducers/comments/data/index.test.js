import createTest from '@r/platform/createTest';

import comments from './index';
import * as commentActions from 'app/actions/comment';
import * as commentsPageActions from 'app/actions/commentsPage';
import * as modToolActions from 'app/actions/modTools';

import CommentModel from 'apiClient/models/CommentModel';
createTest({ reducers: { comments } }, ({ getStore, expect }) => {
  describe('REDUCER - comments.data', () => {
    it('should merge a new comment in when available', () => {
      const { store } = getStore();
      const TEST_DATA = { comments: { foo: { id: 'foo' } } };

      store.dispatch(commentsPageActions.received('pageId', TEST_DATA));

      expect(store.getState().comments).to.eql(TEST_DATA.comments);
    });

    it('should merge in comments from the \'load more comments\' api', () => {
      const { store } = getStore();
      const TEST_DATA = { comments: { foo: { id: 'foo' } } };

      store.dispatch(commentActions.success(TEST_DATA, 'pageId'));

      expect(store.getState().comments).to.eql(TEST_DATA.comments);
    });

    describe('MODTOOLS_APPROVAL_SUCCESS', () => {
      it('should mark a comment as approved', () => {
        const COMMENT = CommentModel.fromJSON({
          name: 't3_1',
          id: '1',
          subreddit: 'askreddit',
          link_id: '1',
          replies: [],
          author: 'nramadas',
          bodyHTML: 'nramadas is the best',
          approved: null,
          removed: null,
          spam: null,
          approvedBy: null,
          bannedBy: null,
          type: 'comment',
        });

        const APPROVED = COMMENT.set({
          approved: true,
          removed: false,
          spam: false,
          approvedBy: 'foobar',
        });

        const { store } = getStore({
          comments: {
            [COMMENT.uuid]: COMMENT,
          },
        });

        store.dispatch(modToolActions.approvalSuccess(COMMENT, 'foobar'));

        const { comments } = store.getState();
        expect(comments).to.eql({
          [COMMENT.uuid]: APPROVED,
        });
      });

      it('should only update if thing.type is COMMENT', () => {
        const NOT_COMMENT = {
          type: 'BAD_TYPE',
        };

        const COMMENT = CommentModel.fromJSON({
          name: 't3_1',
          id: '1',
          subreddit: 'askreddit',
          link_id: '1',
          replies: [],
          author: 'nramadas',
          bodyHTML: 'nramadas is the best',
          approved: null,
          removed: null,
          spam: null,
          approvedBy: null,
          bannedBy: null,
          type: 'comment',
        });

        const { store } = getStore({
          comments: {
            [COMMENT.uuid]: COMMENT,
          },
        });

        // This should not do anything to the comment model
        store.dispatch(modToolActions.approvalSuccess(NOT_COMMENT, 'foobar'));

        const { comments } = store.getState();
        expect(comments).to.eql({
          [COMMENT.uuid]: COMMENT,
        });

      });
    });

    describe('MODTOOLS_REMOVAL_SUCCESS', () => {
      it('should mark a comment as removed', () => {
        const COMMENT = CommentModel.fromJSON({
          name: 't3_1',
          id: '1',
          subreddit: 'askreddit',
          link_id: '1',
          replies: [],
          author: 'nramadas',
          bodyHTML: 'nramadas is the best',
          approved: null,
          removed: null,
          spam: null,
          approvedBy: null,
          bannedBy: null,
          type: 'comment',
        });

        const REMOVED = COMMENT.set({
          approved: false,
          removed: true,
          spam: false,
          bannedBy: 'foobar',
        });

        const { store } = getStore({
          comments: {
            [COMMENT.uuid]: COMMENT,
          },
        });

        store.dispatch(modToolActions.removalSuccess(false, COMMENT, 'foobar'));

        const { comments } = store.getState();
        expect(comments).to.eql({
          [COMMENT.uuid]: REMOVED,
        });
      });

      it('should mark a comment as spam', () => {
        const COMMENT = CommentModel.fromJSON({
          name: 't3_1',
          id: '1',
          subreddit: 'askreddit',
          link_id: '1',
          replies: [],
          author: 'nramadas',
          bodyHTML: 'nramadas is the best',
          approved: null,
          removed: null,
          spam: null,
          approvedBy: null,
          bannedBy: null,
          type: 'comment',
        });

        const SPAM = COMMENT.set({
          approved: false,
          removed: false,
          spam: true,
          bannedBy: 'foobar',
        });

        const { store } = getStore({
          comments: {
            [COMMENT.uuid]: COMMENT,
          },
        });

        store.dispatch(modToolActions.removalSuccess(true, COMMENT, 'foobar'));

        const { comments } = store.getState();
        expect(comments).to.eql({
          [COMMENT.uuid]: SPAM,
        });
      });

      it('should only update if thing.type is COMMENT', () => {
        const NOT_COMMENT = {
          type: 'BAD_TYPE',
        };

        const COMMENT = CommentModel.fromJSON({
          name: 't3_1',
          id: '1',
          subreddit: 'askreddit',
          link_id: '1',
          replies: [],
          author: 'nramadas',
          bodyHTML: 'nramadas is the best',
          approved: null,
          removed: null,
          spam: null,
          approvedBy: null,
          bannedBy: null,
          type: 'comment',
        });

        const { store } = getStore({
          comments: {
            [COMMENT.uuid]: COMMENT,
          },
        });

        // This should not do anything to the comment model
        store.dispatch(modToolActions.removalSuccess(NOT_COMMENT, 'foobar'));

        const { comments } = store.getState();
        expect(comments).to.eql({
          [COMMENT.uuid]: COMMENT,
        });
      });
    });

    describe('MODTOOLS_SET_STICKY_COMMENT_SUCCESS', () => {
      it('should mark a comment as sticky', () => {
        const COMMENT_UNSTICKIED = CommentModel.fromJSON({
          link_id: '1',
          name: 't1_1',
          stickied: false,
        });

        const COMMENT_STICKIED = CommentModel.fromJSON({
          link_id: '1',
          name: 't1_1',
          stickied: true,
        });

        const { store } = getStore({
          comments: {
            [COMMENT_UNSTICKIED.uuid]: COMMENT_UNSTICKIED,
          },
        });

        store.dispatch(modToolActions.setStickyCommentSuccess(COMMENT_UNSTICKIED, true));

        const { comments } = store.getState();
        expect(comments).to.eql({
          [COMMENT_UNSTICKIED.uuid]: COMMENT_STICKIED,
        });
      });

      it('should unmark a comment as sticky', () => {
        const COMMENT_UNSTICKIED = CommentModel.fromJSON({
          link_id: '1',
          name: 't1_1',
          stickied: false,
        });

        const COMMENT_STICKIED = CommentModel.fromJSON({
          link_id: '1',
          name: 't1_1',
          stickied: true,
        });

        const { store } = getStore({
          comments: {
            [COMMENT_STICKIED.uuid]: COMMENT_STICKIED,
          },
        });

        store.dispatch(modToolActions.setStickyCommentSuccess(COMMENT_STICKIED, false));

        const { comments } = store.getState();
        expect(comments).to.eql({
          [COMMENT_STICKIED.uuid]: COMMENT_UNSTICKIED,
        });
      });
    });
  });
});
