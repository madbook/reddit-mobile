import { BaseHandler, METHODS } from 'platform/router';
import { toggleTheme } from 'app/actions/theme';

export default class OverlayMenuThemeToggle extends BaseHandler {
  async [METHODS.POST](dispatch) {
    dispatch(toggleTheme());
  }
}
