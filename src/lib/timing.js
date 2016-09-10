import { DEFAULT_API_TIMEOUT } from 'app/constants';

import makeRequest from './makeRequest';

export function getTimes() {
  const performance = global.performance ||
                    global.webkitPerformance ||
                    global.msPerformance ||
                    global.mozPerformance;

  if (!performance || !performance.timing) {
    return;
  }

  const pt = performance.timing;

  const timings = {};

  function timing(key, start, end) {
    if (!pt[start] || !pt[end]) {
      return;
    }

    const startTime = pt[start] / 1000;
    const endTime = pt[end] / 1000;
    const duration = endTime - startTime;

    if (duration === 0) {
      return;
    }

    timings[key] = duration;
  }

  timing('redirectTiming', 'redirectStart', 'redirectEnd');
  timing('startTiming', 'fetchStart', 'domainLookupStart');
  timing('dnsTiming', 'domainLookupStart', 'domainLookupEnd');
  timing('tcpTiming', 'connectStart', 'connectEnd');
  timing('httpsTiming', 'secureConnectionStart', 'connectEnd');
  timing('requestTiming', 'requestStart', 'responseStart');
  timing('responseTiming', 'responseStart', 'responseEnd');
  timing('domLoadingTiming', 'domLoading', 'domInteractive');
  timing('domInteractiveTiming', 'domInteractive', 'domContentLoadedEventStart');
  timing('domContentLoadedTiming', 'domContentLoadedEventStart', 'domContentLoadedEventEnd');

  return timings;
}

export function sendTimings(beginRender) {
  if (Math.random() > 0.1) { // 10% of requests
    return;
  }

  const actionName = 'm2.server.shell';

  const timings = Object.assign({
    actionName,
  }, getTimes());

  timings.mountTiming = (Date.now() - beginRender) / 1000;

  makeRequest
    .post('/timings')
    .timeout(DEFAULT_API_TIMEOUT)
    .send({
      rum: timings,
    })
    .then();
}
