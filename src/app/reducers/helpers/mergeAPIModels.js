import merge from '@r/platform/merge';

// given state thats is dictionary of <ModelId -> Model>, merge in a another dictionary
// of <ModelId -> Model>
export default function(state, newModels) {
  // pass `emptyDict: skip` so we don't update state if there were no updates
  return merge(state, newModels, { emptyDict: 'skip' });
}
