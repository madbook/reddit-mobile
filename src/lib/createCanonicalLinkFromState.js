import { matchRoute } from 'platform/navigationMiddleware';
import values from 'lodash/values';
import config from 'config';

export const listingCanonical = (currentPage, state) => {
  const { subredditName } = currentPage.urlParams;
  const subreddit = state.subreddits[subredditName];

  if (subreddit) {
    return subreddit.url;
  }

  // we might not have a subreddit loaded because it is a multi-reddit. in that
  // case, we're going to make our best attempt at canonicalizing the url by
  // bulding a map of lowercased subreddit names to their canonicalized
  // versions. this map will pull the canonical subreddit names from our "Posts"
  // data.
  // NOTE: if there is a very obscure subreddit in the multi-reddit, we might
  // not have any posts loaded that are in that subreddit. meaning, our attempt
  // at canonicalization will fail. this is something we've accepted for now.
  const canonicalSubredditNames = values(state.posts).reduce((prev, post) => {
    if (post.subreddit) {
      prev[post.subreddit.toLowerCase()] = post.subreddit;
    }
    return prev;
  }, {});

  // split the multi-reddit and sort
  let divider = '';
  if (subredditName.indexOf('+') > -1) { // additive multi-reddit
    divider = '+';
  } else if (subredditName.indexOf('-') > -1) { // subtractive multi-reddit
    divider = '-';
  }

  // make sure we can actually understand the multi-reddit. if it's some other
  // format, just canonicalize it to the frontpage.
  if (divider) {
    const newName = subredditName
      .split(divider)
      .sort()
      .map(s => canonicalSubredditNames[s.toLowerCase()] || s)
      .join(divider);

    return `/r/${newName}/`;
  }

  // we don't know how to handle this url, probably because of an issue
  // getting data from the server (like a banned subbreddit), so give up.
  return null;
};

export const commentsCanonical = (currentPage, state) => {
  const { postId } = currentPage.urlParams;
  const post = state.posts[`t3_${postId}`];
  if (!post || !post.cleanPermalink) {
    // We were unable to get the info from the server, which probably means
    // the subreddit was banned or the like.
    return null;
  }
  return post.cleanPermalink;
};

export const userCanonical = currentPage => {
  const { userName } = currentPage.urlParams;
  return `/user/${userName}/`;
};

export const baseCanonical = currentPage => currentPage.url.endsWith('/')
  ? currentPage.url
  : `${currentPage.url}/`;

const CANONICAL_ROUTES = [
  // listings
  ['/r/:subredditName', listingCanonical],
  ['/r/:subredditName/about', listingCanonical],
  // comment pages
  ['/r/:subredditName/comments/:postId/comment/:commentId', commentsCanonical],
  ['/r/:subredditName/comments/:postId/:postTitle/:commentId', commentsCanonical],
  ['/r/:subredditName/comments/:postId/:postTitle?', commentsCanonical],
  ['/comments/:postId/:postTitle/:commentId', commentsCanonical],
  ['/comments/:postId/:postTitle?', commentsCanonical],
  // user pages
  ['/user/:userName/activity', userCanonical],
  ['/user/:userName/gild', userCanonical],
  ['/user/:userName/:savedOrHidden(saved|hidden)', userCanonical],
  ['/user/:userName', userCanonical],
  // catch-all
  ['*', baseCanonical],
];

export default state => {
  const currentPage = state.platform.currentPage;
  const { handler } = matchRoute(currentPage.url, CANONICAL_ROUTES);
  const route = handler(currentPage, state);
  return route ? `${config.reddit}${route}` : null;
};
