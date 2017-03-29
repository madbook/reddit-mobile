import { BaseHandler, METHODS } from 'platform/router';
import { cleanObject } from 'lib/cleanObject';
import { SORTS } from 'app/sortValues';
import { COMMENTS_ACTIVITY, POSTS_ACTIVITY } from 'app/actions/activities';
import * as accountActions from 'app/actions/accounts';
import * as activitiesActions from 'app/actions/activities';
import { fetchUserBasedData } from './handlerCommon';
import { listingTime } from 'lib/listingTime';
import { trackPageEvents, buildProfileData } from 'lib/eventUtils';

export default class UserActivityHandler extends BaseHandler {
  static activityUrl(userName, activity) {
    if (activity === COMMENTS_ACTIVITY) {
      return `/user/${userName}/comments`;
    } else if (activity === POSTS_ACTIVITY) {
      return `/user/${userName}`;
    }

    return `/user/${userName}/about`;
  }

  static getPageActivity(urlParams) {
    return urlParams.commentsOrSubmitted || POSTS_ACTIVITY;
  }

  static pageParamsToActivitiesParams({ urlParams, queryParams }) {
    const { userName } = urlParams;
    const { sort=SORTS.CONFIDENCE, before, after } = queryParams;
    const t = listingTime(queryParams, sort);
    const activity = UserActivityHandler.getPageActivity(urlParams);

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

    const activitiesParams = UserActivityHandler.pageParamsToActivitiesParams(this);

    await Promise.all([
      dispatch(activitiesActions.fetch(activitiesParams)),
      dispatch(accountActions.fetch({ name: activitiesParams.user })),
      fetchUserBasedData(dispatch),
    ]);

    const latestState = getState();
    const screen_name = activitiesParams.activity === POSTS_ACTIVITY
      ? 'profile_posts'
      : 'profile_comments';

    trackPageEvents(latestState, buildProfileData(latestState, {
      screen_name,
      target_sort: activitiesParams.sort,
      target_filter_time: activitiesParams.t,
    }));
  }
}
