import { makeStateArchiver } from '@r/redux-state-archiver';
import { themeClass } from 'server/templates/themeClass';
import { themes, OVERLAY_MENU_VISIBLE_CSS_CLASS } from 'app/constants';
import { stopScroll } from 'lib/stopScroll';

const stopScrollForMenu = stopScroll(OVERLAY_MENU_VISIBLE_CSS_CLASS);

const themeSelector = (state) => state.theme;
const overlayOpenSelector = state => {
  const overlayOpen = !!state.overlay;
  const dropdownOpen = !!state.widgets.tooltip.id;
  return overlayOpen || dropdownOpen;
};

const combiner = (theme, overlayOpen) => ({ theme, overlayOpen });

const updateTheme = ($body, newTheme) => {
  const nextThemeClass = themeClass(newTheme);
  const oldThemeClass = themeClass(newTheme === themes.NIGHTMODE
    ? themes.DAYMODE
    : themes.NIGHTMODE
  );

  $body.classList.remove(oldThemeClass);
  $body.classList.add(nextThemeClass);
};

const updateOverlayScrollStopper = ($body, open) => {
  // Scrolling on Safari is weird, possibly iOS 9. Overflow hidden doesn't
  // prevent the page background from scrolling as you'd expect.
  // When we're on Safari we do a fancy check to stop touchmove events
  // from scrolling the background.
  // We don't use position: fixed becuase the repaint from changing position
  // is slow in safari. Plus there's extra bookkeeping for preserving the
  // scroll position.
  if (open) {
    if ($body.classList.contains(OVERLAY_MENU_VISIBLE_CSS_CLASS)) {
      return;
    }

    $body.classList.add(OVERLAY_MENU_VISIBLE_CSS_CLASS);
    $body.addEventListener('touchmove', stopScrollForMenu);
  } else {
    $body.classList.remove(OVERLAY_MENU_VISIBLE_CSS_CLASS);
    $body.removeEventListener('touchmove', stopScrollForMenu);
  }
};

let $body;
const archiver = (data) => {
  if (!$body) { $body = document.body; }

  // everthing from here down depends on the classList api
  if (!$body.classList) { return; }

  const { theme, overlayOpen } = data;
  if (theme) {
    updateTheme($body, data.theme);
  }

  if (typeof overlayOpen !== 'undefined') {
    updateOverlayScrollStopper($body, overlayOpen);
  }
};

export default makeStateArchiver(
  [ themeSelector, overlayOpenSelector ],
  combiner,
  archiver,
);
