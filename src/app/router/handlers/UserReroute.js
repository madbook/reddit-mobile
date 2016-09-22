import { setPage } from '@r/platform/actions';
import { BaseHandler, METHODS } from '@r/platform/router';

export default class UserReroute extends BaseHandler {
  async [METHODS.GET](dispatch, getState) {
    const { platform: { currentPage }} = getState();
    const { urlParams, queryParams, hashParams, referrer } = currentPage;
    let { url } = currentPage;

    url = url.replace('/u/', '/user/');
    dispatch(setPage(url, { urlParams, queryParams, hashParams, referrer }));
  }
}
