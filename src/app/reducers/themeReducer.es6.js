import * as themeActions from '../actions/themeActions';
import { themes } from '../constants';

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
