import createTest from '@r/platform/createTest';

import * as ModelTypes from 'apiClient/models/thingTypes';

import modal from './modal';
import posts from './posts';
import * as modalActions from 'app/actions/modal';
import * as reportingActions from 'app/actions/reporting';

createTest({ reducers: { modal, posts } }, ({ getStore, expect }) => {
  describe('modal', () => {
    it('should show when a user wants to report something', () => {
      const thingId = `${ModelTypes.POST_TYPE}_1`;
      const thingType = ModelTypes.POST;
      const subredditName = 'test';
      const { store } = getStore({
        [`${thingType}s`]: {
          [thingId]: {
            subreddit: subredditName,
          },
        },
      });
      store.dispatch(reportingActions.report(thingId));

      const { modal } = store.getState();
      expect(modal).to.eql({
        type: reportingActions.MODAL_TYPE,
        props: { 
          thingId,
          thingType,
          subredditName,
        },
      });
    });

    it('should be able to close', () => {
      const { store } = getStore();
      store.dispatch(modalActions.closeModal());

      const { modal } = store.getState();
      expect(modal).to.eql({ type: null, props: {} });
    });
  });
});
