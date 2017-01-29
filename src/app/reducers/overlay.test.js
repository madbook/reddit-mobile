import createTest from 'platform/createTest';
import { METHODS } from 'platform/router';
import * as platformActions from 'platform/actions';
import routes from 'app/router';

import * as compactActions from 'app/actions/compact';
import * as overlayActions from 'app/actions/overlay';
import * as themeActions from 'app/actions/theme';

import overlay, { DEFAULT_STATE } from './overlay';

createTest({ reducers: { overlay }, routes }, ({ getStore, expect }) => {
  describe('overlay', () => {
    describe('SET_PAGE', () => {
      it('should reset to default state when switching pages', () => {
        const { store } = getStore({ overlay: 'something' });

        store.dispatch(platformActions.navigateToUrl(METHODS.GET, '/'));
        const { overlay } = store.getState();
        expect(overlay).to.eql(DEFAULT_STATE);
      });
    });

    describe('TOGGLE_OVERLAY', () => {
      it('should set the overlay from the TOGGLE_OVERLAY action', () => {
        const { store } = getStore();
        const OVERLAY_NAME = 'foo';

        store.dispatch(overlayActions.toggle(OVERLAY_NAME));
        const { overlay } = store.getState();
        expect(overlay).to.eql(OVERLAY_NAME);
      });

      it('should close the overlay if a second TOGGLE_OVERLAY action is fired', () => {
        const OVERLAY_NAME = 'foo';
        const { store } = getStore({ overlay: OVERLAY_NAME });

        store.dispatch(overlayActions.toggle(OVERLAY_NAME));
        const { overlay } = store.getState();
        expect(overlay).to.equal(DEFAULT_STATE);
      });

      it('should switch overlay names if a different type is TOGGLE\'d', () => {
        const OVERLAY_NAME = 'foo';
        const { store } = getStore({ overlay: 'bar' });

        store.dispatch(overlayActions.toggle(OVERLAY_NAME));
        const { overlay } = store.getState();
        expect(overlay).to.equal(OVERLAY_NAME);
      });
    });

    describe('CLOSE_OVERLAY', () => {
      it('should close an open overlay', () => {
        const { store } = getStore({ overlay: 'foo' });

        store.dispatch(overlayActions.closeOverlay());
        const { overlay } = store.getState();
        expect(overlay).to.eql(DEFAULT_STATE);
      });
    });

    describe('Settings', () => {
      it('should close an overlay after a theme is selected', () => {
        const { store } = getStore({ overlay: 'foo' });

        store.dispatch(themeActions.setTheme('nightmode'));
        const { overlay } = store.getState();
        expect(overlay).to.eql(DEFAULT_STATE);
      });

      it('should close an overlay after a compact preference is selected', () => {
        const { store } = getStore({ overlay: 'foo' });

        store.dispatch(compactActions.setCompact(true));
        const { overlay } = store.getState();
        expect(overlay).to.eql(DEFAULT_STATE);
      });
    });
  });
});
