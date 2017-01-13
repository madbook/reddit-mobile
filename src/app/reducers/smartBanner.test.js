import createTest from '@r/platform/createTest';
import { METHODS } from '@r/platform/router';
import * as platformActions from '@r/platform/actions';

import routes from 'app/router';
import smartBanner, { DEFAULT } from './smartBanner';

import * as xpromoActions from 'app/actions/xpromo';


createTest({ reducers: { smartBanner }, routes }, ({ getStore, expect }) => {
  describe('smartBanner', () => {
    describe('SHOW', () => {
      it('should show the smart banner', () => {
        const { store } = getStore({ smartBanner: DEFAULT });
        const expected = {
          ...DEFAULT,
          showBanner: true,
        };

        store.dispatch(xpromoActions.show());
        const { smartBanner } = store.getState();
        expect(smartBanner).to.eql(expected);
      });
    });

    describe('HIDE', () => {
      it('should hide the smart banner', () => {
        const { store } = getStore({ smartBanner: DEFAULT });

        // Show and then hide to make sure we're setting and then clearing
        // The SHOW test verifies that setting works.
        store.dispatch(xpromoActions.show('foo', 'bar'));
        store.dispatch(xpromoActions.hide());
        const { smartBanner } = store.getState();
        expect(smartBanner).to.eql(DEFAULT);
      });
    });

    describe('RECORD_SHOWN', () => {
      it('should mark that we have shown an xpromo', () => {
        const { store } = getStore({ smartBanner: DEFAULT });
        const url = '/foo/bar';

        // Indicate desire to show, and then record that we showed.
        store.dispatch(xpromoActions.show());
        store.dispatch(xpromoActions.recordShown(url));
        const { smartBanner } = store.getState();
        expect(smartBanner).to.eql({
          showBanner: true,
          haveShownXPromo: true,
          xPromoShownUrl: url,
        });
      });
    });

    describe('PLATFORM__NAVIGATE_TO_URL', () => {
      it('should remove desire to show xpromo if we have already shown it once', () => {
        const { store } = getStore({ smartBanner: DEFAULT });

        // Indicate desire to show, record that we showed, navigate.
        store.dispatch(xpromoActions.show());
        store.dispatch(xpromoActions.recordShown('/foo/bar'));
        store.dispatch(platformActions.navigateToUrl(METHODS.GET, '/user/foobar'));
        const { smartBanner } = store.getState();
        const { showBanner } = smartBanner;
        expect(showBanner).to.eql(false);
      });

      it('should not remove desire to show xpromo if we have not shown it yet', () => {
        const { store } = getStore({ smartBanner: DEFAULT });

        // Indicate desire to show, navigate.
        store.dispatch(xpromoActions.show());
        store.dispatch(platformActions.navigateToUrl(METHODS.GET, '/user/foobar'));
        const { smartBanner } = store.getState();
        const { showBanner } = smartBanner;
        expect(showBanner).to.eql(true);
      });
    });
  });
});
