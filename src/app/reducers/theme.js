import * as themeActions from 'app/actions/theme';
import * as loginActions from 'app/actions/login';

import { themes } from 'app/constants';

export const DEFAULT = themes.DAYMODE;

export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case themeActions.SET_THEME: {
      if (action.theme !== state) {
        return action.theme;
      }

      return state;
    }

    default: return state;
  }
};
