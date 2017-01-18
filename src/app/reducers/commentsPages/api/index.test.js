import createTest from '@r/platform/createTest';

import api from './index';
import * as commentsPageActions from 'app/actions/commentsPage';

createTest({ reducers: { api } }, ({ getStore, expect }) => {
  describe('REDUCER - commentsPages.api', () => {
    it('should set the state to pending when appropriate', () => {
      const TEST_COMMENT_PAGE_ID = 'foo';
      const { store } = getStore({
        commentsPages: {
          api: {},
        },
      });

      store.dispatch(commentsPageActions.fetching(TEST_COMMENT_PAGE_ID));

      expect(store.getState().api[TEST_COMMENT_PAGE_ID]).to.eql({
        pending: true,
        errors: {},
      });
    });

    it('should add errors appropriately', () => {
      const TEST_COMMENT_PAGE_ID = 'foo';
      const RES_STATUS = 403;
      const ERRORS = { megaError: 'megaError', status: RES_STATUS };
      const { store } = getStore({
        commentsPages: {
          api: {},
        },
      });

      store.dispatch(commentsPageActions.failed(
        TEST_COMMENT_PAGE_ID,
        ERRORS
      ));

      expect(store.getState().api[TEST_COMMENT_PAGE_ID]).to.eql({
        pending: false,
        errors: ERRORS,
        responseCode: RES_STATUS,
      });
    });

    it('should clear errors and pending states on successful data fetches', () => {
      const TEST_COMMENT_PAGE_ID = 'foo';
      const RES_STATUS = 200;
      const ERRORS = { megaError: 'megaError', status: RES_STATUS };
      // seed the store with a failed response
      const { store } = getStore({
        api: {
          [TEST_COMMENT_PAGE_ID]: {
            pending: true,
            errors: ERRORS,
          },
        },
      });

      store.dispatch(commentsPageActions.received(
        TEST_COMMENT_PAGE_ID,
        { response: { status: RES_STATUS } }
      ));

      expect(store.getState().api[TEST_COMMENT_PAGE_ID]).to.eql({
        pending: false,
        errors: {},
        responseCode: RES_STATUS,
      });
    });
  });
});
