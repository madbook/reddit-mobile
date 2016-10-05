import url from 'url';

import { endpoints, errors } from '@r/api-client';
import * as platformActions from '@r/platform/actions';

import { getEventTracker } from 'lib/eventTracker';
import { getBasePayload, buildSubredditData, convertId } from 'lib/eventUtils';
import { apiOptionsFromState } from 'lib/apiOptionsFromState';


const { PostsEndpoint } = endpoints;
const { ValidationError, BadCaptchaError } = errors;

export const FIELD_UPDATE = 'POSTING__FIELD_UPDATE';
export const CLOSE_CAPTCHA = 'POSTING__CLOSE_CAPTCHA';

export const PENDING = 'POSTING__PENDING';
export const SUCCESS = 'POSTING__SUCCESS';
export const FAILURE = 'POSTING__FAILURE';
export const VALIDATION_FAILURE = 'POSTING__VALIDATION_FAILURE';
export const CAPTCHA_NEEDED = 'POSTING__CAPTCHA_NEEDED';

export const updateField = (field, value) => ({ type: FIELD_UPDATE, field, value });
export const closeCaptcha = () => ({ type: CLOSE_CAPTCHA });

const META_KINDS = { self: 'text', link: 'url' };

// normalize error messages when possible
const ERROR_MESSAGES = {
  BAD_URL: 'Please enter a valid link.',
  NO_TEXT: 'You\'re missing text content.',
  SUBREDDIT_NOTALLOWED: 'You aren\'t allowed to post there.',
  NO_SELFS: 'This subreddit doesn\'t allow text posts.',
  NO_LINKS: 'This subreddit only allows text posts.',
};

export const submitPost = data => async (dispatch, getState) => {

  const meta_param = META_KINDS[data.kind];
  const body = {
    sr: data.sr,
    kind: data.kind,
    [meta_param]: data.meta,
    title: data.title,
    'g-recaptcha-response': data.gRecaptchaResponse,
    iden: data.captchaIden,
    sendreplies: true,
    resubmit: false,
  };

  dispatch({ type: PENDING });
  const apiOptions = apiOptionsFromState(getState());
  try {
    const { json } = await PostsEndpoint.post(apiOptions, body);
    dispatch({ type: SUCCESS });
    dispatch(platformActions.navigateToUrl('get', url.parse(json.data.url).path));

    logPost(data, json, getState());

  } catch (e) {
    // This is a bit hacky. Sometimes users can bypass the captcha. What we do
    // is allow a submission attempt and if we fail with a bad captcha error, we
    // simply show the captcha box. This also has the nice side effect of making
    // any mistyped captcha "refresh" when the submission fails.
    if (e instanceof BadCaptchaError) {
      dispatch({ type: CAPTCHA_NEEDED, captchaIden: e.newCaptcha });

    } else if (e instanceof ValidationError) {
      // The toaster can only fit one error comfortably and there's not much
      // room for making validation mistakes anyway so just grab the first one
      const error = e.errors[0];
      const message = ERROR_MESSAGES[error[0]];

      dispatch({
        message: message ? message : error[1],
        errors: e.errors,
        type: VALIDATION_FAILURE,
      });

    } else {
      dispatch({ type: FAILURE, errors: e.errors });
      throw e;
    }
  }
};

function logPost(data, resp, state) {
  const isLinkPost = data.kind === 'link';
  const metaKey = isLinkPost ? 'post_target_url' : 'post_body';

  getEventTracker().track('submit_events', 'cs.submit', {
    ...getBasePayload(state),
    ...buildSubredditData(state),
    [metaKey]: data.meta,
    post_target_domain: isLinkPost ? url.parse(data.meta).host : null,
    post_title: data.title,
    post_type: data.kind,
    post_id: convertId(resp.name),
    post_fullname: resp.name,
  });
}
