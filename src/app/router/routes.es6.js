import CommentsPageHandler from './handlers/CommentsPageHandler';
import PostsFromSubredditHandler from './handlers/PostsFromSubredditHandler';
import Login from './handlers/Login';
import Vote from './handlers/Vote';

export default [
  ['/', PostsFromSubredditHandler],
  ['/r/:subredditName', PostsFromSubredditHandler],
  ['/u/:user/m/:multi', PostsFromSubredditHandler],
  ['/r/:subredditName/comments/:postId/comment/:commentId', CommentsPageHandler],
  ['/r/:subredditName/comments/:postId/:postTitle/:commentId', CommentsPageHandler],
  ['/r/:subredditName/comments/:postId/:postTitle?', CommentsPageHandler],
  ['/comments/:postId/:postTitle?', CommentsPageHandler],
  ['/login', Login],
  ['/vote/:thingId', Vote],
];
