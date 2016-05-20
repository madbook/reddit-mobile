import { models } from '@r/api-client';

import { apiResponseReducerMaker } from './apiResponse';
import accountRequests from './accountRequests';
import collapsedComments from './collapsedComments';
import commentsPages from './commentsPages';
import compact from './compact';
import loid from './loid';
import postsLists from './postsLists';
import session from './session';
import sessionRefresing from './sessionRefreshing';
import subscribedSubreddits from './subscribedSubreddits';
import subredditRequests from './subredditRequests';
import theme from './theme';
import user from './user';

const { ModelTypes } = models;
const { COMMENT, POST, SUBREDDIT, ACCOUNT } = ModelTypes;

export default {
  accountRequests,
  collapsedComments,
  commentsPages,
  compact,
  loid,
  postsLists,
  session,
  sessionRefresing,
  subscribedSubreddits,
  subredditRequests,
  theme,
  user,
  [`${ACCOUNT}s`]: apiResponseReducerMaker(ACCOUNT),
  [`${COMMENT}s`]: apiResponseReducerMaker(COMMENT),
  [`${POST}s`]: apiResponseReducerMaker(POST),
  [`${SUBREDDIT}s`]: apiResponseReducerMaker(SUBREDDIT),
};
