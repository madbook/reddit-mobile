import { BaseHandler, METHODS } from '@r/platform/router';

import { toggleTheme } from '../../actions/theme';
import { closeOverlayMenu } from '../../actions/overlayMenu';

export default class OverlayMenuThemeToggleHandler extends BaseHandler {
  async [METHODS.POST](dispatch) {
    dispatch(toggleTheme());
    dispatch(closeOverlayMenu());
  }
}
