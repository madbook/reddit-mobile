import createTest from '@r/platform/createTest';
import { models } from '@r/api-client';
const { CommentModel } = models;

import comments from './comments';

import * as loginActions from 'app/actions/login';
import * as activitiesActions from 'app/actions/activities';
import * as commentsPageActions from 'app/actions/commentsPage';
import * as postsListActions from 'app/actions/postsList';
import * as hiddenActions from 'app/actions/hidden';
import * as replyActions from 'app/actions/reply';
import * as savedActions from 'app/actions/saved';
import * as searchActions from 'app/actions/search';
import * as voteActions from 'app/actions/vote';
import * as mailActions from 'app/actions/mail';

createTest({ reducers: { comments} }, ({ getStore, expect }) => {
  describe('comments', () => {
    describe('LOGGED_IN and LOGGED_OUT', () => {
      it('should return default on log out', () => {
        const { store } = getStore({
          comments: { t1_1: {} },
        });

        store.dispatch(loginActions.loggedOut());
        const { comments } = store.getState();
        expect(comments).to.eql({});
      });

      it('should return the default on log in', () => {
        const { store } = getStore({
          comments: { t1_1: {} },
        });

        store.dispatch(loginActions.loggedIn());
        const { comments } = store.getState();
        expect(comments).to.eql({});
      });
    });

    describe('receiving comments', () => {
      const COMMENT_SOURCE_ACTION_CREATORS = [
        activitiesActions.received,
        commentsPageActions.received,
        postsListActions.received,
        hiddenActions.received,
        savedActions.received,
        searchActions.received,
        mailActions.setInboxSuccess,
      ];

      it('should pull comments from all expected source actions', () => {
        COMMENT_SOURCE_ACTION_CREATORS.forEach((actionCreator) => {
          const COMMENT = {
            uuid: 't1_0001',
            selfText: 'here, have an upvote',
          };

          const { store } = getStore();
          store.dispatch(actionCreator('', {
            comments: {
              [COMMENT.uuid]: COMMENT,
            },
          }));

          const { comments } = store.getState();
          expect(comments).to.eql({
            [COMMENT.uuid]: COMMENT,
          });
        });
      });
    });

    describe('REPLIED', () => {
      // These tests use real comment models because we want to ensure
      // that replying adds to the replies field of other comments in the store.
      // Our models are immutable and this is done by calling `commentModel.set`,
      // which will generate a new model with the changes you give it, so we need
      // the real model in place for that.

      it('should add a new comment to the tree if there was a reply', () => {
        const COMMENT = CommentModel.fromJSON({
          name: 't1_1',
          id: '1',
          subreddit: 'askreddit',
          link_id: '1',
          replies: [],
        });

        const REPLY = CommentModel.fromJSON({
          parentId: COMMENT.uuid,
          name: 't1_2',
          id: '2',
          subreddit: COMMENT.subreddit,
          link_id: COMMENT.linkId,
          replies: [],
        });

        const { store } = getStore({
          comments: {
            [COMMENT.uuid]: COMMENT,
          },
        });

        store.dispatch(replyActions.replied(REPLY.parentId, REPLY));

        const { comments } = store.getState();
        expect(comments).to.eql({
          [COMMENT.uuid]: COMMENT.set({ replies: [ REPLY.toRecord() ] }),
          [REPLY.uuid]: REPLY,
        });
      });

      it('should not add replies to the wrong parent', () => {
        const COMMENT = CommentModel.fromJSON({
          name: 't1_1',
          id: '1',
          subreddit: 'askreddit',
          link_id: '1',
          replies: [],
        });

        const POST_REPLY = CommentModel.fromJSON({
          parentId: 't3_1',
          name: 't1_2',
          id: '2',
          subreddit: COMMENT.subreddit,
          link_id: COMMENT.linkId,
          replies: [],
        });

        const { store } = getStore({
          comments: {
            [COMMENT.uuid]: COMMENT,
          },
        });

        store.dispatch(replyActions.replied(POST_REPLY.parentId, POST_REPLY));
        const { comments } = store.getState();

        expect(comments).to.eql({
          [COMMENT.uuid]: COMMENT,
          [POST_REPLY.uuid]: POST_REPLY,
        });
      });
    });

    describe('VOTED', () => {
      it('should update the score of a comment when you vote on it', () => {
        const COMMENT = {
          type: 'comment',
          uuid: 't1_1',
          subreddit: 'askreddit',
          score: 0,
          likes: 0,
        };

        const UPVOTED = {
          ...COMMENT,
          likes: 1,
          score: 1,
        };

        const { store } = getStore({
          comments: {
            [COMMENT.uuid]: COMMENT,
          },
        });

        store.dispatch(voteActions.voted(UPVOTED.uuid, UPVOTED));
        const { comments } = store.getState();

        expect(comments).to.eql({
          [COMMENT.uuid]: UPVOTED,
        });
      });

      it('should not update the score of comments when a post is voted on', () => {
        const COMMENT = {
          uuid: 't1_1',
          subreddit: 'askreddit',
          score: 0,
          likes: 0,
        };

        const { store } = getStore({
          comments: {
            [COMMENT.uuid]: COMMENT,
          },
        });

        store.dispatch(voteActions.voted('2', { type: 'post' }));
        const { comments } = store.getState();

        expect(comments).to.eql({
          [COMMENT.uuid]: COMMENT,
        });
      });
    });
  });
});
