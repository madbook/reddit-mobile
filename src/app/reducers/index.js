import { models } from '@r/api-client';

import { apiResponseReducerMaker } from './apiResponse';
import accountRequests from './accountRequests';
import collapsedComments from './collapsedComments';
import commentsPages from './commentsPages';
import compact from './compact';
import loid from './loid';
import postsLists from './postsLists';
import session from './session';
import subscribedSubreddits from './subscribedSubreddits';
import subredditRequests from './subredditRequests';
import theme from './theme';
import user from './user';

const { ModelTypes } = models;

// todo, handle the plurarlity in api-client maybe?
const COMMENTS = `${ModelTypes.COMMENT}s`;
const POSTS = `${ModelTypes.POST}s`;
const SUBREDDITS = `${ModelTypes.SUBREDDIT}s`;
const ACCOUNTS = `${ModelTypes.ACCOUNT}s`;

export default {
  accountRequests,
  collapsedComments,
  commentsPages,
  compact,
  loid,
  postsLists,
  session,
  subscribedSubreddits,
  subredditRequests,
  theme,
  user,
  [ACCOUNTS]: apiResponseReducerMaker(ACCOUNTS),
  [COMMENTS]: apiResponseReducerMaker(COMMENTS),
  [POSTS]: apiResponseReducerMaker(POSTS),
  [SUBREDDITS]: apiResponseReducerMaker(SUBREDDITS),
};
