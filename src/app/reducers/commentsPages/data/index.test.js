import createTest from '@r/platform/createTest';

import postCommentsData from './index';
import * as commentsPageActions from 'app/actions/commentsPage';
import * as commentActions from 'app/actions/comment';
import * as replyActions from 'app/actions/reply';

import Record from 'apiClient/apiBase/Record';

createTest({ reducers: { postCommentsData } }, ({ getStore, expect }) => {
  describe('REDUCER - commentsPages.data', () => {
    it('should merge a new post-comment list in when available', () => {
      const { store } = getStore();
      const pageId = 'foo';
      const TEST_DATA = { results: [1,2,3] };

      store.dispatch(commentsPageActions.received(pageId, TEST_DATA));
      expect(store.getState().postCommentsData[pageId]).to.eql(TEST_DATA.results);
    });

    it('should add comments to an existing comments list', () => {
      const loadMoreId = 'bar';
      const pageId = 'pageId';
      const { store } = getStore({
        postCommentsData: {
          [pageId]: [{ uuid: loadMoreId, depth: 0}],
        },
      });

      const TEST_DATA = {
        results: [{ uuid: 'hup', depth: 0, type: 'foo'}],
      };

      store.dispatch(commentActions.success(TEST_DATA, pageId, loadMoreId));

      expect(store.getState().postCommentsData[pageId]).to.eql(TEST_DATA.results);
    });
  });

  describe('REPLIED', () => {

    const COMMENTS_PAGE_ID = '1';
    const POST_ID = 't3_12345';

    const COMMENT_RECORD = new Record('comment', 't1_comment1');

    const COMMENT = {
      parentId: POST_ID,
      linkId: POST_ID,
      toRecord: () => COMMENT_RECORD,
      set: () => COMMENT,
    };

    it('should add a new comment to start of list if its parent is the link_id', () => {
      const { store } = getStore({
        postCommentsData: {
          [COMMENTS_PAGE_ID]: [{uuid: 'foo', type: 'bar'}],
          current: COMMENTS_PAGE_ID,
        },
      });
      store.dispatch(replyActions.success(COMMENT.parentId, COMMENT));
      const { postCommentsData } = store.getState();
      expect(postCommentsData[COMMENTS_PAGE_ID][0]).to.eql(COMMENT_RECORD);
    });

    it('should add new comment to right index when not top level', () => {
      const parentId = 'foo';
      const { store } = getStore({
        postCommentsData: {
          [COMMENTS_PAGE_ID]: [{uuid: parentId, type: 'bar', depth: 0}],
          current: COMMENTS_PAGE_ID,
        },
      });
      const comment = { ...COMMENT, parentId };
      store.dispatch(replyActions.success(comment.parentId, comment));

      const { postCommentsData } = store.getState();
      expect(postCommentsData[COMMENTS_PAGE_ID][1]).to.eql(COMMENT_RECORD);
    });
  });
});
