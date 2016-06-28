import 'babel-polyfill';
import React from 'react';
import Client from '@r/platform/Client';
import * as actions from '@r/platform/actions';
import { models } from '@r/api-client';
import isEmpty from 'lodash/isEmpty';

import { isLocalStorageAvailable } from '@r/redux-state-archiver';

import routes from 'app/router';
import App from 'app';
import reducers from 'app/reducers';
import Session from 'app/models/Session';

const client = Client({
  routes,
  reducers,
  modifyData: data => {
    // TODO if we start not using shell rendering in a serious way,
    // we'll need to unserialize all of the api models. This should
    // be considered when we debate using JSON output from the models
    // instead of the api model instances.

    if (!isEmpty(data.session)) {
      data.session = new Session(data.session);
      window.session = data.session;
    }

    data.preferences = models.Preferences.fromJSON(data.preferences);

    data.collapsedComments = {};

    if (isLocalStorageAvailable()) {
      try {
        data.collapsedComments = JSON.parse(window.localStorage.collapsedComments);
      } catch (e) { console.warn(e); }

      try {
        data.expandedPosts = JSON.parse(window.localStorage.expandedPosts);
      } catch (e) { console.warn(e); }
    }

    return data;
  },
  appComponent: <App/>,
  debug: true,
})();

client.dispatch(actions.activateClient());
