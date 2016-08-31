import StatsdClient from 'statsd-client';

import config from 'config';
import errorLog from 'lib/errorLog';


let statsdConfig;
if (config.statsdHost) {
  statsdConfig = {
    host: config.statsdHost,
    port: config.statsdPort,
    debug: config.statsdDebug,
    prefix: config.statsdPrefix,
    socketTimeout: config.statsdSocketTimeout,
  };
}

const statsd = new StatsdClient(statsdConfig || {
  _socket: { send: ()=>{}, close: ()=>{} },
});

export default router => {
  router.use(async (ctx, next) => {
    statsd.increment('request');

    const start = Date.now();
    try {
      await next();
    } catch (e) {
      errorLog({
        error: `${e.name}: ${e.message}`,
        userAgent: 'SERVER',
      }, {
        hivemind: config.statsURL,
      });
    }
    const delta = Math.ceil(Date.now() - start);
    statsd.timing('response_time', delta);

    const status = ctx.response.status;
    statsd.increment(`response.${status}`);
  });
};
