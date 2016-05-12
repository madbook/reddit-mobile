import { BaseHandler, METHODS } from '@r/platform/router';

import { toggleTheme } from '../../actions/themeActions';
import { closeOverlayMenu } from '../../actions/overlayMenuUrlsAndActions';

export default class OverlayMenuThemeToggleHandler extends BaseHandler {
  async [METHODS.POST](dispatch) {
    dispatch(toggleTheme());
    dispatch(closeOverlayMenu());
  }
}
