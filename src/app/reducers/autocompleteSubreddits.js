import merge from '@r/platform/merge';
import * as subredditAutocompleteActions from 'app/actions/subredditAutocomplete';

const DEFAULT = {
  fetching: false,
  received: false,
  subredditNames: [],
};

export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case subredditAutocompleteActions.FETCHING:
      return merge(state, { fetching: true });

    case subredditAutocompleteActions.RECEIVED:
      return merge(state, {
        fetching: false,
        received: true,
        subredditNames: action.results,
      });

    case subredditAutocompleteActions.RESET:
      return DEFAULT;

    default:
      return state;
  }
};
