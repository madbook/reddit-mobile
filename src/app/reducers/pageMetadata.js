import { SET_TITLE } from 'app/actions/pageMetadata';
import * as platformActions from '@r/platform/actions';

export const DEFAULT = {
  title: 'reddit: the front page of the internet',
};

export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    // Reset to the default on route, so we don't have sticky titles
    case platformActions.GOTO_PAGE_INDEX:
    case platformActions.NAVIGATE_TO_URL: {
      return DEFAULT;
    }

    case SET_TITLE: {
      if (!action.title) {
        return DEFAULT;
      }

      return {
        ...state,
        title: action.title,
      };
    }

    default: return state;
  }
};
