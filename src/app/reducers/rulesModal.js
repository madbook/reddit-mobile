import * as rulesModalActions from 'app/actions/rulesModal';

const DEFAULT = {};

export default function (state=DEFAULT, action={}) {
  switch (action.type) {
    case rulesModalActions.RULES_MODAL_ACCEPTED: {
      const { featureName, subredditName } = action;
      const key = rulesModalActions.getLocalStorageKey(featureName, subredditName);
      return {
        [key]: true,
        ...state,
      };
    }

    default: return state;
  }
}
