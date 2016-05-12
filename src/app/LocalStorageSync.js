import { makeLocalStorageArchiver } from '@r/redux-state-archiver';

const collapsedSelector = state => state.collapsedComments;
const combiner = (collapsedComments) => ({ collapsedComments });

export const LocalStorageSync = makeLocalStorageArchiver(
  collapsedSelector,
  combiner,
);
