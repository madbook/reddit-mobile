import * as themeActions from '../actions/themeActions';

const DEFAULT = themeActions.DAYMODE;

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
