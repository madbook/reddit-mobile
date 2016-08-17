import createTest from '@r/platform/createTest';

import moreCommentsRequests from './moreCommentsRequests';
import * as commentActions from 'app/actions/comment';

createTest({ reducers: { moreCommentsRequests } }, ({ getStore, expect }) => {
  describe('moreCommentsRequests', () => {
    const PARENT_COMMENT_ID = '1';

    describe('MORE_COMMENTS_FETCHING', () => {
      it('should set loading state to true', () => {
        const { store } = getStore({ moreCommentsRequests: {} });

        store.dispatch(commentActions.fetching(PARENT_COMMENT_ID));
        const { moreCommentsRequests } = store.getState();
        expect(moreCommentsRequests).to.eql({ [PARENT_COMMENT_ID]: { loading: true } });
      });
    });

    describe('MORE_COMMENTS_RECEIVED', () => {
      const API_RESP = {};  // not used by this reducer so can use an empty object

      it('should set loading state to false', () => {
        const { store } = getStore({ moreCommentsRequests: {
          [PARENT_COMMENT_ID]: { loading: false },
        }});

        store.dispatch(commentActions.received(PARENT_COMMENT_ID, API_RESP));
        const { moreCommentsRequests } = store.getState();
        expect(moreCommentsRequests).to.eql({ [PARENT_COMMENT_ID]: { loading: false } });
      });
    });

    describe('MORE_COMMENTS_FAILURE', () => {
      const RESP_ERROR = {}; // not used by this reducer so can use an empty object

      it('should set loading state to false', () => {
        const { store } = getStore({ moreCommentsRequests: {
          [PARENT_COMMENT_ID]: { loading: true },
        }});

        store.dispatch(commentActions.failure(PARENT_COMMENT_ID, RESP_ERROR));
        const { moreCommentsRequests } = store.getState();
        expect(moreCommentsRequests).to.eql({ [PARENT_COMMENT_ID]: { loading: false } });
      });
    });
  });
});
