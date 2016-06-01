import createTest from '@r/platform/createTest';
import merge from '@r/platform/merge';
import { models } from '@r/api-client';

import searchRequests from './searchRequests';
import * as searchActions from 'app/actions/search';
import * as loginActions from 'app/actions/login';

createTest({ reducers: { searchRequests } }, ({ getStore, expect }) => {
  describe('searchRequests', () => {
    describe('LOGGED_IN and LOGGED_OUT', () => {
      it('should return default on log in', () => {
        const { store } = getStore();
        store.dispatch(loginActions.loggedIn());

        const { searchRequests } = store.getState();
        expect(searchRequests).to.eql({});
      });

      it('should return default on log out', () => {
        const { store } = getStore();
        store.dispatch(loginActions.loggedOut());

        const { searchRequests } = store.getState();
        expect(searchRequests).to.eql({});
      });
    });

    describe('FETCHING_SEARCH_REQUEST', () => {
      const SEARCH_REQUEST_ID = '1';
      it('should try the cache for a pre-existing searchRequest first', () => {
        const CACHED_SEARCH_REQUEST = {
          id: SEARCH_REQUEST_ID,
          params: { sort: 'hot' },
          loading: false,
          subreddits: [],
          results: [],
        };

        const { store } = getStore({
          searchRequests: { [SEARCH_REQUEST_ID]: CACHED_SEARCH_REQUEST },
        });

        store.dispatch(searchActions.fetching(SEARCH_REQUEST_ID, {
          q: 'test', sort: 'relevance', time: 'all', type: ['sr', 'link'],
        }));

        const { searchRequests } = store.getState();
        expect(searchRequests[SEARCH_REQUEST_ID]).to.equal(CACHED_SEARCH_REQUEST);
      });

      it('should add a new searchRequest to the store', () => {
        const { store } = getStore();

        store.dispatch(searchActions.fetching(SEARCH_REQUEST_ID, {
          q: 'test', sort: 'relevance', time: 'all', type: ['sr', 'link'],
        }));

        const { searchRequests } = store.getState();
        expect(searchRequests[SEARCH_REQUEST_ID]).to.eql({
          id: SEARCH_REQUEST_ID,
          params: { q: 'test', sort: 'relevance', time: 'all', type: ['sr', 'link'] },
          loading: true,
          subreddits: [],
          posts: [],
        });
      });
    });

    describe('RECEIVED_SEARCH_REQUEST', () => {
      it('should update a searchRequest\'s loading state, subreddits, and posts', () => {
        const SEARCH_REQUEST_ID = '1';
        const SUBREDDITS = [
          new models.Record('subreddit', 'tests', 't5_12345'),
        ];

        const POSTS = [ new models.Record('post', 't3_12345') ];

        const { store } = getStore({
          searchRequests: {
            [SEARCH_REQUEST_ID]: {
              id: SEARCH_REQUEST_ID,
              params: { q: 'test', sort: 'relevance', time: 'all', type: ['sr', 'link'] },
              loading: true,
              subreddits: [],
              posts: [],

            },
          },
        });

        store.dispatch(searchActions.received(SEARCH_REQUEST_ID, {
          subreddits: SUBREDDITS,
          posts: POSTS,
        }));

        const { searchRequests } = store.getState();
        expect(searchRequests).to.eql(merge(searchRequests, {
          [SEARCH_REQUEST_ID]: {
            loading: false,
            subreddits: SUBREDDITS,
            posts: POSTS,
          },
        }));
      });
    });
  });
});
