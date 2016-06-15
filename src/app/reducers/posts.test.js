import createTest from '@r/platform/createTest';

import posts from './posts';

import * as loginActions from 'app/actions/login';
import * as activitiesActions from 'app/actions/activities';
import * as commentsPageActions from 'app/actions/commentsPage';
import * as postsListActions from 'app/actions/postsList';
import * as hiddenActions from 'app/actions/hidden';
import * as savedActions from 'app/actions/saved';
import * as searchActions from 'app/actions/search';
import * as voteActions from 'app/actions/vote';

createTest({ reducers: { posts} }, ({ getStore, expect}) => {
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

        store.dispatch(voteActions.voted(UPVOTED.uuid, UPVOTED));
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

        store.dispatch(voteActions.voted('2', { type: 'comment' }));
        const { posts } = store.getState();

        expect(posts).to.eql({
          [POST.uuid]: POST,
        });
      });
    });
  });
});
