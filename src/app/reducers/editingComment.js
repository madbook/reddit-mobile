import * as commentActions from 'app/actions/comment';

const DEFAULT = null;

export default function editingComment(state=DEFAULT, action={}) {
  switch (action.type) {
    case commentActions.TOGGLE_EDIT_FORM: {
      if (action.id) { return state === action.id ? DEFAULT : action.id; }
      return DEFAULT;
    }
    default: return state;
  }
}
