import { ServerReactApp } from '@r/horse-react';

import mixin from '../../src/app-mixin';
import { buildProps } from '../../src/routes';


const App = mixin(ServerReactApp);

export default function () {
  const config = {};
  const app = new App(config);

  const ctx = {
    dataCache: {},
    route: {},
    headers: {},
  };

  return buildProps(ctx, app);
}
