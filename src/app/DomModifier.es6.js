import { makeStateArchiver } from '@r/redux-state-archiver';
import { themeClass } from '../server/templates/themeClass';
import * as themeActions from './actions/themeActions';

const themeSelector = (state) => state.theme;
const combiner = (theme) => ({ theme });

const updateTheme = ($body, newTheme) => {
  const nextThemeClass = themeClass(newTheme);
  const oldThemeClass = themeClass(newTheme === themeActions.NIGHTMODE
    ? themeActions.DAYMODE
    : themeActions.NIGHTMODE
  );

  $body.classList.remove(oldThemeClass);
  $body.classList.add(nextThemeClass);
};

let $body;
const archiver = (data) => {
  if (!$body) { $body = document.body; }

  const { theme } = data;
  if (theme) {
    updateTheme($body, data.theme);
  }
};

export const DomModifier = makeStateArchiver(
  themeSelector,
  combiner,
  archiver,
);
