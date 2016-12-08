import { setPage, navigateToUrl } from '@r/platform/actions';
import { BaseHandler, METHODS } from '@r/platform/router';

import { COMMENTS_ACTIVITY, POSTS_ACTIVITY } from 'app/actions/activities';

export default class UserActivityRerouteHandler extends BaseHandler {
  async [METHODS.GET](dispatch, getState) {
    const { platform: { currentPage }} = getState();
    const { urlParams, queryParams, hashParams, referrer } = currentPage;
    const { userName } = urlParams;
    let url = '';

    if (queryParams.activity === COMMENTS_ACTIVITY) {
      url = `/user/${userName}/comments`;
    } else if (queryParams.activity === POSTS_ACTIVITY) {
      url = `/user/${userName}/submitted`;
    } else {
      url = `/user/${userName}`;
    }

    if (process.env.ENV === 'client') {
      // redirect the url and make sure platform runs the handler
      dispatch(navigateToUrl(METHODS.GET, url, { urlParams, queryParams, hashParams }));
    } else {
      // redirect but don't run the handler
      dispatch(setPage(url, { urlParams, queryParams, hashParams, referrer }));
    }
  }
}
