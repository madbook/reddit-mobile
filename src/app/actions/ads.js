import { endpoints, models, requestUtils, errors } from '@r/api-client';
import uniqueId from 'lodash/uniqueId';

import config from 'config';
import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import isFakeSubreddit from 'lib/isFakeSubreddit';
import adLocationForPostRecords from 'lib/adLocationForPostRecords';


const { PostsEndpoint } = endpoints;
const { PostModel } = models;
const { rawSend } = requestUtils;
const { ResponseError } = errors;

export const FETCHING = 'FETCHING_AD';
export const fetching = (adId, postsListId) => ({
  type: FETCHING,
  adId,
  postsListId,
});

export const RECEIVED = 'RECEIVED_AD';
export const received = (adId, model) => ({
  type: RECEIVED,
  adId,
  model,
});

export const NO_AD = 'NO_AD';
export const noAd = adId => ({
  type: NO_AD,
  adId,
});

export const FAILED = 'FAILED_AD_FETCH';
export const failed = (adId, error) => ({
  type: FAILED,
  adId,
  error,
});

export const TRACKING_AD = 'TRACKING_AD';
export const tracking = adId => ({
  type: TRACKING_AD,
  adId,
});

export const track = adId => async (dispatch, getState) => {
  const state = getState();
  const adRequest = state.adRequests[adId];

  if (adRequest.impressionTracked) {
    return;
  }

  dispatch(tracking(adId));

  const post = state.posts[adRequest.ad.uuid];
  trackAdPost(post);
};

const IMPRESSION_PROPS = ['impPixel', 'adserverImpPixel'];
const trackAdPost = post => {
  IMPRESSION_PROPS.forEach(prop => {
    const pixel = new Image();
    pixel.src = post[prop];
  });
};

// For views that need to fetch ads, we need an id to track them.
// We could use the id of the view (e.g. postsLists have a postsListId),
// but maybe every view won't have an id like that or there might be collisions.
// To get around that we'll keep our own ad ids via lodash/uniqueId.
const nextAdId = () => (uniqueId('ad_'));

// Fetches an ad to render for a list of posts.
//
// We could look up page params from state, but having them passed in
// is more explicit and safer if the page were to change while we await.
export const fetchNewAdForPostsList = (postsListId, pageParams) =>
  async (dispatch, getState) => {
    const state = getState();
    const adRequest = state.adRequests[postsListId];
    if (adRequest && adRequest.loading) { return; }

    const adId = nextAdId();

    dispatch(fetching(adId, postsListId));

    const loadedState = getState();
    const postsList = loadedState.postsLists[postsListId];
    if (!postsList.results.length) {
      dispatch(failed(postsListId));
      return;
    }

    const { ad: specificAd } = pageParams.queryParams;
    if (specificAd) {
      await fetchSpecificAd(dispatch, loadedState, adId, specificAd);
      return;
    }

    await fetchAddBasedOnResults(dispatch, loadedState, adId, postsList, pageParams);
  };

export const fetchSpecificAd = async (dispatch, state, adId, specificAd) => {
  try {
    const byIdRequest = PostsEndpoint.get(apiOptionsFromState(state), { id: specificAd });
    const ad = byIdRequest.getModelFromRecord(byIdRequest.results[0]);
    dispatch(received(adId, ad));
  } catch (e) {
    if (e instanceof ResponseError) {
      dispatch(failed(adId, e));
    } else {
      throw e;
    }
  }
};

export const fetchAddBasedOnResults = async (dispatch, state, adId, postsList, pageParams) => {
  // I don't know what dt stands for but its the thingId's of all the posts
  // on the page.
  const dt = postsList.results.map(record => record.uuid);
  const site = getSite(pageParams);

  const data = {
    site,
    dt: dt.join(','),
    platform: 'mobile_web',
    placement: `feed-${adLocationForPostRecords(postsList.results)}`,
    raw_json: '1',
  };

  if (!state.session.accessToken) {
    // If the user is not logged in, send the loid in the promo request.
    // In theory loid should be set in a header as well now, but the endpoint
    // takes it as a parameter.
    data.loid = state.loid;
  }

  try {
    const ad = await getAd(apiOptionsFromState(state), data);
    if (ad === null) {
      return dispatch(noAd(adId));
    }
    
    dispatch(received(adId, ad));
  } catch (e) {
    if (e instanceof ResponseError) {
      dispatch(failed(adId, e));
    } else {
      throw e;
    }
  }
};

export const getAd = (apiOptions, data) => {
  // This could also go in api-client, but that doesn't seem like the right place
  // as its reddit-product specific.

  // This is a little ugly right now because of wrapping things in a promise.
  // that should be going away when TODO: we refactor rawSend, runForm, runQuery
  // to all be async or promise based. We want to use rawSend so we
  // get the app origin and headers handled correctly based on login status

  return new Promise((resolve, reject) => {
    // why is this a post??
    rawSend(apiOptions, 'post', config.adsPath, data, 'form', (err, res) => {
      if (err) {
        // A `status` of `undefined` or `0` means the request wasn't actually
        // finished (likely net::ERR_BLOCKED_BY_CLIENT). Normalize as `0`.
        // This is most likely caused by ad block.
        if (err.status === undefined) {
          err.status = 0;
        }
        // throw ResponseErrors for consistency with api-client errors
        return reject(new ResponseError(err, err.url));
      }

      if (!res.body || !res.body.data) {
        return resolve(null); // no-ad isn't an error so resolve null.
      }

      try {
        const postJSON = res.body.data;
        postJSON.url = postJSON.href_url;
        resolve(PostModel.fromJSON(postJSON));
      } catch (e) {
        // assume that if there's an error in parsing the model, that's due
        // to the api sending back a bad response. 1x and 3x both qualify
        // this as a response error so we will too for consistency
        reject(new ResponseError(e, config.adsPath));
      }
    });
  });
};

export const _FRONTPAGE_NAME = ' reddit.com'; // the space is intentional

export const getSite = pageParams => {
  // TODO this will need to support multi-reddits once they're in 2X

  const { subredditName } = pageParams.urlParams;
  if (subredditName && !isFakeSubreddit(subredditName)) {
    return subredditName;
  }

  return _FRONTPAGE_NAME;
};
