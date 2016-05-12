import * as themeActions from 'app/actions/theme';
import { themes } from 'app/constants';

export const DEFAULT = themes.DAYMODE;

export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case themeActions.SET_THEME: {
      if (action.theme !== state) {
        return action.theme;
      }

      return state;
    }

    default: return state;
  }
};
