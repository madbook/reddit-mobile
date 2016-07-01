import url from 'url';

import { endpoints, errors } from '@r/api-client';
import * as platformActions from '@r/platform/actions';

import { apiOptionsFromState } from 'lib/apiOptionsFromState';


const { PostsEndpoint } = endpoints;
const { ValidationError, BadCaptchaError} = errors;

export const FIELD_UPDATE = 'POSTING__FIELD_UPDATE';
export const CLOSE_CAPTCHA = 'POSTING__CLOSE_CAPTCHA';
export const SUBMIT_PENDING = 'POSTING__SUBMIT_PENDING';
export const SUBMIT_SUCCESS = 'POSTING__SUBMIT_SUCCESS';
export const SUBMIT_FAILURE = 'POSTING__SUBMIT_FAILURE';
export const SUBMIT_CAPTCHA_NEEDED = 'POSTING__SUBMIT_CAPTCHA_NEEDED';

export const updateField = (field, value) => ({ type: FIELD_UPDATE, field, value });
export const closeCaptcha = () => ({ type: CLOSE_CAPTCHA });

const META_KINDS = { self: 'text', link: 'url' };
export const submitPost = data => async (dispatch, getState) => {

  const meta_param = META_KINDS[data.kind];
  const body = {
    sr: data.sr,
    kind: data.kind,
    [meta_param]: data.meta,
    title: data.title,
    captcha: data.captchaText,
    iden: data.captchaIden,
    sendreplies: true,
    resubmit: false,
  };

  dispatch({ type: SUBMIT_PENDING });
  const apiOptions = apiOptionsFromState(getState());
  try {
    const { json } = await PostsEndpoint.post(apiOptions, body);
    dispatch({ type: SUBMIT_SUCCESS });
    dispatch(platformActions.navigateToUrl('get', url.parse(json.data.url).path));
  } catch (e) {
    // This is a bit hacky. Sometimes users can bypass the captcha. What we do
    // is allow a submission attempt and if we fail with a bad captcha error, we
    // simply show the captcha box. This also has the nice side effect of making
    // any mistyped captcha "refresh" when the submission fails.
    if (e instanceof BadCaptchaError) {
      dispatch({ type: SUBMIT_CAPTCHA_NEEDED, captchaIden: e.newCaptcha });
    } else if (e instanceof ValidationError) {
      dispatch({ type: SUBMIT_FAILURE, errors: e.errors });
    } else {
      throw e;
    }
  }
};
