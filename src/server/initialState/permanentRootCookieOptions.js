import config from 'config';
import { permanentCookieOptions } from './permanentCookieOptions';

export const permanentRootCookieOptions = ctx => {
  const { host } = ctx.header || {};
  const options = permanentCookieOptions();

  if (host && host.indexOf('localhost') === -1) {
    options.domain = config.rootReddit;
  }
  
  return options;
};
