import { models } from '@r/api-client';
import session from './session';
import { apiResponseReducerMaker } from './apiResponse';
import commentsPagesReducer from './commentsPages';
import compactReducer from './compact';
import postsListsReducer from './postsLists';
import subscribedSubredditsReducer from './subscribedSubreddits';
import themeReducer from './theme';
import collapsedCommentsReducer from './collapsedComments';

const { ModelTypes } = models;

// todo, handle the plurarlity in api-client maybe?
const COMMENTS = `${ModelTypes.COMMENT}s`;
const POSTS = `${ModelTypes.POST}s`;
const SUBREDDITS = `${ModelTypes.SUBREDDIT}s`;

export default {
  session,
  commentsPages: commentsPagesReducer,
  compact: compactReducer,
  postsLists: postsListsReducer,
  [COMMENTS]: apiResponseReducerMaker(COMMENTS),
  [POSTS]: apiResponseReducerMaker(POSTS),
  [SUBREDDITS]: apiResponseReducerMaker(SUBREDDITS),
  subscribedSubreddits: subscribedSubredditsReducer,
  theme: themeReducer,
  collapsedComments: collapsedCommentsReducer,
};
