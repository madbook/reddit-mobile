import { matchRoute } from '@r/platform/navigationMiddleware';

import config from 'config';

export const ampLink = (currentPage, state) => {
  const { postId } = currentPage.urlParams;
  const post = state.posts[`t3_${postId}`];
  if (!post || !post.cleanPermalink) {
    // We were unable to get the info from the server, which probably means
    // the subreddit was banned or the like.
    return null;
  }

  if (!post.isSelf) {
    // We only support AMP'd self posts.
    return null;
  }

  return post.cleanPermalink;
};

const AMP_ROUTES = [
  // comment pages
  ['/r/:subredditName/comments/:postId/comment/:commentId', ampLink],
  ['/r/:subredditName/comments/:postId/:postTitle/:commentId', ampLink],
  ['/r/:subredditName/comments/:postId/:postTitle?', ampLink],
  ['/comments/:postId/:postTitle/:commentId', ampLink],
  ['/comments/:postId/:postTitle?', ampLink],
  ['*', () => null],
];

export default state => {
  if (!config.amp) {
    return null;
  }

  const currentPage = state.platform.currentPage;
  const { handler } = matchRoute(currentPage.url, AMP_ROUTES);
  const path = handler(currentPage, state);
  return path ? `${config.amp}${path}` : null;
};
