import { BaseHandler, METHODS } from 'platform/router';
import { cleanObject } from 'lib/cleanObject';
import { SORTS } from 'app/sortValues';
import { COMMENTS_ACTIVITY, POSTS_ACTIVITY } from 'app/actions/activities';
import * as activitiesActions from 'app/actions/activities';
import { fetchUserBasedData } from './handlerCommon';
import { listingTime } from 'lib/listingTime';

export default class UserActivityHandler extends BaseHandler {
  static activityUrl(userName, activity) {
    if (activity === COMMENTS_ACTIVITY) {
      return `/user/${userName}/comments`;
    } else if (activity === POSTS_ACTIVITY) {
      return `/user/${userName}/submitted`;
    }

    return `/user/${userName}`;
  }

  static pageParamsToActivitiesParams({ urlParams, queryParams }) {
    const { userName } = urlParams;
    const { sort=SORTS.CONFIDENCE, activity=POSTS_ACTIVITY, before, after } = queryParams;
    const t = listingTime(queryParams, sort);

    return cleanObject({
      user: userName,
      sort,
      t,
      activity,
      before,
      after,
    });
  }

  async [METHODS.GET](dispatch, getState) {
    if (getState().platform.shell) {
      return;
    }

    const { platform: { currentPage }} = getState();
    const { urlParams } = currentPage;
    this.queryParams.activity = urlParams.commentsOrSubmitted;
    const activitiesParams = UserActivityHandler.pageParamsToActivitiesParams(this);

    dispatch(activitiesActions.fetch(activitiesParams));
    fetchUserBasedData(dispatch);
  }
}
