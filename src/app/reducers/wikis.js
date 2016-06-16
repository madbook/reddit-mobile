import mergeAPIModels from './helpers/mergeAPIModels';
import * as loginActions from 'app/actions/login';
import * as wikiActions from 'app/actions/wiki';

const DEFAULT = {};

export default function(state=DEFAULT, action={}) {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case wikiActions.RECEIVED_WIKI: {
      const { wikis } = action.apiResponse;
      return mergeAPIModels(state, wikis);
    }

    default: return state;
  }
}
