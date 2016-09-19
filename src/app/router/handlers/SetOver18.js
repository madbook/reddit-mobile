import { BaseHandler, METHODS } from '@r/platform/router';
import * as preferenceActions from 'app/actions/preferences';

export default class SetOver18Handler extends BaseHandler {
  async [METHODS.POST](dispatch) {
    dispatch(preferenceActions.setOver18());
  }
}
