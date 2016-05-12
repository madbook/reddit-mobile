import { BaseHandler, METHODS } from '@r/platform/router';

import { toggleCompact } from 'app/actions/compact';
import { closeOverlayMenu } from 'app/actions/overlayMenu';

export default class OverlayMenuCompactToggle extends BaseHandler {
  async [METHODS.POST](dispatch) {
    dispatch(toggleCompact());
    dispatch(closeOverlayMenu());
  }
}
