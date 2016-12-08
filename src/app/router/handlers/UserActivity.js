import { BaseHandler } from '@r/platform/router';

import { cleanObject } from 'lib/cleanObject';
import { SORTS } from 'app/sortValues';
import { POSTS_ACTIVITY } from 'app/actions/activities';
import { listingTime } from 'lib/listingTime';

export default class UserActivityHandler extends BaseHandler {
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
}
