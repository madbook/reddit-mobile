import * as metaActions from 'app/actions/meta';

export const DEFAULT = {
  userAgent: '',
  country: '',
};

export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case metaActions.SET_META: {
      return action.meta;
    }

    default: return state;
  }
};
