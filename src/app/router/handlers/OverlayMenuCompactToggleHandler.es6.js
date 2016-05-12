import { BaseHandler, METHODS } from '@r/platform/router';

import { toggleCompact } from '../../actions/compactActions';
import { closeOverlayMenu } from '../../actions/overlayMenuUrlsAndActions';

export default class OverlayMenuCompactToggleHandler extends BaseHandler {
  async [METHODS.POST](dispatch) {
    dispatch(toggleCompact());
    dispatch(closeOverlayMenu());
  }
}
