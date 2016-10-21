import createTest from '@r/platform/createTest';
import merge from '@r/platform/merge';
import { models } from '@r/api-client';

import commentsPages from './commentsPages';
import * as commentsPageActions from 'app/actions/commentsPage';
import * as loginActions from 'app/actions/login';
import * as replyActions from 'app/actions/reply';


createTest({ reducers: { commentsPages } }, ({ getStore, expect }) => {
  describe('commentsPages', () => {
    describe('LOGGED_IN and LOGGED_OUT', () => {
      it('should return default on log in', () => {
        const { store } = getStore({
          commentsPages: { 'page': {} },
        });
        store.dispatch(loginActions.loggedIn());

        const { commentsPages } = store.getState();
        expect(commentsPages).to.eql({});
      });

      it('should return default on log out', () => {
        const { store } = getStore({
          commentsPages: { 'page': {} },
        });
        store.dispatch(loginActions.loggedOut());

        const { commentsPages } = store.getState();
        expect(commentsPages).to.eql({});
      });
    });

    describe('FETCHING_COMMENTS_PAGE', () => {
      const COMMENTS_PAGE_ID = COMMENTS_PAGE_ID;
      const POST_ID = 't3_12345';

      it('should try the cache for a pre-existing commentsPage first', () => {
        const CACHED_COMMENTS_PAGE = {
          id: COMMENTS_PAGE_ID,
          params: { id: POST_ID },
          postId: POST_ID,
          loading: true,
          loadingMoreChildren: {},
          results: [],
        };

        const { store } = getStore({
          commentsPages: { [COMMENTS_PAGE_ID]: CACHED_COMMENTS_PAGE },
        });

        store.dispatch(commentsPageActions.fetching(
          COMMENTS_PAGE_ID,
          { id: POST_ID },
        ));

        const { commentsPages } = store.getState();
        expect(commentsPages[COMMENTS_PAGE_ID]).to.equal(CACHED_COMMENTS_PAGE);
      });

      it('should add a new commentsPage to the store', () => {
        const { store } = getStore();
        store.dispatch(commentsPageActions.fetching(
          COMMENTS_PAGE_ID,
          { id: POST_ID },
        ));

        const { commentsPages } = store.getState();
        expect(commentsPages.current).to.equal(COMMENTS_PAGE_ID);
        expect(commentsPages[COMMENTS_PAGE_ID]).to.eql({
          id: COMMENTS_PAGE_ID,
          params: { id: POST_ID },
          postId: POST_ID,
          loading: true,
          loadingMoreChildren: {},
          results: [],
          responseCode: null,
        });
      });
    });

    describe('RECEIVED_COMMENTS_PAGE', () => {
      const COMMENTS_PAGE_ID = '1';
      const POST_ID = 't3_12345';

      it('should update the loading state and results of a commentsPage', () => {
        const LOADING_COMMENTS_PAGE = {
          id: COMMENTS_PAGE_ID,
          params: { id: POST_ID },
          postId: POST_ID,
          loading: true,
          loadingMoreChildren: {},
          results: [],
          responseCode: null,
        };

        const RESULTS = [
          new models.Record('comment', 't1_comment'),
          new models.Record('comment', 't1_comment'),
        ];

        const { store } = getStore({
          commentsPages: {
            [COMMENTS_PAGE_ID]: LOADING_COMMENTS_PAGE,
            current: COMMENTS_PAGE_ID,
          },
        });

        store.dispatch(commentsPageActions.received(
          COMMENTS_PAGE_ID,
          { results: RESULTS, response: { status: 200 } },
        ));

        const { commentsPages } = store.getState();
        expect(commentsPages).to.eql(merge(commentsPages, {
          [COMMENTS_PAGE_ID]: {
            loading: false,
            results: RESULTS,
            responseCode: 200,
          },
        }));
      });
    });

    describe('FAILED', () => {
      it('should update the loading state and set responseCode', () => {
        const COMMENTS_PAGE_ID = '1';
        const POST_ID = 't3_12345';
        const ERROR_STUB = { status: 404 };

        const { store } = getStore({
          commentsPages: {
            [COMMENTS_PAGE_ID]: {
              id: COMMENTS_PAGE_ID,
              params: { id: POST_ID },
              postId: POST_ID,
              loading: true,
              loadingMoreChildren: {},
              results: [],
              responseCode: null,
            },
          },
        });

        store.dispatch(commentsPageActions.failed(COMMENTS_PAGE_ID, ERROR_STUB));

        const { commentsPages } = store.getState();
        expect(commentsPages).to.eql(merge(commentsPages, {
          [COMMENTS_PAGE_ID]: {
            loading: false,
            responseCode: 404,
          },
        }));
      });
    });


    describe('REPLIED', () => {

      let store;
      const COMMENTS_PAGE_ID = '1';
      const POST_ID = 't3_12345';

      const COMMENTS_PAGE = {
        id: COMMENTS_PAGE_ID,
        params: { id: POST_ID },
        postId: POST_ID,
        loading: false,
        loadingMoreChildren: {},
        results: [],
      };

      const COMMENT_RECORD = new models.Record('comment', 't1_comment1');

      const COMMENT = {
        parentId: POST_ID,
        toRecord: () => COMMENT_RECORD,
      };

      beforeEach(() => {
        store = getStore({
          commentsPages: {
            [COMMENTS_PAGE_ID]: COMMENTS_PAGE,
            current: COMMENTS_PAGE_ID,
          },
        }).store;
      });

      it('should add a new comment if its parent is the link_id', () => {
        store.dispatch(replyActions.success(COMMENT.parentId, COMMENT));

        const { commentsPages } = store.getState();
        expect(commentsPages[COMMENTS_PAGE_ID].results).to.eql([ COMMENT_RECORD ]);
      });

      it('should not add a new comment if its parent is not the link_id', () => {
        const comment = merge(COMMENT, { parentId: 't3_notTheMama!' });
        store.dispatch(replyActions.success(comment.parentId, comment));

        const { commentsPages } = store.getState();
        expect(commentsPages[COMMENTS_PAGE_ID].results).to.eql([]);
      });
    });
  });
});
