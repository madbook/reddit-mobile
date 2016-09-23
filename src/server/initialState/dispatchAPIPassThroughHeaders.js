import config from 'config';
import * as apiRequestHeadersActions from 'app/actions/apiRequestHeaders';

export default (ctx, dispatch) => {
  const headers = {};
  config.apiPassThroughHeaders.forEach(key => {
    const value = ctx.headers[key];
    if (value) {
      headers[key] = value;
    }
  });

  if (Object.keys(headers).length) {
    dispatch(apiRequestHeadersActions.set(headers));
  }
};
