import { DEFAULT_API_TIMEOUT } from 'app/constants';

import makeRequest from './makeRequest';

// Sample 10% of users
const CLIENT_PERCENTAGE = 0.1;

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

export function makeTimingsRequest(timings) {
  // Send data to the timings endpoint and squelch any errors
  makeRequest
    .post('/timings')
    .timeout(DEFAULT_API_TIMEOUT)
    .send({
      rum: timings,
    })
    .then()
    .catch(() => {});
}

export function sendTimings(beginMount, endMount, isShell) {
  if (Math.random() > CLIENT_PERCENTAGE) {
    return;
  }

  if (isShell === undefined) {
    console.warn('Could not detect if session is shell rendered.');
    return;
  }

  const actionName = isShell ? 'm2.server.shell' : 'm2.server.seo';
  const timings = Object.assign({
    actionName,
    mountTiming: (endMount - beginMount) / 1000,
  }, getTimes());

  makeTimingsRequest(timings);
}

let initialLoad = true;
export function onHandlerCompleteTimings(data) {
  // Only do this on the initalPage load for now as subsequent ones may be cached
  if (!initialLoad) { return; }
  initialLoad = false;

  if (Math.random() > CLIENT_PERCENTAGE) { return; }

  if (!data) { return; }
  const { meta, duration } = data;

  if (!meta || !meta.name) { return; }
  const { name } = meta;

  const actionName = `m2.client.${name}`;
  const timings = {
    actionName,
    routeTiming: duration / 1000,
  };
  makeTimingsRequest(timings);
}
