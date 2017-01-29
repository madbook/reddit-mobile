import { BaseHandler, METHODS } from 'platform/router';
import { toggleCompact } from 'app/actions/compact';

export default class OverlayMenuCompactToggle extends BaseHandler {
  async [METHODS.POST](dispatch) {
    dispatch(toggleCompact());
  }
}
