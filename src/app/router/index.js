import CommentsPageHandler from './handlers/CommentsPage';
import CommunityGotoActionHandler from './handlers/CommunityGotoAction';
import PostsFromSubredditHandler from './handlers/PostsFromSubreddit';
import Login from './handlers/Login';
import Register from './handlers/Register';
import OverlayMenuCompactToggleHandler from './handlers/OverlayMenuCompactToggle';
import OverlayMenuThemeToggleHandler from './handlers/OverlayMenuThemeToggle';
import ReportHandler from './handlers/ReportHandler';
import SavedAndHiddenHandler from './handlers/SavedAndHidden';
import SearchPageHandler from './handlers/SearchPage';
import SetOver18Handler from './handlers/SetOver18';
import SubredditAboutPageHandler from './handlers/SubredditAboutPage';
import ToggleSubredditSubscriptionHandler from './handlers/ToggleSubredditSubscription';
import UserActivityHandler from './handlers/UserActivity';
import UserProfilerHandler from './handlers/UserProfile';
import DirectMessage from './handlers/DirectMessage';
import Messages from './handlers/Messages';
import Vote from './handlers/Vote';
import WikiPageHandler from './handlers/WikiPage';
import { PostSubmitHandler, PostSubmitCommunityHandler } from './handlers/PostSubmit';
import Status404PageHandler from './handlers/Status404Page';

/* eslint-disable max-len */
export default [
  ['/', PostsFromSubredditHandler, { name: 'index' }],
  ['/r/:subredditName', PostsFromSubredditHandler, { name: 'listing' }],
  ['/u/:user/m/:multi', PostsFromSubredditHandler, { name: 'listing' }],
  ['/r/:subredditName/comments/:postId/comment/:commentId', CommentsPageHandler, { name: 'comments' }],
  ['/r/:subredditName/comments/:postId/:postTitle/:commentId', CommentsPageHandler, { name: 'comments' }],
  ['/r/:subredditName/comments/:postId/:postTitle?', CommentsPageHandler, { name: 'comments' }],
  ['/search', SearchPageHandler],
  ['/r/:subredditName/search', SearchPageHandler],
  ['/r/:subredditName/about', SubredditAboutPageHandler],
  ['/r/:subredditName/(w|wiki)/:path(.*)?', WikiPageHandler],
  ['/(help|w|wiki)/:path(.*)?', WikiPageHandler],
  ['/comments/:postId/:postTitle/:commentId', CommentsPageHandler, { name: 'comments' }],
  ['/comments/:postId/:postTitle?', CommentsPageHandler, { name: 'comments' }],
  ['/comments', CommentsPageHandler],
  ['/u/:userName/activity', UserActivityHandler],
  ['/u/:userName/gild', UserProfilerHandler],
  ['/u/:userName/:savedOrHidden(saved|hidden)', SavedAndHiddenHandler],
  ['/u/:userName', UserProfilerHandler, { name: 'user' }],
  ['/login', Login],
  ['/register', Register],
  ['/message/compose', DirectMessage],
  ['/message/:mailType', Messages],
  ['/report', ReportHandler],
  ['/r/:subredditName/submit', PostSubmitHandler],
  ['/submit', PostSubmitHandler],
  ['/submit/to_community', PostSubmitCommunityHandler],

  // actions
  ['/vote/:thingId', Vote],
  ['/actions/community-goto', CommunityGotoActionHandler],
  ['/actions/overlay-compact-toggle', OverlayMenuCompactToggleHandler],
  ['/actions/overlay-theme-toggle', OverlayMenuThemeToggleHandler],
  ['/actions/setOver18', SetOver18Handler],
  ['/actions/toggle-subreddit-subscription', ToggleSubredditSubscriptionHandler],
  ['*', Status404PageHandler],
];
/* eslint-enable */
