import { BaseHandler, METHODS } from '@r/platform/router';

import { toggleTheme } from 'app/actions/theme';

export default class OverlayMenuThemeToggle extends BaseHandler {
  async [METHODS.POST](dispatch) {
    dispatch(toggleTheme());
  }
}
