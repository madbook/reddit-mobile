import merge from '@r/platform/merge';
import * as platformActions from '@r/platform/actions';

import * as loginActions from 'app/actions/login';
import * as postingActions from 'app/actions/posting';

const DEFAULT = {
  title: '',
  meta: '',
  gRecaptchaResponse: '',
  showCaptcha: false,
  currentType: '',
};

const VALID_TYPES = new Set(['self', 'link']);

export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case postingActions.CAPTCHA_NEEDED: {
      return merge(state, { showCaptcha: true });
    }

    case postingActions.FIELD_UPDATE: {
      const { field, value } = action;
      return merge(state, { [field]: value });
    }

    case postingActions.CLOSE_CAPTCHA: {
      return merge(state, { showCaptcha: false });
    }

    case postingActions.SUCCESS: {
      return DEFAULT;
    }

    case platformActions.SET_PAGE: {
      let { type } = action.payload.queryParams;
      if (!VALID_TYPES.has(type)) {
        type = 'self';
      }

      if (type !== state.currentType) {
        return merge(DEFAULT, { currentType: type });
      }

      return state;
    }

    default:
      return state;
  }
};
