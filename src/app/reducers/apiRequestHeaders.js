// We need to pass along some headers on all api requests made on the server
// We store them here in a dictionary of header name to value so that
// `apiOptionsFromState` can add them to the api request options

import * as apiRequestHeadersActions from 'app/actions/apiRequestHeaders';

export const DEFAULT = {};

export default function(state=DEFAULT, action={}) {
  switch (action.type) {
    case apiRequestHeadersActions.SET: {
      const { headers } = action;
      return headers;
    }

    default: return state;
  }
}
