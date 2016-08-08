import createTest from '@r/platform/createTest';
import merge from '@r/platform/merge';
import { models } from '@r/api-client';

import postsLists from './postsLists';
import * as postsListActions from 'app/actions/postsList';
import * as loginActions from 'app/actions/login';

createTest({ reducers: { postsLists } }, ({ getStore, expect }) => {
  describe('postsLists', () => {
    describe('LOGGED_IN and LOGGED_OUT', () => {
      it('should return default on log in', () => {
        const { store } = getStore({
          postsLists: { request: {} },
        });
        store.dispatch({ type: loginActions.LOGGED_IN });

        const { postsLists } = store.getState();
        expect(postsLists).to.eql({});
      });

      it('should return default on log out', () => {
        const { store } = getStore({
          postsLists: { request: {} },
        });
        store.dispatch({ type: loginActions.LOGGED_OUT });

        const { postsLists } = store.getState();
        expect(postsLists).to.eql({});
      });
    });

    describe('FETCHING_POSTS_LIST', () => {
      const POSTS_LIST_ID = '1';

      it('should try the cache for a pre-existing postsList first', () => {
        const CACHED_POSTS_LIST = {
          id: POSTS_LIST_ID,
          params: { sort: 'hot' },
          loading: false,
          results: [],
          responseCode: null,
        };

        const { store } = getStore({
          postsLists: { [POSTS_LIST_ID]: CACHED_POSTS_LIST },
        });

        store.dispatch(postsListActions.fetching(
          POSTS_LIST_ID,
          { sort: 'hot' },
        ));

        const { postsLists } = store.getState();
        expect(postsLists[POSTS_LIST_ID]).to.equal(CACHED_POSTS_LIST);
      });

      it('should add a new postsList to the store', () => {
        const { store } = getStore();
        store.dispatch(postsListActions.fetching(
          POSTS_LIST_ID,
          { sort: 'hot' },
        ));

        const { postsLists } = store.getState();
        expect(postsLists[POSTS_LIST_ID]).to.eql({
          id: POSTS_LIST_ID,
          adId: '',
          params: { sort: 'hot' },
          loading: true,
          results: [],
          responseCode: null,
        });
      });
    });

    describe('RECEIVED_POSTS_LIST', () => {
      it('should update the loading state and results of a postsList', () => {
        const POSTS_LIST_ID = '1';
        const RESULTS = [
          new models.Record('post', 't3_123'),
          new models.Record('post', 't3_xyx'),
        ];

        const { store } = getStore({
          postsLists: {
            [POSTS_LIST_ID]: {
              id: POSTS_LIST_ID,
              params: { sort: 'hot' },
              loading: true,
              results: [],
              responseCode: null,
            },
          },
        });

        store.dispatch(postsListActions.received(
          POSTS_LIST_ID,
          { results: RESULTS, response: { status: 200 } }
        ));

        const { postsLists } = store.getState();
        expect(postsLists).to.eql(merge(postsLists, {
          [POSTS_LIST_ID]: {
            loading: false,
            results: RESULTS,
          },
        }));
      });
    });

    describe('FAILED', () => {
      it('should update the loading state and set responseCode', () => {
        const POSTS_LIST_ID = '1';
        const ERROR_STUB = { status: 404 };

        const { store } = getStore({
          postsLists: {
            [POSTS_LIST_ID]: {
              id: POSTS_LIST_ID,
              params: { sort: 'hot' },
              loading: true,
              results: [],
              responseCode: null,
            },
          },
        });

        store.dispatch(postsListActions.failed(POSTS_LIST_ID, ERROR_STUB));

        const { postsLists } = store.getState();
        expect(postsLists).to.eql(merge(postsLists, {
          [POSTS_LIST_ID]: {
            loading: false,
            responseCode: 404,
          },
        }));
      });
    });

  });
});
