import { themes } from '../../app/constants';

export const themeClass = (theme) => {
  return theme === themes.DAYMODE ? 'dayMode' : 'nightMode';
};
