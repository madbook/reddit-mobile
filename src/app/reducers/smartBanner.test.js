import createTest from '@r/platform/createTest';

import smartBanner, { DEFAULT } from './smartBanner';

import * as smartBannerActions from 'app/actions/smartBanner';


createTest({ reducers: { smartBanner } }, ({ getStore, expect }) => {
  describe('smartBanner', () => {
    describe('SHOW', () => {
      it('should show the smart banner', () => {
        const { store } = getStore({ smartBanner: DEFAULT });
        const expected = {
          showBanner: true,
        };

        store.dispatch(smartBannerActions.show());
        const { smartBanner } = store.getState();
        expect(smartBanner).to.eql(expected);
      });
    });

    describe('HIDE', () => {
      it('should hide the smart banner', () => {
        const { store } = getStore({ smartBanner: DEFAULT });

        // Show and then hide to make sure we're setting and then clearing
        // The SHOW test verifies that setting works.
        store.dispatch(smartBannerActions.show('foo', 'bar'));
        store.dispatch(smartBannerActions.hide());
        const { smartBanner } = store.getState();
        expect(smartBanner).to.eql(DEFAULT);
      });
    });
  });
});
