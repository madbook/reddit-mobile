import mergeAPIModels from './helpers/mergeAPIModels';
import * as loginActions from 'app/actions/login';
import * as mailActions from 'app/actions/mail';

const DEFAULT = {};

export default function messages(state=DEFAULT, action={}) {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case mailActions.RECEIVED: {
      const { messages } = action.apiResponse;
      return mergeAPIModels(state, messages);
    }

    case mailActions.ADD_REPLY: {
      const { messages } = action.data;
      return mergeAPIModels(state, messages);
    }

    default: return state;
  }
}
