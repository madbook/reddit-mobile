import * as themeActions from '../../app/actions/themeActions';

export const themeClass = (theme) => {
  return theme === themeActions.DAYMODE ? 'dayMode' : 'nightMode';
};
