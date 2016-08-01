import { BaseHandler, METHODS } from '@r/platform/router';

import { cleanObject } from 'lib/cleanObject';
import { SORTS } from 'app/sortValues';
import { POSTS_ACTIVITY } from 'app/actions/activities';
import * as activitiesActions from 'app/actions/activities';
import { fetchUserBasedData } from './handlerCommon';
import { listingTime } from 'lib/listingTime';
import { urlWith } from 'lib/urlWith';

export default class UserActivityHandler extends BaseHandler {
  static activityURL(userName, activity) {
    return urlWith(`/u/${userName}/activity`, { activity });
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
    const state = getState();
    if (state.platform.shell) { return; }

    const activitiesParams = UserActivityHandler.pageParamsToActivitiesParams(this);
    dispatch(activitiesActions.fetch(activitiesParams));

    fetchUserBasedData(dispatch);
  }
}
