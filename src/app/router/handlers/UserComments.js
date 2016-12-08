import { BaseHandler, METHODS } from '@r/platform/router';

import { cleanObject } from 'lib/cleanObject';
import { SORTS } from 'app/sortValues';
import { COMMENTS_ACTIVITY } from 'app/actions/activities';
import * as activitiesActions from 'app/actions/activities';
import { fetchUserBasedData } from './handlerCommon';
import { listingTime } from 'lib/listingTime';

export default class UserCommentsHandler extends BaseHandler {
  static pageParamsToActivitiesParams({ urlParams, queryParams }) {
    const { userName } = urlParams;
    const { sort=SORTS.CONFIDENCE, activity=COMMENTS_ACTIVITY, before, after } = queryParams;
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

    this.queryParams.activity = COMMENTS_ACTIVITY;
    const activitiesParams = UserCommentsHandler.pageParamsToActivitiesParams(this);
    dispatch(activitiesActions.fetch(activitiesParams));
    fetchUserBasedData(dispatch);
  }
}
