function getTimes() {
  var performance = global.performance ||
                    global.webkitPerformance ||
                    global.msPerformance ||
                    global.mozPerformance;

  if (!performance || !performance.timing) {
    return;
  }

  var pt = performance.timing;

  var timings = {};

  function timing(key, start, end) {
    if (!pt[start] || !pt[end]) {
      return;
    }

    var startTime = pt[start] / 1000;
    var endTime = pt[end] / 1000;
    var duration = endTime - startTime;

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

export default getTimes;
