/*
  This reducer is responsible for managing the state of the EU Cookie notice.
  It assumes some other part of the app will dispatch a call to
  `euCookieActions.set(isEUCountry, numberOfTimesShown)`. It makes no assumptions
  about _when_ the EUCookieNotice is rendered, so it
  relies on `euCookieActions.displayed()` to increment the number of time
  of times shown. On page navigation, if we've shown the notice at least
  EU_COOKIE_HIDE_AFTER_VIEWS times, it sets `showEUCookie` to false.
  This is on navigation so that we don't show the notice, update number of times
  shown, and then hide it, which would cause a pop-out or blink of the cookie notice.
*/
import * as platformActions from 'platform/actions';
import { EU_COOKIE_HIDE_AFTER_VIEWS } from 'app/constants';
import * as euCookieActions from 'app/actions/euCookieNotice';

export const DEFAULT = {
  showEUCookie: false,
  numberOfTimesShown: 0,
};

export default function (state=DEFAULT, action={}) {
  switch (action.type) {
    case platformActions.SET_PAGE: {
      const { showEUCookie, numberOfTimesShown } = state;
      if (showEUCookie && numberOfTimesShown >= EU_COOKIE_HIDE_AFTER_VIEWS) {
        return {
          showEUCookie: false,
          numberOfTimesShown,
        };
      }

      return state;
    }

    case euCookieActions.SET: {
      const { showEUCookie, numberOfTimesShown } = action;
      return { showEUCookie, numberOfTimesShown };
    }

    case euCookieActions.DISPLAYED: {
      const { numberOfTimesShown } = state;
      return {
        ...state,
        numberOfTimesShown: numberOfTimesShown + 1,
      };
    }

    case euCookieActions.HIDE: {
      // Set the number of times shown to EU_COOKIE_HIDE_AFTER_VIEWS
      // so we don't show it again on a subsequent visit. We could use a separate
      // cookie for that but 1X doesn't, so we should be compatible.
      return {
        showEUCookie: false,
        numberOfTimesShown: EU_COOKIE_HIDE_AFTER_VIEWS,
      };
    }

    default: return state;
  }
}
