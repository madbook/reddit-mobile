import { setPage, navigateToUrl } from '@r/platform/actions';
import { BaseHandler, METHODS } from '@r/platform/router';

export default class UserReroute extends BaseHandler {
  async [METHODS.GET](dispatch, getState) {
    const { platform: { currentPage }} = getState();
    const { urlParams, queryParams, hashParams, referrer } = currentPage;
    let { url } = currentPage;

    url = url.replace('/u/', '/user/');
    if (process.env.ENV === 'client') {
      // redirect the url and make sure platform runs the handler
      dispatch(navigateToUrl(METHODS.GET, url, { urlParams, queryParams, hashParams }));
    } else {
      // redirect but don't run the handler
      dispatch(setPage(url, { urlParams, queryParams, hashParams, referrer }));
    }
  }
}
