import createTest from '@r/platform/createTest';
import { METHODS } from '@r/platform/router';
import * as platformActions from '@r/platform/actions';

import routes from 'app/router';

import { EU_COOKIE_HIDE_AFTER_VIEWS } from 'app/constants';
import * as euCookieActions from 'app/actions/euCookieNotice';

import euCookieNotice, { DEFAULT } from './euCookieNotice';

createTest({ reducers: { euCookieNotice }, routes }, ({ getStore, expect }) => {
  describe('euCookieNotice', () => {
    describe('SET_PAGE', () => {
      it('should set showEUCookie to false on page navigation if its been viewed enough', () => {
        const { store } = getStore({ euCookieNotice: {
          showEUCookie: true,
          numberOfTimesShown: EU_COOKIE_HIDE_AFTER_VIEWS,
        }});

        store.dispatch(platformActions.navigateToUrl(METHODS.GET, '/'));
        const { euCookieNotice } = store.getState();
        expect(euCookieNotice).to.eql({
          showEUCookie: false,
          numberOfTimesShown: EU_COOKIE_HIDE_AFTER_VIEWS,
        });
      });

      it('shouldnt alter showEUCookie if we havent viewed it enough', () => {
        const NUM_VIEWS = EU_COOKIE_HIDE_AFTER_VIEWS - 1;

        const { store } = getStore({ euCookieNotice: {
          showEUCookie: true,
          numberOfTimesShown: NUM_VIEWS,
        }});

        store.dispatch(platformActions.navigateToUrl(METHODS.GET, '/'));
        const { euCookieNotice } = store.getState();
        expect(euCookieNotice).to.eql({
          showEUCookie: true,
          numberOfTimesShown: NUM_VIEWS,
        });
      });
    });

    describe('SET', () => {
      it('should use the data passed via euCookieActions.SET', () => {
        const { store } = getStore();

        const SHOW = true;
        const NUM_VIEWS = 7;

        // note: just testing the raw action separately from the action
        // creator as there's some logic in the action creator
        store.dispatch({
          type: euCookieActions.SET,
          showEUCookie: SHOW,
          numberOfTimesShown: NUM_VIEWS,
        });

        const { euCookieNotice } = store.getState();
        expect(euCookieNotice).to.eql({
          showEUCookie: SHOW,
          numberOfTimesShown: NUM_VIEWS,
        });
      });

      it('the `set` action creator should set showEUCookie to true when it\s supposed to', () => {
        const { store } = getStore();

        const NUM_VIEWS = EU_COOKIE_HIDE_AFTER_VIEWS - 1;

        store.dispatch(euCookieActions.set(true, NUM_VIEWS));
        const { euCookieNotice } = store.getState();
        expect(euCookieNotice).to.eql({
          showEUCookie: true,
          numberOfTimesShown: NUM_VIEWS,
        });
      });

      it('the `set` action creator should set showEUCookie to false otherwise', () => {
        const { store } = getStore();

        store.dispatch(euCookieActions.set(false, 0));
        const { euCookieNotice: notEUCountryTest } = store.getState();
        expect(notEUCountryTest).to.eql({
          showEUCookie: false,
          numberOfTimesShown: 0,
        });

        store.dispatch(euCookieActions.set(true, EU_COOKIE_HIDE_AFTER_VIEWS));
        const { euCookieNotice: alreadyShownTest } = store.getState();
        expect(alreadyShownTest).to.eql({
          showEUCookie: false,
          numberOfTimesShown: EU_COOKIE_HIDE_AFTER_VIEWS,
        });
      });
    });

    describe('DISPLAYED', () => {
      it('should increment the dipslay count on a DISPLAYED action', () => {
        const { store } = getStore();

        store.dispatch(euCookieActions.displayed());
        const { euCookieNotice } = store.getState();
        expect(euCookieNotice).to.eql({
          ...DEFAULT,
          numberOfTimesShown: DEFAULT.numberOfTimesShown + 1,
        });
      });
    });

    describe('HIDE', () => {
      it('should set the number of times shown to EU_COOKIE_HIDE_AFTER_VIEWS', () => {
        const { store } = getStore();

        store.dispatch(euCookieActions.hide());
        const { euCookieNotice } = store.getState();
        expect(euCookieNotice).to.eql({
          showEUCookie: false,
          numberOfTimesShown: EU_COOKIE_HIDE_AFTER_VIEWS,
        });
      });
    });
  });
});
