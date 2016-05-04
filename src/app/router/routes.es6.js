import PostsFromSubredditHandler from './handlers/PostsFromSubredditHandler';
import Login from './handlers/Login';

export default [
  ['/', PostsFromSubredditHandler],
  ['/r/:subredditName', PostsFromSubredditHandler],
  ['/u/:user/m/:multi', PostsFromSubredditHandler],
  ['/login', Login],
];
