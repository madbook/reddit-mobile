import { requestUtils } from '@r/api-client';
import * as platformActions from '@r/platform/actions';
import { METHODS } from '@r/platform/router';

import { apiOptionsFromState } from '../../lib/apiOptionsFromState';

const { rawSend } = requestUtils;

const tryLoad = (url, apiOptions) => {
  return new Promise((resolve, reject) => {
    rawSend(apiOptions, 'head', url, {}, 'query', (err, res/*, req*/) => {
      if (err || !res || !res.ok) {
        reject(new Error('no response'));
      }

      resolve(true);
    });
  });
};

export const gotoLocation = (queriedLocation) => async (dispatch, getState) => {
  const apiOptions = apiOptionsFromState(getState());
  let location = queriedLocation;

  if (location.match(/.\/.+/)) {
    if (location.indexOf('/') !== 0) {
      location = `/${location}`;
    }

    if ([0,1].indexOf(location.indexOf('u/')) !== -1) {
      location = location.replace(/u\//, 'user/');
    }
  } else {
    location = `/r/${location}`;
  }

  try {
    await tryLoad(location, apiOptions);
    dispatch(platformActions.navigateToUrl(METHODS.GET, location, {}));
    return;
  } catch (e) {
    console.log(e, e.stack);
  }

  let locationQuery = queriedLocation;

  if (locationQuery.indexOf('/') !== -1) {
    locationQuery = this.query.location.split('/')[1];
  }

  const queryParams = { q: locationQuery };

  dispatch(platformActions.navigateToUrl(METHODS.GET, '/search', { queryParams }));
};
