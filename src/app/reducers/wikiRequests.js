import merge from '@r/platform/merge';
import * as wikiActions from 'app/actions/wiki';
import { newWikiRequest } from 'app/models/WikiRequest';
import * as loginActions from 'app/actions/login';
import { makeWikiPath } from 'lib/makeWikiPath';

const DEFAULT = {};

export default function (state=DEFAULT, action={}) {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case wikiActions.FETCHING_WIKI: {
      const { subredditName, path } = action;
      const wikiPath = makeWikiPath(subredditName, path);
      const request = state[wikiPath];
      if (request) { return state; }

      return merge(state, {
        [wikiPath]: newWikiRequest(wikiPath),
      });
    }

    case wikiActions.RECEIVED_WIKI: {
      const { subredditName, path, result } = action;
      const wikiPath = makeWikiPath(subredditName, path);
      const request = state[wikiPath];
      if (!request) {
        return merge(state, {
          [wikiPath]: {
            ...newWikiRequest(wikiPath),
            loading: false,
          },
        });
      }

      return merge(state, {
        [wikiPath]: { result },
      });
    }

    default: return state;
  }
}
