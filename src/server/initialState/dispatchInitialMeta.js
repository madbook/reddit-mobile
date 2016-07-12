import config from 'config';
import * as metaActions from 'app/actions/meta';

export const dispatchInitialMeta = async (ctx, dispatch) => {
  const meta = {
    userAgent: ctx.headers['user-agent'] || '',
    country: ctx.headers['cf-ipcountry'] || config.defaultCountry,
    env: 'SERVER', // overridden as 'CLIENT' in Client.js
  };

  dispatch(metaActions.setMeta(meta));
};
