import merge from '@r/platform/merge';

import * as activitiesActions from 'app/actions/activities';
import { newActivitesRequest } from 'app/models/ActivitiesRequest';
import * as loginActions from 'app/actions/login';

const DEFAULT = {};

export default function (state=DEFAULT, action={}) {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case activitiesActions.FETCHING_ACTIVITIES: {
      const { id, params } = action;
      const request = state[id];
      if (request) { return state; }

      return merge(state, {
        [id]: newActivitesRequest(id, params),
      });
    }

    case activitiesActions.RECEIVED_ACTIVITIES: {
      const { id, results } = action;
      const request = state[id];
      if (!request) { return state; }

      return merge(state, {
        [id]: { results, loading: false },
      });
    }

    default: return state;
  }
}
