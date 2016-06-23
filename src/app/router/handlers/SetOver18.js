import { BaseHandler, METHODS } from '@r/platform/router';
import * as platformActions from '@r/platform/actions';

import * as preferenceActions from 'app/actions/preferences';

export default class SetOver18Handler extends BaseHandler {
  async [METHODS.POST](dispatch, getState) {
    dispatch(preferenceActions.setOver18());

    // redirect to current page
    const { currentPage } = getState().platform;
    dispatch(platformActions.navigateToUrl(METHODS.GET, currentPage.referrer));
  }
}
