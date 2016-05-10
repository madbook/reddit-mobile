import * as themeActions from '../../app/actions/themeActions';

export const themeClass = (theme) => {
  theme === themeActions.DAYMODE ? 'dayMode' : 'nightMode';
}
