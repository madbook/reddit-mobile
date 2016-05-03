import Frontpage from './handlers/Frontpage';
import Login from './handlers/Login';

export default [
  ['/', Frontpage],
  ['/r/:subredditName', Frontpage],
  ['/login', Login],
];
