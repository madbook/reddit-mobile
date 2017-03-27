import { BaseHandler, METHODS } from 'platform/router';

export default class PlacePage extends BaseHandler {
  async [METHODS.GET](dispatch, getState) {
    let state = getState();
    if (state.platform.shell) { return; }
  }
}
