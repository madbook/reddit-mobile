import config from 'config';
import * as metaActions from 'app/actions/meta';

function getCrawler(ctx) {
  if (config.crawlerHeader) {
    return ctx.headers[config.crawlerHeader];
  }
  return null;
}

export const dispatchInitialMeta = async (ctx, dispatch) => {
  const meta = {
    userAgent: ctx.headers['user-agent'] || '',
    country: ctx.headers['cf-ipcountry'] || config.defaultCountry,
    crawler: getCrawler(ctx),
    domain: ctx.request.header.host,
    protocol: ctx.request.protocol,
    method: ctx.request.method,
    env: 'SERVER', // overridden as 'CLIENT' in Client.js
  };

  dispatch(metaActions.setMeta(meta));
};
