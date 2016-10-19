import { EU_COOKIE_HIDE_AFTER_VIEWS } from 'app/constants';

export const SET = 'EU_COOKIE_NOTICE__SET';
export const set = (isEUCountry, numberOfTimesShown) => ({
  type: SET,
  showEUCookie: isEUCountry && numberOfTimesShown < EU_COOKIE_HIDE_AFTER_VIEWS,
  numberOfTimesShown,
});

export const DISPLAYED = 'EU_COOKIE_NOTICE__DISPLAYED';
export const displayed = () => ({
  type: DISPLAYED,
});

export const HIDE = 'EU_COOKIE_NOTICE__HIDE';
export const hide = () => ({
  type: HIDE,
});
