import { BaseHandler, METHODS } from 'platform/router';
import { setStatus } from 'platform/actions';
import { trackPageEvents } from 'lib/eventUtils';

export default class Status404Page extends BaseHandler {
  async [METHODS.GET](dispatch, getState) {
    dispatch(setStatus(404));
    trackPageEvents(getState());
  }
}
