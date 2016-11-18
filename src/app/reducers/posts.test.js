import createTest from '@r/platform/createTest';

import posts from './posts';

import * as loginActions from 'app/actions/login';
import * as activitiesActions from 'app/actions/activities';
import * as commentsPageActions from 'app/actions/commentsPage';
import * as postActions from 'app/actions/posts';
import * as postsListActions from 'app/actions/postsList';
import * as hiddenActions from 'app/actions/hidden';
import * as savedActions from 'app/actions/saved';
import * as searchActions from 'app/actions/search';
import * as voteActions from 'app/actions/vote';
import * as mailActions from 'app/actions/mail';

createTest({ reducers: { posts } }, ({ getStore, expect }) => {
  describe('posts', () => {
    describe('LOGGED_IN and LOGGED_OUT', () => {
      it('should return default on on log out', () => {
        const { store } = getStore({
          posts: { t3_1: {} },
        });

        store.dispatch(loginActions.loggedOut());
        const { posts } = store.getState();
        expect(posts).to.eql({});
      });

      it('should return default on log in', () => {
        const { store } = getStore({
          posts: { t3_1: {} },
        });

        store.dispatch(loginActions.loggedIn());
        const { posts } = store.getState();
        expect(posts).to.eql({});
      });
    });

    describe('receiving posts', () => {
      const POST_SOURCE_ACTION_CREATORS = [
        activitiesActions.received,
        commentsPageActions.received,
        postsListActions.received,
        hiddenActions.received,
        savedActions.received,
        searchActions.received,
        mailActions.setInboxSuccess,
      ];

      it('should pull posts from all expected soure actions', () => {
        POST_SOURCE_ACTION_CREATORS.forEach((actionCreator) => {
          const POST = {
            uuid: 't3_1',
            subreddit: 'reactjs',
          };

          const { store } = getStore();
          store.dispatch(actionCreator('', {
            posts: {
              [POST.uuid]: POST,
            },
          }));
        });
      });
    });

    describe('SAVED', () => {
      it('should mark a post as saved', () => {
        const POST = {
          type: 'post',
          uuid: 't3_1',
          saved: false,
        };

        const SAVED = {
          ...POST,
          saved: true,
        };

        const { store } = getStore({
          posts: {
            [POST.uuid]: POST,
          },
        });

        store.dispatch(postActions.toggleSavedReceived(SAVED));
        const { posts } = store.getState();
        expect(posts).to.eql({
          [SAVED.uuid]: SAVED,
        });
      });

      it('should mark a post as un-saved', () => {
        const POST = {
          type: 'post',
          uuid: 't3_1',
          saved: true,
        };

        const UNSAVED = {
          ...POST,
          saved: false,
        };

        const { store } = getStore({
          posts: {
            [POST.uuid]: POST,
          },
        });

        store.dispatch(postActions.toggleSavedReceived(UNSAVED));
        const { posts } = store.getState();
        expect(posts).to.eql({
          [UNSAVED.uuid]: UNSAVED,
        });
      });
    });

    describe('HIDDEN', () => {
      it('should mark a post as hidden', () => {
        const POST = {
          type: 'post',
          uuid: 't3_1',
          hidden: false,
        };

        const HIDDEN = {
          ...POST,
          hidden: true,
        };

        const { store } = getStore({
          posts: {
            [POST.uuid]: POST,
          },
        });

        store.dispatch(postActions.toggleHideReceived(HIDDEN));
        const { posts } = store.getState();
        expect(posts).to.eql({
          [HIDDEN.uuid]: HIDDEN,
        });
      });

      it('should un-hide a post', () => {
        const POST = {
          type: 'post',
          uuid: 't3_1',
          hidden: true,
        };

        const UNHIDDEN = {
          ...POST,
          hidden: false,
        };

        const { store } = getStore({
          posts: {
            [POST.uuid]: POST,
          },
        });

        store.dispatch(postActions.toggleHideReceived(UNHIDDEN));
        const { posts } = store.getState();
        expect(posts).to.eql({
          [UNHIDDEN.uuid]: UNHIDDEN,
        });
      });
    });

    describe('VOTED', () => {
      it('should update the score of a post when you vote on it', () => {
        const POST = {
          type: 'post',
          uuid: 't3_1',
          score: 0,
          likes: 0,
        };

        const UPVOTED = {
          ...POST,
          likes: 1,
          score: 1,
        };

        const { store } = getStore({
          posts: {
            [POST.uuid]: POST,
          },
        });

        store.dispatch(voteActions.success(UPVOTED.uuid, UPVOTED));
        const { posts } = store.getState();
        expect(posts).to.eql({
          [UPVOTED.uuid]: UPVOTED,
        });
      });

      it('should not update the score of a post when comments are voted on', () => {
        const POST = {
          type: 'post',
          uuid: 't3_1',
          score: 0,
          likes: 0,
        };

        const { store } = getStore({
          posts: {
            [POST.uuid]: POST,
          },
        });

        store.dispatch(voteActions.success('2', { type: 'comment' }));
        const { posts } = store.getState();

        expect(posts).to.eql({
          [POST.uuid]: POST,
        });
      });
    });
  });
});
