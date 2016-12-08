import { setPage, navigateToUrl } from '@r/platform/actions';
import { BaseHandler, METHODS } from '@r/platform/router';

import UserActivityHandler from 'app/router/handlers/UserActivity';

export default class UserActivityRerouteHandler extends BaseHandler {
  async [METHODS.GET](dispatch, getState) {
    const { platform: { currentPage }} = getState();
    const { urlParams, queryParams, hashParams, referrer } = currentPage;
    const { userName } = urlParams;
    const url = UserActivityHandler.activityUrl(userName, queryParams.activity);

    if (process.env.ENV === 'client') {
      // redirect the url and make sure platform runs the handler
      dispatch(navigateToUrl(METHODS.GET, url, { urlParams, queryParams, hashParams }));
    } else {
      // redirect but don't run the handler
      dispatch(setPage(url, { urlParams, queryParams, hashParams, referrer }));
    }
  }
}
