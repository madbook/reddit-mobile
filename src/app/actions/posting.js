import { endpoints } from '@r/api-client';

const { PostsEndpoint } = endpoints;

export const SUBREDDIT_SELECT = 'POSTING__SUBREDDIT_SELECT';
export const FIELD_UPDATE = 'POSTING__FIELD_UPDATE';
export const SUBMIT_PENDING = 'POSTING__SUBMIT_PENDING';
export const SUBMIT_SUCCESS = 'POSTING__SUBMIT_SUCCESS';
export const SUBMIT_FAILURE = 'POSTING__SUBMIT_FAILURE';

export const updateField = (field, value) => ({ type: FIELD_UPDATE, field, value });

export const submitPost = data => async (dispatch) => {
  // TODO: hardcode this so I don't accidentally post anywhere else
  data.sr = 'PhilTestSubreddit';
  data.sendreplies = true;
  data.resubmit = true;     // how to handle these?

  // TODO: captcha?
  // captcha - user's response to captcha challenge
  // iden    - id of captcha

  dispatch({ type: SUBMIT_PENDING });
  const response = await PostsEndpoint.post(data);

  if (response.errors) {
    dispatch({ type: SUBMIT_FAILURE, errors: response.errors });
  } else {
    dispatch({ type: SUBMIT_PENDING });
  }
};
