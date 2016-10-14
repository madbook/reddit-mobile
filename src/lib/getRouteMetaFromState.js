import { matchRoute } from '@r/platform/navigationMiddleware';

import routes from 'app/router';

export default state => {
  const currentPage = state.platform.currentPage;
  const { meta } = matchRoute(currentPage.url, routes);
  return meta;
};
