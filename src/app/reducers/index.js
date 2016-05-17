import { models } from '@r/api-client';

import session from './session';
import { apiResponseReducerMaker } from './apiResponse';
import commentsPages from './commentsPages';
import compact from './compact';
import postsLists from './postsLists';
import subscribedSubreddits from './subscribedSubreddits';
import subredditRequests from './subredditRequests';
import theme from './theme';
import collapsedComments from './collapsedComments';

const { ModelTypes } = models;

// todo, handle the plurarlity in api-client maybe?
const COMMENTS = `${ModelTypes.COMMENT}s`;
const POSTS = `${ModelTypes.POST}s`;
const SUBREDDITS = `${ModelTypes.SUBREDDIT}s`;

export default {
  session,
  commentsPages,
  compact,
  postsLists,
  theme,
  collapsedComments,
  subscribedSubreddits,
  subredditRequests,
  [COMMENTS]: apiResponseReducerMaker(COMMENTS),
  [POSTS]: apiResponseReducerMaker(POSTS),
  [SUBREDDITS]: apiResponseReducerMaker(SUBREDDITS),
};
