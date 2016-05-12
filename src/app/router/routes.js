import CommentsPageHandler from './handlers/CommentsPage';
import CommunityGotoActionHandler from './handlers/CommunityGotoAction';
import PostsFromSubredditHandler from './handlers/PostsFromSubreddit';
import Login from './handlers/Login';
import OverlayMenuCompactToggleHandler from './handlers/OverlayMenuCompactToggle';
import OverlayMenuThemeToggleHandler from './handlers/OverlayMenuThemeToggle';
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

  // actions
  ['/vote/:thingId', Vote],
  ['/actions/community-goto', CommunityGotoActionHandler],
  ['/actions/overlay-compact-toggle', OverlayMenuCompactToggleHandler],
  ['/actions/overlay-theme-toggle', OverlayMenuThemeToggleHandler],
];
