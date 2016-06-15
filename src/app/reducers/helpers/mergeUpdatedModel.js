import merge from '@r/platform/merge';

// given an action, merges the model from it into state
export default function(state, action, { restrictType }={}) {
  const { model } = action;

  // if a restrictType is passed, only update state if the model is of that type
  if (!restrictType || model.type === restrictType) {
    return merge(state, { [model.uuid]: model });
  }

  return state;
}
