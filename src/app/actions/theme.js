import { themes } from 'app/constants';
const { NIGHTMODE, DAYMODE } = themes;

export const SET_THEME = 'SET_THEME';

export const setTheme = (theme) => ({ type: SET_THEME, theme });

const toggledTheme = (theme) => theme === DAYMODE ? NIGHTMODE : DAYMODE;

export const toggleTheme = () => async (dispatch, getState) => {
  const { theme } = getState();
  dispatch(setTheme(toggledTheme(theme)));
};
