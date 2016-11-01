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

  // Manually add user-agent header so we forward it on the server-side
  if (ctx.headers['user-agent']) {
    headers['user-agent'] = ctx.headers['user-agent'];
  }

  if (Object.keys(headers).length) {
    dispatch(apiRequestHeadersActions.set(headers));
  }
};
