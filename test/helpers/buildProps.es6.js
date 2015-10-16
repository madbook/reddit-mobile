
import { ServerReactApp } from 'horse-react';

import mixin from '../../src/app-mixin';
import { buildProps } from '../../src/routes';


let App = mixin(ServerReactApp);

export default function () {
  let config = {};
  var app = new App(config);

  let ctx = {
    dataCache: {},
    route: {},
    headers: {},
  };

  return buildProps(ctx, app);
}
