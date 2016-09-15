import StatsdClient from 'statsd-client';

import config from 'config';
import errorLog from 'lib/errorLog';

let activeRequests = 0;

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

// Check in with the statsd server every 10 seconds with how many
// active requests this instance is handling. If all instances do
// the same in the same time windows, then we'll have the right info.
setInterval(() => {
  statsd.increment('activeRequests', activeRequests);
}, 10000);

export default router => {
  router.use(async (ctx, next) => {
    statsd.increment('request');
    activeRequests += 1;

    const start = Date.now();

    try {
      await next();
    } catch (error) {
      errorLog({
        error,
        requestUrl: ctx.request.url,
        userAgent: 'SERVER',
      }, {
        hivemind: config.statsURL,
      });
    }

    const delta = Math.ceil(Date.now() - start);
    statsd.timing('response_time', delta);

    activeRequests -= 1;
    const status = ctx.response.status;
    statsd.increment(`response.${status}`);
  });
};
