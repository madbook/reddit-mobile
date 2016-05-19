import * as sessionRefreshingActions from 'app/actions/sessionRefreshing';

export const DEFAULT = false;

export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case sessionRefreshingActions.SESSION_REFRESHING: {
      return true;
    }

    case sessionRefreshingActions.SESSION_REFRESHED: {
      return false;
    }

    default: return state;
  }
};
